from datetime import datetime
from app.extensions import db, bcrypt

class User(db.Model):
    """
    User model for Smart Polio Reporting Portal.
    Handles pre-authorized users (UCMO, Area Incharge, Teams).
    """
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Pre-filled fields (Stored by Admin/Seed script)
    name = db.Column(db.String(100), nullable=False)
    cnic = db.Column(db.String(15), unique=True, nullable=False) # Format: 12345-1234567-1
    role = db.Column(db.String(50), nullable=False)              # UCMO, Area Incharge, Team
    area = db.Column(db.String(50), nullable=True)               # Area A, Area B, Area C (Only for Team role)
    
    # User-filled fields (Provided during the Signup process)
    # Set to nullable=True so we can seed the database without these values initially
    email = db.Column(db.String(120), unique=True, nullable=True) 
    phone = db.Column(db.String(15), nullable=True)              # Format: 03XXXXXXXXX
    password_hash = db.Column(db.String(255), nullable=True)     # Will be hashed on signup
    
    # Status flags
    is_active = db.Column(db.Boolean, default=True)              # Controls account suspension
    is_verified = db.Column(db.Boolean, default=False)           # True only after user completes signup
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Database Indexes for faster searching
    __table_args__ = (
        db.Index('idx_user_cnic', 'cnic'),
        db.Index('idx_user_email', 'email'),
        db.Index('idx_user_role', 'role'),
        db.Index('idx_user_area', 'area'),
    )
    
    @property
    def password(self):
        """Prevents password from being accessed directly."""
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        """Automatically hashes the password when set."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # def verify_password(self, password):
    #     """Checks if the provided password matches the stored hash."""
    #     return bcrypt.check_password_hash(self.password_hash, password)
    def check_password(self, password):
        """Checks if the provided password matches the stored hash."""
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Serializes the user object into a dictionary for JSON responses."""
        return {
            'id': self.id,
            'name': self.name,
            'cnic': self.cnic,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'area': self.area,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }