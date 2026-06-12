from datetime import datetime
from app.extensions import db

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    target_coverage = db.Column(db.Float, default=95.0)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Vaccinations linked via backref 'campaign' in vaccination.py
    team_stats = db.relationship('TeamCampaign', backref='campaign_ref', lazy=True)

class TeamCampaign(db.Model):
    __tablename__ = 'team_campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    target_children = db.Column(db.Integer, default=0)
    vaccinated_count = db.Column(db.Integer, default=0)
    refusal_count = db.Column(db.Integer, default=0)
    verified_count = db.Column(db.Integer, default=0)
    coverage_percentage = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('team_id', 'campaign_id', name='unique_team_campaign'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'campaign_id': self.campaign_id,
            'vaccinated_count': self.vaccinated_count,
            'target_children': self.target_children,
            'coverage_percentage': self.coverage_percentage,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }