from flask import Blueprint, jsonify
from app.extensions import db
from app.models import TeamPerformance, Child, User, TeamCampaign
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from datetime import date

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_analytics_summary():
    try:
        today = date.today()
        
        #  Get daily summary from performance table
        summary_data = TeamPerformance.get_daily_summary(today)
        teams_list = summary_data.get('teams', [])

        #  Fallback if no performance records exist for today
        if not teams_list:
            assigned_teams = db.session.query(TeamCampaign, User).join(User, TeamCampaign.team_id == User.id).all()
            
            for tc, user in assigned_teams:
                #  Real-time scan from children table
                stats = db.session.query(
                    func.count(Child.id).filter(Child.area == user.area, func.lower(Child.vaccination_status) == 'missed').label('m'),
                    func.count(Child.id).filter(Child.area == user.area, func.lower(Child.vaccination_status) == 'refused').label('r'),
                    func.count(Child.id).filter(Child.area == user.area, func.lower(Child.vaccination_status) == 'vaccinated').label('v')
                ).first()

                v_count = stats.v or 0
                r_count = stats.r or 0
                m_count = stats.m or 0
                
                target = tc.target_children if (tc.target_children and tc.target_children > 0) else 1
                coverage = int((v_count / target) * 100)

                #  Safely get Lead Name. Check for 'name' or 'username' if 'full_name' is missing
                lead_name = getattr(user, 'full_name', None) or getattr(user, 'name', None) or getattr(user, 'username', 'N/A')

                teams_list.append({
                    "id": tc.id,
                    "name": f"Team {user.area}" if user.area else f"Team-{user.id}",
                    "lead": lead_name,
                    "coverage": f"{coverage}%",
                    "missed": m_count,
                    "refusals": r_count,
                    "status": "Excellent" if coverage >= 90 else "Fair" if coverage >= 80 else "Critical"
                })

        # Aggregation for UI boxes
        total_missed = sum(t.get('missed', 0) for t in teams_list)
        total_refusals = sum(t.get('refusals', 0) for t in teams_list)
        
        critical_team = {"name": "N/A", "refusals": 0}
        if teams_list:
            # Finding the team with most refusals
            top_critical = max(teams_list, key=lambda x: x.get('refusals', 0))
            critical_team = {"name": top_critical['name'], "refusals": top_critical['refusals']}
            
            
            # 1. Overall summary of missed and refusal cases
            # 2. Detailed performance data of all teams
            # 3. Critical intervention info for worst-performing team
        return jsonify({
            "success": True,
            "summary": {
                "total_missed": total_missed,
                "total_refusals": total_refusals
            },
            "teams": teams_list,
            "intervention": {
                "critical_team_name": critical_team['name'],
                "critical_count": critical_team['refusals']
            }
        }), 200

    except Exception as e:
        print(f"Analytics BP Error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500