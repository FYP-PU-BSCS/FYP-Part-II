from flask import request
from app.extensions import db
from app.models import AuditLog

def log_audit(user_id, action, entity, entity_id=None, old_data=None, new_data=None):
    """Simple audit log helper"""
    try:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            old_data=old_data,
            new_data=new_data,
            ip_address=request.remote_addr if request else None
        )
        db.session.add(audit)
        db.session.commit()
    except Exception as e:
        print(f"Audit log error: {e}")
        db.session.rollback()