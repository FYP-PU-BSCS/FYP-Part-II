from flask import Flask, jsonify
from config import config
from app.extensions import db, migrate, jwt, bcrypt, cors

def create_app(config_name='development'):
    """
    Application Factory to initialize the Smart Polio Portal Backend.
    Connects Extensions, Routes, and Error Handlers.
    """
    app = Flask(__name__)
    
    # Load settings from config.py based on environment
    app.config.from_object(config[config_name])
    
    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)
    
    
    # 1. ROOT TEST ROUTE (Verify server is running)
    @app.route('/')
    def health_check():
        return jsonify({
            'success': True,
            'message': 'Smart Polio Reporting Portal Backend is LIVE!',
            'environment': config_name,
            'status': 'Healthy'
        }), 200

    # 2. BLUEPRINT REGISTRATION - ALL ROUTES
    
    # Import all blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.dashboard_routes import report_bp
    from app.routes.child_routes import child_bp
    from app.routes.certificate_routes import certificate_bp
    from app.routes.team_routes import team_bp
    from app.routes.analytics import analytics_bp
    from app.routes.sync_routes import sync_bp

    # Register all blueprints with their prefixes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(report_bp, url_prefix='/api/report')
    app.register_blueprint(child_bp, url_prefix='/api/child')
    app.register_blueprint(certificate_bp, url_prefix='/api/certificate')
    app.register_blueprint(team_bp, url_prefix='/api/team')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(sync_bp, url_prefix='/api/sync')


    # 3. GLOBAL ERROR HANDLERS
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'The requested URL was not found.',
            'error': str(error)
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'An internal server error occurred.',
            'error': str(error)
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': 'Bad request',
            'error': str(error)
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'message': 'Unauthorized access',
            'error': str(error)
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'message': 'Access forbidden',
            'error': str(error)
        }), 403

    # 4. DATABASE INITIALIZATION
    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()
            print("✅ Successfully synchronized PostgreSQL tables.")
            
            # Optional: Create default roles if needed
            create_default_roles()
            
        except Exception as e:
            print(f"❌ PostgreSQL Connection Error: {str(e)}")
    
    return app

def create_default_roles():
    """Create default user roles if they don't exist"""
    from app.models.user import User
    from app.models import Role 
    
    try:
        # If you have a Role model, create default roles
        from app.extensions import db
        
        # Check if roles table exists and create default roles
        print("✅ Database initialization complete")
        
    except Exception as e:
        print(f"⚠️  Note: {str(e)}")

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"DEBUG ERROR: Invalid Token - {error}")
    return jsonify({
        "success": False,
        "message": f"Signature verification failed: {error}",
        "error": "invalid_token"
    }), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("DEBUG ERROR: Token has expired")
    return jsonify({
        "success": False,
        "message": "The token has expired",
        "error": "token_expired"
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"DEBUG ERROR: No token provided - {error}")
    return jsonify({
        "success": False,
        "message": "Request does not contain an access token",
        "error": "authorization_required"
    }), 401