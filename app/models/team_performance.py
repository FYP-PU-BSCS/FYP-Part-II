from datetime import datetime, date
from app.extensions import db

class TeamPerformance(db.Model):
    __tablename__ = 'team_performance'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Team Identification
    team_name = db.Column(db.String(50), nullable=False)  # Team A, Team B, Team C
    area = db.Column(db.String(50), nullable=False)      # Area A, Area B, Area C
    team_leader_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Campaign Reference
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    
    # Performance Metrics
    date = db.Column(db.Date, nullable=False, default=date.today)
    
    # Vaccination Stats
    target_children = db.Column(db.Integer, default=0)
    vaccinated_today = db.Column(db.Integer, default=0)
    vaccinated_total = db.Column(db.Integer, default=0)
    
    # Refusal Stats
    refused_today = db.Column(db.Integer, default=0)
    refused_total = db.Column(db.Integer, default=0)
    
    # Missed Children (Updated for Analytics)
    missed_today = db.Column(db.Integer, default=0)
    missed_total = db.Column(db.Integer, default=0)
    
    # Visit Stats
    houses_visited_today = db.Column(db.Integer, default=0)
    houses_visited_total = db.Column(db.Integer, default=0)
    
    # Verification Stats
    pending_verifications = db.Column(db.Integer, default=0)
    verified_today = db.Column(db.Integer, default=0)
    
    # Performance Percentage
    daily_coverage = db.Column(db.Float, default=0.0) 
    overall_coverage = db.Column(db.Float, default=0.0) 
    
    # Team Status
    team_status = db.Column(db.String(20), default='active') 
    last_activity = db.Column(db.DateTime, nullable=True)
    
    # System Tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    campaign = db.relationship('Campaign', backref='team_performances', lazy=True)
    team_leader = db.relationship('User', backref='led_teams', lazy=True)
    
    # Indexes
    __table_args__ = (
        db.Index('idx_team_performance_date', 'date'),
        db.Index('idx_team_performance_team', 'team_name'),
        db.Index('idx_team_performance_area', 'area'),
        db.Index('idx_team_performance_campaign', 'campaign_id'),
        db.UniqueConstraint('team_name', 'campaign_id', 'date', name='unique_team_daily_performance'),
    )
    
    def to_dict(self):
        """
        Modified to_dict to perfectly match Analytics.jsx requirements
        """
        # Status logic based on coverage percentages
        status_label = "Excellent"
        if self.daily_coverage < 80:
            status_label = "Critical"
        elif self.daily_coverage < 90:
            status_label = "Fair"

        return {
            'id': self.id,
            'name': self.team_name, # Frontend expects 'name'
            'area': self.area,
            # Fetching lead name from User relationship
            'lead': self.team_leader.full_name if self.team_leader else "Unassigned",
            'date': self.date.isoformat() if self.date else None,
            
            # Stats for Table
            'vaccinated_today': self.vaccinated_today,
            'refusals': self.refused_today, # Match frontend key
            'missed': self.missed_today,    # Match frontend key
            'coverage': f"{int(self.daily_coverage)}%", # Format with % for UI
            
            # Status for Colors
            'status': status_label, 
            'team_status': self.team_status,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None
        }
    
    def update_performance(self):
        """Update performance percentages"""
        if self.target_children > 0:
            self.daily_coverage = round((self.vaccinated_today / self.target_children) * 100, 1)
            self.overall_coverage = round((self.vaccinated_total / self.target_children) * 100, 1)
        else:
            # Fallback if target is not set yet
            self.daily_coverage = 0.0
            self.overall_coverage = 0.0
        
        self.last_activity = datetime.utcnow()
    
    @classmethod
    def get_or_create_daily(cls, team_name, campaign_id, area):
        today = date.today()
        performance = cls.query.filter_by(
            team_name=team_name,
            campaign_id=campaign_id,
            date=today
        ).first()
        
        if not performance:
            performance = cls(
                team_name=team_name,
                area=area,
                campaign_id=campaign_id,
                date=today,
                target_children=100 # Default target, can be adjusted
            )
            db.session.add(performance)
            db.session.commit()
        
        return performance
    
    
    @classmethod
    def get_daily_summary(cls, date_param=None):
        """Summary data for the top boxes on the Analytics page"""
        if not date_param:
            date_param = date.today()
        
        performances = cls.query.filter_by(date=date_param).all()
        
        return {
            'date': date_param.isoformat(),
            'total_missed': sum(p.missed_today for p in performances),
            'total_refusals': sum(p.refused_today for p in performances),
            'total_vaccinated': sum(p.vaccinated_today for p in performances),
            'teams': [p.to_dict() for p in performances]
        }