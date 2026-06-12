from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from app.models.user import User # Ensure this path is correct

def role_required(*required_roles):
    """
    Decorator to restrict access based on User Roles (UCMO, AreaIncharge, Team).
    Usage: @role_required('UCMO', 'AreaIncharge')
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # 1. Verify that a valid JWT token is present in the request
            verify_jwt_in_request()
            claims = get_jwt()
            user_id = claims['sub']
            
            # 2. Fetch user from database using the ID from token
            user = User.query.get(user_id)
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            # 3. Check if the user's role exists in the allowed roles list
            # Note: We match 'AreaIncharge' as per your frontend selection
            if user.role not in required_roles:
                return jsonify({
                    'success': False, 
                    'message': f'Access denied. Required role: {required_roles}'
                }), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def area_required(required_area=None):
    """
    Decorator to restrict Team members to their specific assigned areas.
    UCMO and AreaIncharge can bypass this.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_id = claims['sub']
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            # Logic: UCMO and AreaIncharge have "God Mode" (Access to all areas)
            # Make sure these strings match exactly what is saved in your DB
            if user.role in ['UCMO', 'AreaIncharge', 'Area Incharge']:
                return fn(*args, **kwargs)
            
            # Logic: Team members are restricted to their assigned 'area'
            if user.role == 'Team':
                # If a specific area is requested, check if it matches user's area
                if required_area and user.area != required_area:
                    return jsonify({
                        'success': False, 
                        'message': f'Access denied. You only have access to {user.area}'
                    }), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper