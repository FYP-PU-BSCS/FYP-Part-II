# Export all models for easy importing
from .user import User
from .child import Child
from .vaccination import Vaccination
from .campaign import Campaign, TeamCampaign
from .certificate import Certificate
from .team_performance import TeamPerformance
from .audit_log import AuditLog

__all__ = [
    'User',
    'Child',
    'Vaccination',
    'Campaign',
    'TeamCampaign',
    'TeamPerformance',
    'Certificate',
    'AuditLog'
]

def get_models():
    """Return all model classes for Alembic migrations"""
    return [
        User,
        Child,
        Vaccination,
        Campaign,
        TeamCampaign,
        TeamPerformance,
        Certificate,
        AuditLog
    ]