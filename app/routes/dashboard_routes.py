from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.dashboard_service import DashboardService
import logging

report_bp = Blueprint('report', __name__)
logger = logging.getLogger(__name__)


@report_bp.route('/dashboard/campaign-performance', methods=['GET'])
@jwt_required()
def get_campaign_performance():
    """API for Circular Progress Rings - Combined stats for all teams"""
    try:
        data = DashboardService.get_campaign_performance()
        
        return jsonify({
            'success': True,
            'data': data
        }), 200

    except Exception as e:
        logger.error(f"Error in campaign-performance: {str(e)}")
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


@report_bp.route('/dashboard/district-performance', methods=['GET'])
@jwt_required()
def get_district_performance():
    """API for Summary Cards and Team Progress Bars - Individual teams"""
    try:
        data = DashboardService.get_district_performance(None)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
    except Exception as e:
        logger.error(f"Error in district-performance: {str(e)}")
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500