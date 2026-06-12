from datetime import datetime
from app.extensions import db

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # CREATE, UPDATE, DELETE, LOGIN
    entity = db.Column(db.String(50), nullable=False)  # Child, Vaccination, User, Certificate
    entity_id = db.Column(db.Integer, nullable=True)
    old_data = db.Column(db.JSON, nullable=True)
    new_data = db.Column(db.JSON, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref='audit_logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'action': self.action,
            'entity': self.entity,
            'entity_id': self.entity_id,
            'old_data': self.old_data,
            'new_data': self.new_data,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat()
        }