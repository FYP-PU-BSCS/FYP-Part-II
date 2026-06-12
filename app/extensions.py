from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
# cors = CORS()
cors = CORS(resources={r"/api/*": {"origins": "*"}}) # Allow all for development
migrate = Migrate()


