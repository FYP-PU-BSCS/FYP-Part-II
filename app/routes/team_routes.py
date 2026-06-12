from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime, timezone, timedelta
from app.extensions import db
from app.models import User, Campaign, Child, TeamPerformance

team_bp = Blueprint('team', __name__)

# Pakistan Standard Time offset (UTC+5)
PKT_OFFSET = timedelta(hours=5)

def utc_to_pkt(utc_dt):
    """Convert UTC datetime to Pakistan Standard Time (UTC+5)"""
    if utc_dt is None:
        return "09:00 AM"
    
    # If datetime is naive (no timezone), assume UTC
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    
    # Convert to PKT
    pkt_dt = utc_dt.astimezone(timezone(PKT_OFFSET))
    return pkt_dt.strftime("%I:%M %p")

@team_bp.route('/field-report-data', methods=['GET'])
@jwt_required()
def get_field_report_data():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        if user.role in ['UCMO', 'Area Incharge', 'AreaIncharge']:
            distinct_teams = db.session.query(Child.assigned_team).distinct().all()
            target_areas = [t[0] for t in distinct_teams if t[0] and str(t[0]).strip() and t[0] != 'None']
        else:
            target_areas = [user.area] if user.area else []

        active_campaign = Campaign.query.filter_by(status='active').first()
        campaign_name = active_campaign.name if active_campaign else "SNID January 2026"

        all_teams_data = {}

        for area in target_areas:
            performance = TeamPerformance.query.filter_by(team_name=area, date=date.today()).first()
            children_in_area = Child.query.filter_by(assigned_team=area).all()

            formatted_records = []
            for child in children_in_area:
                status_upper = child.vaccination_status.upper() if child.vaccination_status else "PENDING"
                
                if status_upper == 'VACCINATED':
                    type_text = "Certificate Issued"
                elif status_upper == 'REFUSED':
                    type_text = child.refusal_reason or "Religious Hesitancy"
                else:
                    type_text = "House Locked"

                short_id = str(child.id)[:8] if child.id else "00000000"
                
                # FIXED: Convert UTC to PKT for display
                formatted_records.append({
                    "id": f"REC-{short_id}",
                    "name": child.full_name,
                    "father": child.father_name or "N/A",
                    "status": status_upper,
                    "type": type_text,
                    "time": utc_to_pkt(child.updated_at)
                })

            all_teams_data[area] = {
                "dailyStats": {
                    "vaccinated": sum(1 for c in formatted_records if c['status'] == 'VACCINATED'),
                    "target": performance.target_children if performance else 200,
                    "areaCovered": f"{performance.daily_coverage if performance else 0}%",
                    "teamName": area,
                    "sector": area,
                    "uc": "UC-45",
                    "campaign": campaign_name
                },
                "childrenRecords": formatted_records
            }

        return jsonify({
            "success": True,
            "is_supervisor": user.role in ['UCMO', 'Area Incharge'],
            "teamsData": all_teams_data
        }), 200

    except Exception as e:
        print(f"ERROR in field-report-data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500