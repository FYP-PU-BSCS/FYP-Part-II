from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from marshmallow import ValidationError
from app.extensions import db
from app.models import Child, User, Vaccination
from app.schemas.child_schema import ChildRegisterSchema, ChildUpdateSchema
from app.utils.decorators import role_required
from app.utils.audit_helper import log_audit
import uuid

child_bp = Blueprint('child', __name__)
register_schema = ChildRegisterSchema()
update_schema = ChildUpdateSchema()


@child_bp.route('/register', methods=['POST'])
@jwt_required()
@role_required('Team')
def register_child():
    data = request.get_json() or {}
    
    if not data.get('full_name'):
        return jsonify({'success': True, 'message': 'Handled duplicate request'}), 200

    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 401
        
        data['area'] = user.area
        
        try:
            val_data = register_schema.load(data)
        except ValidationError as err:
            return jsonify({'success': False, 'errors': err.messages}), 400

        child_id = data.get('db_id')
        child = Child.query.get(child_id) if child_id else None
        
        now_utc = datetime.now(timezone.utc)

        if child:
            child.full_name = val_data.get('full_name', child.full_name)
            child.father_name = val_data.get('father_name', child.father_name)
            child.date_of_birth = val_data.get('date_of_birth', child.date_of_birth)
            child.gender = val_data.get('gender', child.gender)
            child.phone_number = val_data.get('phone', child.phone_number)
            child.age_category = val_data.get('category', child.age_category)
            child.house_number = val_data.get('house_number', child.house_number)
            child.street_number = val_data.get('street_number', child.street_number)
            child.updated_at = now_utc
            message = "Record updated successfully"
        else:
            child = Child(
                mobile_id=str(uuid.uuid4()),
                custom_id=f"CH-{str(uuid.uuid4())[:8]}",
                full_name=val_data['full_name'],
                father_name=val_data.get('father_name'),
                date_of_birth=val_data.get('date_of_birth'),
                gender=val_data.get('gender', 'Male'),
                phone_number=val_data.get('phone'),
                age_category=val_data.get('category', 'Between 1 - 5 years'),
                area=user.area,
                house_number=val_data.get('house_number', 'N/A'),
                street_number=val_data.get('street_number', 'N/A'),
                registered_by=current_user_id,
                assigned_team=user.area,
                vaccination_status=data.get('vaccination_status', 'pending').lower(),
                created_at=now_utc,
                updated_at=now_utc
            )
            db.session.add(child)
            message = "Child registered successfully"

        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': message,
            'child': child.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"ERROR in register_child: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@child_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_children():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User session expired'}), 401
        
        query = Child.query
        
        if user.role == 'Team':
            query = query.filter_by(assigned_team=user.area)
        elif user.role == 'Area Incharge':
            if user.area:
                query = query.filter_by(area=user.area)

        children = query.order_by(Child.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'children': [child.to_dict() for child in children]
        }), 200
    except Exception as e:
        print(f"ERROR in get_all_children: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@child_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_registry_stats():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 401
        
        query = Child.query
        
        if user.role == 'Team':
            query = query.filter_by(assigned_team=user.area)
        elif user.role == 'Area Incharge':
            if user.area:
                query = query.filter_by(area=user.area)
        
        stats_data = {
            'vaccinated': query.filter_by(vaccination_status='vaccinated').count(),
            'refusals': query.filter_by(vaccination_status='refused').count(),
            'missed': query.filter_by(vaccination_status='missed').count(),
            'pending': query.filter_by(vaccination_status='pending').count(),
            'total': query.count()
        }

        return jsonify({
            'success': True,
            'stats': stats_data
        }), 200
    except Exception as e:
        print(f"ERROR in get_registry_stats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@child_bp.route('/mark-visit', methods=['POST'])
@jwt_required()
@role_required('Team')
def mark_visit():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        status_val = data.get('status')
        if not status_val:
            return jsonify({'success': False, 'message': 'Status is required'}), 400
        status_val = status_val.lower()
        
        reason_val = data.get('reason')
        child_id_param = data.get('child_id')
        
        if not child_id_param:
            return jsonify({'success': False, 'message': 'Child ID is required'}), 400
        
        now_utc = datetime.now(timezone.utc)
        
        child = None
        if str(child_id_param).isdigit():
            child = Child.query.filter(
                Child.custom_id.like(f'%-{child_id_param}')
            ).first()
        
        if not child:
            child = Child.query.get(child_id_param)
        
        if not child:
            return jsonify({
                'success': False, 
                'message': f'Child not found with id: {child_id_param}'
            }), 404

        child.vaccination_status = status_val
        child.visit_count = (child.visit_count or 0) + 1
        child.updated_at = now_utc
        
        if status_val == 'refused':
            child.refusal_reason = reason_val
        elif status_val == 'vaccinated':
            child.refusal_reason = None

        new_record = Vaccination(
            mobile_id=str(uuid.uuid4()),
            child_id=child.id,
            status=status_val,
            refusal_reason=reason_val if status_val == 'refused' else None,
            dose_number=child.visit_count,
            administered_by=current_user_id,
            sync_status='synced',
            created_at=now_utc,
            updated_at=now_utc
        )
        db.session.add(new_record)
        db.session.commit()
        
        log_audit(
            user_id=current_user_id,
            action="UPDATE",
            entity="Child",
            entity_id=child.id,
            new_data={'vaccination_status': status_val, 'visit_count': child.visit_count}
        )
        
        return jsonify({
            'success': True,
            'child': child.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"ERROR in mark_visit: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@child_bp.route('/triage', methods=['GET'])
@jwt_required()
def get_triage_data():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 401
        
        query = Child.query.filter(Child.vaccination_status.in_(['refused', 'missed']))
        
        if user.role == 'Team':
            query = query.filter_by(assigned_team=user.area)
        elif user.role == 'Area Incharge':
            if user.area:
                query = query.filter_by(area=user.area)

        children = query.order_by(
            Child.vaccination_status.desc(),
            Child.created_at.desc()
        ).all()
        
        return jsonify({
            'success': True,
            'children': [child.to_dict() for child in children]
        }), 200
        
    except Exception as e:
        print(f"ERROR in get_triage_data: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ========== DELETE CHILD ENDPOINT (MUST BE OUTSIDE ANY FUNCTION) ==========
@child_bp.route('/delete/<string:child_id>', methods=['DELETE'])
@jwt_required()
@role_required('Team', 'Area Incharge', 'UCMO', 'Administrator')
def delete_child(child_id):
    """Delete a child record and all associated data (vaccinations, certificates)"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Find child by UUID
        child = Child.query.get(child_id)
        
        if not child:
            return jsonify({'success': False, 'message': 'Child not found'}), 404
        
        # Log audit before deletion
        log_audit(
            user_id=current_user_id,
            action="DELETE",
            entity="Child",
            entity_id=child.id,
            old_data=child.to_dict(),
            new_data=None
        )
        
        # Delete child (cascade will delete vaccinations and certificates)
        db.session.delete(child)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Child record deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in delete_child: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500