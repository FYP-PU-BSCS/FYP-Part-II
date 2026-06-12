from datetime import datetime
import traceback
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import UserSignupSchema
from app.utils.audit_helper import log_audit  

auth_bp = Blueprint('auth', __name__)
signup_schema = UserSignupSchema()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # 1. Map frontend role to DB role BEFORE validation
        if data.get('role') == "AreaIncharge":
            data['role'] = "Area Incharge"
        
        # 2. Marshmallow Validation
        errors = signup_schema.validate(data)
        if errors:
            return jsonify({
                'success': False, 
                'message': 'Validation failed', 
                'errors': errors
            }), 400

        input_role = data.get('role')
        input_cnic = data.get('cnic', '').strip()
        input_area = data.get('area')
        input_password = data.get('password')

        # 3. Check Pre-Authorization
        user = User.query.filter_by(cnic=input_cnic).first()
        
        if not user:
            return jsonify({'success': False, 'message': 'This CNIC is not authorized.'}), 403

        #  Handle returning users 
        if user.is_verified:
            # If user already exists, check if password matches
            if user.check_password(input_password):
                # Password correct: Generate tokens and allow entry
                access_token = create_access_token(identity=str(user.id))
                refresh_token = create_refresh_token(identity=str(user.id))
                log_audit(
                    user_id=user.id,
                    action="LOGIN",
                    entity="User",
                    entity_id=user.id,
                    new_data={'login_time': datetime.utcnow().isoformat()}
                )
                
                return jsonify({
                    'success': True,
                    'message': 'Login successful!',
                    'user': user.to_dict(),
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }), 200
            else:
                # Password incorrect for an existing account
                return jsonify({
                    'success': False, 
                    'message': 'This account is already active. Incorrect password.'
                }), 401

        # 4. Security Match against Seeded Data (For First-Time Activation)
        if user.role != input_role:
            return jsonify({'success': False, 'message': f'Role mismatch. Seeded as {user.role}'}), 400
        
        # Only check area for 'Team' role (UCMO & Area Incharge have None/Null area in DB)
        if input_role == "Team":
            if user.area != input_area:
                return jsonify({'success': False, 'message': f'Area mismatch. Seeded as {user.area}'}), 400

        # 5. Activation (First time only)
        user.name = data.get('name')
        user.email = data.get('email')
        user.phone = data.get('phone')
        user.password = input_password # Hashes via User model @property
        user.is_verified = True
        user.last_login = datetime.utcnow()
        
        db.session.commit()
        log_audit(
            user_id=user.id,
            action="ACTIVATE",
            entity="User",
            entity_id=user.id,
            new_data={'name': user.name, 'role': user.role, 'area': user.area}
        )

        # 6. Tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Account activated successfully!',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        db.session.rollback()
        print("--- BACKEND CRASH ---")
        print(traceback.format_exc()) 
        return jsonify({
            'success': False, 
            'message': 'Internal Server Error', 
            'error': str(e)
        }), 500