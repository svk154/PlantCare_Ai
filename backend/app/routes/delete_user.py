# app/routes/delete_user.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.farm import Farm, Crop
from app.models.farm_note import FarmNote  # Correct import
from app.models.transaction import FarmLedger
from app.models.disease_scan import DiseaseScan  # Correct model name
from app.models.forum import ForumPost, ForumReply
from app.models.calculator_result import CalculatorResult  # Correct model name

delete_user_bp = Blueprint('delete_user', __name__)

@delete_user_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """
    Delete a user account and all associated data.
    This is an irreversible operation.
    """
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        # Get the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Begin transaction to delete all user data
        # This will cascade delete related records due to SQLAlchemy relationships
        try:
            # 1. Delete all calculator results
            CalculatorResult.query.filter_by(user_id=user_id).delete()
            
            # 2. Delete disease scan records
            DiseaseScan.query.filter_by(user_id=user_id).delete()
            
            # 3. Delete forum interactions
            ForumReply.query.filter_by(user_id=user_id).delete()
            ForumPost.query.filter_by(user_id=user_id).delete()
            
            # 4. Delete transactions
            FarmLedger.query.filter_by(user_id=user_id).delete()
            
            # 5. Delete farm notes (before deleting farms, as they reference farm_id)
            FarmNote.query.filter_by(user_id=user_id).delete()
            
            # 6. Delete farms and crops
            # First get all farms
            farms = Farm.query.filter_by(user_id=user_id).all()
            for farm in farms:
                # Delete crops associated with each farm
                Crop.query.filter_by(farm_id=farm.id).delete()
            
            # Now delete the farms
            Farm.query.filter_by(user_id=user_id).delete()
            
            # 7. Finally, delete the user
            db.session.delete(user)
            
            # Commit all changes
            db.session.commit()
            
            # Clear auth cookies
            response = jsonify({'message': 'Account and all associated data deleted successfully'})
            response.delete_cookie('access_token_cookie')
            response.delete_cookie('refresh_token_cookie')
            
            return response, 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Failed to delete user data: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Account deletion failed: {str(e)}'}), 500
