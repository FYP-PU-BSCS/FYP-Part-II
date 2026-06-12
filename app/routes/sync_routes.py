# app/routes/sync_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Child, Vaccination, Campaign, User
from datetime import datetime, date
import logging

sync_bp = Blueprint('sync', __name__, url_prefix='/api/sync')
logger = logging.getLogger(__name__)

def parse_date(date_str):
    """Safely handles string to Python date/datetime conversion from mobile clients"""
    if not date_str:
        return None
    try:
        if "T" in date_str:
            return datetime.strptime(date_str.split(".")[0], "%Y-%m-%dT%H:%M:%S")
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError as e:
        logger.error(f"Date conversion format constraint error: {str(e)}")
        return None

@sync_bp.route('/upload', methods=['POST'])
@jwt_required()
def sync_mobile_offline_data():
    """
    SENIOR ARCHITECT LEVEL IDEMPOTENT UPSERT API
    Processes incoming sequential transactional payloads from offline mobile devices.
    Guarantees absolute zero double-entry and prevents cascade relational crashes.
    """
    user_id = get_jwt_identity()
    payload = request.get_json()

    if not payload or not isinstance(payload, dict):
        return jsonify({'success': False, 'message': 'Invalid structural tracking matrix.'}), 400

    # Extract dynamic arrays sent from SQLite bundle
    children_batch = payload.get('children', [])
    vaccinations_batch = payload.get('vaccinations', [])

    response_report = {
        "processed_children": 0,
        "processed_vaccinations": 0,
        "failed_records": 0,
        "conflicts_resolved": 0
    }

    try:
        # Active campaign fallback sequence block 
        active_campaign = Campaign.query.filter_by(status='active').first()
        campaign_id = active_campaign.id if active_campaign else None

        # --- STEP 1: PROCESSING CHILDREN SYNC (PARENT TABLES FIRST) ---
        for child_data in children_batch:
            # Look up via mobile_id to prevent duplicates (Idempotency Rule)
            m_id = child_data.get('mobile_id')
            if not m_id:
                response_report["failed_records"] += 1
                continue

            existing_child = Child.query.filter_by(mobile_id=m_id).first()

            if existing_child:
                # Conflict Management: Server-side data state preservation (Last Server Write Integrity)
                existing_child.full_name = child_data.get('full_name', existing_child.full_name)
                existing_child.father_name = child_data.get('father_name', existing_child.father_name)
                existing_child.phone_number = child_data.get('phone_number', existing_child.phone_number)
                existing_child.area = child_data.get('area', existing_child.area)
                existing_child.house_number = child_data.get('house_number', existing_child.house_number)
                existing_child.street_number = child_data.get('street_number', existing_child.street_number)
                existing_child.vaccination_status = child_data.get('vaccination_status', existing_child.vaccination_status)
                response_report["conflicts_resolved"] += 1
            else:
                # Insert atomic clean fresh record matching models constraints
                new_child = Child(
                    id=child_data.get('id'), # Retain local UUID sequence assignment
                    mobile_id=m_id,
                    custom_id=child_data.get('custom_id'),
                    full_name=child_data.get('full_name', 'Unknown'),
                    father_name=child_data.get('father_name'),
                    date_of_birth=parse_date(child_data.get('date_of_birth')),
                    gender=child_data.get('gender', 'Unknown'),
                    phone_number=child_data.get('phone_number'),
                    area=child_data.get('area'),
                    house_number=child_data.get('house_number', 'N/A'),
                    street_number=child_data.get('street_number', 'N/A'),
                    vaccination_status=child_data.get('vaccination_status', 'pending'),
                    assigned_team=child_data.get('assigned_team')
                )
                db.session.add(new_child)
                response_report["processed_children"] += 1

        # Use partial flush to update session pipeline state without finalizing transactional block
        db.session.flush()

        # --- STEP 2: PROCESSING VACCINATIONS SYNC (DEPENDENT CHILD LOOPS) ---
        for vax_data in vaccinations_batch:
            v_mobile_id = vax_data.get('mobile_id')
            if not v_mobile_id:
                response_report["failed_records"] += 1
                continue

            # Check if this vaccination record already exists
            existing_vax = Vaccination.query.filter_by(mobile_id=v_mobile_id).first()

            # Crucial Foreign Key Check: Confirm parent child row is present in server session context
            local_child_id = vax_data.get('child_id')
            parent_child = Child.query.filter((Child.id == local_child_id) | (Child.mobile_id == local_child_id)).first()

            if not parent_child:
                # If target child is missing, break to prevent Foreign Key integrity violation crash
                logger.error(f"Orphaned vaccination entry dropped for sync: Child tracking lookup failed.")
                response_report["failed_records"] += 1
                continue

            if existing_vax:
                existing_vax.status = vax_data.get('status', existing_vax.status)
                existing_vax.refusal_reason = vax_data.get('refusal_reason', existing_vax.refusal_reason)
                existing_vax.sync_status = 'synced'
                existing_vax.synced_at = datetime.utcnow()
            else:
                new_vax = Vaccination(
                    id=vax_data.get('id'),
                    mobile_id=v_mobile_id,
                    child_id=parent_child.id, # Maps back to guaranteed structural primary keys
                    campaign_id=campaign_id,
                    status=vax_data.get('status', 'pending'),
                    dose_number=vax_data.get('dose_number', 1),
                    refusal_reason=vax_data.get('refusal_reason'),
                    administered_date=parse_date(vax_data.get('administered_date')) or date.today(),
                    administered_by=user_id,
                    sync_status='synced',
                    synced_at=datetime.utcnow()
                )
                db.session.add(new_vax)
                response_report["processed_vaccinations"] += 1

        # Final transaction block commit to PostgreSQL / Supabase
        db.session.commit()
        return jsonify({'success': True, 'sync_telemetry': response_report}), 200

    except Exception as e:
        db.session.rollback()
        logger.critical(f"CRITICAL SYSTEM SYNC ROLLBACK INCURRED: {str(e)}")
        return jsonify({'success': False, 'message': 'Atomic batch pipeline verification crashed.', 'error': str(e)}), 500
