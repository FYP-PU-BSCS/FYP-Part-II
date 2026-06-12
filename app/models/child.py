from datetime import datetime, date
from app.extensions import db
import uuid

class Child(db.Model):
    __tablename__ = 'children'
    
    # UUID for both local and Supabase
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mobile_id = db.Column(db.String(36), nullable=False, default=lambda: str(uuid.uuid4()))
    custom_id = db.Column(db.String(20), unique=True, nullable=True)
    
    # Core identity
    full_name = db.Column(db.String(100), nullable=False)
    father_name = db.Column(db.String(100), nullable=True)
    
    # Demographics
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(10), nullable=True, default="Unknown")
    
    # Contact and Location - Directly in child table
    phone_number = db.Column(db.String(15), nullable=True)
    area = db.Column(db.String(50), nullable=True)
    house_number = db.Column(db.String(20), nullable=True, default="N/A")
    street_number = db.Column(db.String(20), nullable=True, default="N/A")
    
    # Status tracking
    vaccination_status = db.Column(db.String(20), default='pending')
    refusal_reason = db.Column(db.Text, nullable=True)
    age_category = db.Column(db.String(50), default='Between 1 - 5 years')
    
    # System and team data
    registered_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    assigned_team = db.Column(db.String(50), nullable=True)
    visit_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    vaccinations = db.relationship('Vaccination', backref='child', cascade="all, delete-orphan", lazy=True)
    certificates = db.relationship('Certificate', back_populates='child', cascade="all, delete-orphan", lazy=True)

    # Indexes
    __table_args__ = (
        db.Index('idx_child_search', 'full_name', 'phone_number'),
        db.Index('idx_child_status_area', 'vaccination_status', 'area'),
        db.Index('idx_child_custom_id', 'custom_id'),
        db.Index('idx_child_mobile_id', 'mobile_id'),
        db.Index('idx_child_assigned_team', 'assigned_team'),
    )

    @property
    def age(self):
        if not self.date_of_birth:
            return 0
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

    def to_dict(self):
        return {
            'id': self.id,
            'custom_id': self.custom_id or f"CH-{str(self.id)[:8]}",
            'full_name': self.full_name,
            'father_name': self.father_name,
            'phone_number': self.phone_number,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'category': self.age_category,
            'house_number': self.house_number or "N/A",
            'street_number': self.street_number or "N/A",
            'area': self.area,
            'vaccination_status': self.vaccination_status,
            'visit_count': self.visit_count or 0,
            'refusal_reason': self.refusal_reason,
            'history': [v.status for v in self.vaccinations] if self.vaccinations else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }