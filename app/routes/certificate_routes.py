from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Certificate, Child, User
from app.utils.decorators import role_required
from app.extensions import db
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from datetime import datetime
import uuid

certificate_bp = Blueprint('certificate', __name__)


@certificate_bp.route('/sync-eligible', methods=['POST'])
@jwt_required()
@role_required('Team', 'Area Incharge', 'UCMO', 'Administrator')
def sync_eligible_certificates():
    try:
        current_user_id = int(get_jwt_identity())
        if hasattr(Certificate, 'auto_generate_for_eligible'):
            Certificate.auto_generate_for_eligible(current_user_id)
            db.session.commit()
            return jsonify({'success': True, 'message': 'National registry synchronized.'}), 200
        return jsonify({'success': False, 'message': 'Sync method missing'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@certificate_bp.route('/list', methods=['GET'])
@jwt_required()
def get_all_certificates():
    try:
        search_query = request.args.get('search', '')
        query = Certificate.query.options(
            joinedload(Certificate.child).joinedload(Child.vaccinations)
        ).join(Child)

        if search_query:
            query = query.filter(or_(
                Child.full_name.ilike(f'%{search_query}%'),
                Certificate.certificate_number.ilike(f'%{search_query}%')
            ))

        certificates = query.order_by(Certificate.certificate_date.desc()).all()
        return jsonify({
            'success': True,
            'certificates': [c.to_dict() for c in certificates]
        }), 200
    except Exception as e:
        print(f"ERROR in list: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@certificate_bp.route('/add', methods=['POST'])
@jwt_required()
@role_required('Team', 'Area Incharge', 'UCMO', 'Administrator')
def add_manual_certificate():
    try:
        data = request.get_json()
        current_user_id = int(get_jwt_identity())
        
        print(f"DEBUG: Received data: {data}")
        
        # Frontend sends 'child_id' but it's actually the certificate number
        # The actual child UUID is not being sent - need to find child by name or other means
        
        # Option 1: If child_id is provided and looks like a UUID, use it
        child_id = data.get('child_id')
        child = None
        
        if child_id and len(child_id) == 36 and '-' in child_id:
            child = Child.query.get(child_id)
        
        # Option 2: If not found, try to find child by name from the data
        if not child and data.get('name'):
            child = Child.query.filter_by(full_name=data.get('name')).first()
        
        if not child:
            return jsonify({
                'success': False, 
                'message': 'Child not found. Please ensure the child exists in the registry.'
            }), 404

        # Check if certificate already exists for this child
        existing = Certificate.query.filter_by(child_id=child.id).first()
        if existing:
            return jsonify({
                'success': False, 
                'message': f'Certificate already exists for {child.full_name}'
            }), 400

        new_cert = Certificate(
            certificate_number=data.get('id') or Certificate.generate_certificate_number(),
            child_id=child.id,
            issued_by=current_user_id,
            certificate_date=datetime.utcnow().date(),
            status='active',
            issued_area=child.area or 'National',
            issued_team=child.assigned_team or 'Registry'
        )
        
        db.session.add(new_cert)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Manual certificate added', 
            'certificate': new_cert.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in add: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@certificate_bp.route('/delete/<string:cert_id>', methods=['DELETE'])
@jwt_required()
@role_required('Team', 'Area Incharge', 'UCMO', 'Administrator')
def delete_certificate(cert_id):
    try:
        certificate = Certificate.query.filter_by(certificate_number=cert_id).first()
        
        if not certificate:
            return jsonify({'success': False, 'message': 'Record not found'}), 404

        db.session.delete(certificate)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Record deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500