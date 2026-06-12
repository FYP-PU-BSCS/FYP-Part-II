from datetime import datetime, date
from app.extensions import db
import uuid

class Vaccination(db.Model):
    __tablename__ = 'vaccinations'
    
    # UUID to match children.id
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mobile_id = db.Column(db.String(36), nullable=False, default=lambda: str(uuid.uuid4()))
    # UUID foreign key to children.id
    child_id = db.Column(db.String(36), db.ForeignKey('children.id'), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=True)
    
    status = db.Column(db.String(20), nullable=False)
    dose_number = db.Column(db.Integer, nullable=True)
    refusal_reason = db.Column(db.Text, nullable=True)
    
    administered_date = db.Column(db.Date, default=date.today)
    administered_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    sync_status = db.Column(db.String(20), default='pending')
    mobile_created_at = db.Column(db.DateTime, nullable=True)
    synced_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    campaign = db.relationship('Campaign', backref='vaccinations')
    
    __table_args__ = (
        db.Index('idx_vaccination_child_id', 'child_id'),
        db.Index('idx_vaccination_campaign_id', 'campaign_id'),
        db.Index('idx_vaccination_sync_status', 'sync_status'),
        db.Index('idx_vaccination_mobile_id', 'mobile_id'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'child_id': self.child_id,
            'campaign_id': self.campaign_id,
            'campaign_name': self.campaign.name if self.campaign else None,
            'status': self.status,
            'dose_number': self.dose_number,
            'administered_date': self.administered_date.isoformat() if self.administered_date else None,
            'refusal_reason': self.refusal_reason,
            'sync_status': self.sync_status
        }