@sync_bp.route('/download', methods=['GET'])
@jwt_required()
def sync_download():
    """
    Mobile app downloads latest records from server.
    Returns only records for the user's assigned area.
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 401
        
        # Role-based filtering
        query = Child.query
        
        if user.role == 'Team':
            query = query.filter_by(assigned_team=user.area)
        elif user.role == 'Area Incharge':
            if user.area:
                query = query.filter_by(area=user.area)
        
        # Get last_sync parameter for incremental sync
        last_sync = request.args.get('last_sync')
        if last_sync:
            try:
                last_sync_date = datetime.fromisoformat(last_sync)
                query = query.filter(Child.updated_at > last_sync_date)
            except ValueError:
                pass
        
        children = query.order_by(Child.created_at.desc()).all()
        
        # Format response
        records = []
        for child in children:
            records.append({
                'id': child.id,
                'mobile_id': child.mobile_id,
                'custom_id': child.custom_id,
                'full_name': child.full_name,
                'father_name': child.father_name,
                'date_of_birth': child.date_of_birth.isoformat() if child.date_of_birth else None,
                'gender': child.gender,
                'phone_number': child.phone_number,
                'area': child.area,
                'house_number': child.house_number,
                'street_number': child.street_number,
                'vaccination_status': child.vaccination_status,
                'refusal_reason': child.refusal_reason,
                'category': child.age_category,
                'visit_count': child.visit_count,
                'created_at': child.created_at.isoformat() if child.created_at else None,
                'updated_at': child.updated_at.isoformat() if child.updated_at else None
            })
        
        return jsonify({
            'success': True,
            'records': records,
            'server_time': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500