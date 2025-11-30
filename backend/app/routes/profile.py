# app/routes/profile.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.farm import Farm, Crop
from app.models.transaction import FarmLedger

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id_str = get_jwt_identity()
        if not user_id_str:
            return jsonify({'error': 'Invalid token: no user ID found'}), 422
        
        user_id = int(user_id_str)
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': f'User not found with ID: {user_id}'}), 422
        
        # Use eager loading to avoid N+1 queries
        from sqlalchemy.orm import joinedload
        farms = Farm.query.options(
            joinedload(Farm.crops),
            joinedload(Farm.notes)
        ).filter_by(user_id=user.id).all()
        
        return jsonify({
            'user': user.to_dict(),
            'farms': [f.to_dict() for f in farms]
        })
    except Exception as e:
        return jsonify({'error': f'Profile fetch failed: {str(e)}'}), 500

@profile_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    user = User.query.get(user_id)
    data = request.json or {}
    user.name = data.get('name', user.name)
    user.phone = data.get('phone', user.phone)
    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()})

def delete_farm(farm_id):
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
    if not farm:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(farm)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

@profile_bp.route('/farms/<int:farm_id>/crops', methods=['POST'])
@jwt_required()
def add_crop(farm_id):
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
    if not farm:
        return jsonify({'error': 'Not found'}), 404
    data = request.json or {}
    crop = Crop(
        name=data.get('name'),
        variety=data.get('variety'),
        planted_date=data.get('planted_date'),
        expected_harvest=data.get('expected_harvest'),
        status=data.get('status'),
        health_score=data.get('health_score', 100.0),
        farm_id=farm.id
    )
    db.session.add(crop)
    db.session.commit()
    return jsonify({'message': 'Crop added', 'crop': crop.to_dict()}), 201

@profile_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    # Pagination params with sensible defaults
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 25))
        per_page = max(1, min(per_page, 100))  # clamp to [1, 100]
    except Exception:
        page, per_page = 1, 25

    query = FarmLedger.query.filter_by(user_id=user_id).order_by(FarmLedger.transaction_date.desc(), FarmLedger.id.desc())

    # If client explicitly requests all, maintain backward compatibility
    if request.args.get('all') == 'true':
        items = query.all()
        return jsonify({'transactions': [t.to_dict() for t in items], 'total': len(items), 'page': 1, 'per_page': len(items)})

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    items = [t.to_dict() for t in pagination.items]
    return jsonify({
        'transactions': items,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    })

@profile_bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    try:
        # Get user ID from token
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        print(f"DEBUG: Creating transaction for user_id: {user_id}")
        
        # Get and validate request data
        data = request.json or {}
        print(f"DEBUG: Received transaction data: {data}")
        
        # Validate required fields
        if not data.get('amount') or not data.get('category'):
            print("DEBUG: Missing required fields")
            return jsonify({'error': 'Amount and category are required'}), 400
        
        # Parse date if provided
        transaction_date = None
        if data.get('date'):
            from datetime import datetime
            try:
                transaction_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                print(f"DEBUG: Parsed transaction date: {transaction_date}")
            except ValueError:
                print("DEBUG: Invalid date format")
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Create new transaction
        transaction = FarmLedger(
            user_id=user_id,
            amount=float(data.get('amount')),
            category=data.get('category'),
            note=data.get('note', ''),
            transaction_type=data.get('type', 'expense'),
            transaction_date=transaction_date
        )
        print(f"DEBUG: Created transaction object: {transaction.to_dict()}")
        
        # Save to database
        try:
            db.session.add(transaction)
            db.session.commit()
            print(f"DEBUG: Transaction saved successfully with ID: {transaction.id}")
        except Exception as e:
            print(f"DEBUG: Error saving transaction: {str(e)}")
            db.session.rollback()
            return jsonify({'error': 'Database error occurred'}), 500
        
        response_data = {
            'message': 'Transaction created successfully',
            'transaction': transaction.to_dict()
        }
        print(f"DEBUG: Returning successful response: {response_data}")
        return jsonify(response_data), 201
        
    except Exception as e:
        error_msg = f'Transaction creation failed: {str(e)}'
        print(f"ERROR: {error_msg}")
        return jsonify({'error': error_msg}), 500

@profile_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        transaction = FarmLedger.query.filter_by(id=transaction_id, user_id=user_id).first()
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        data = request.json or {}
        
        # Update fields
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'category' in data:
            transaction.category = data['category']
        if 'note' in data:
            transaction.note = data['note']
        if 'type' in data:
            transaction.transaction_type = data['type']
        if 'date' in data:
            transaction.transaction_date = data['date']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction updated successfully',
            'transaction': transaction.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': f'Transaction update failed: {str(e)}'}), 500

@profile_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        transaction = FarmLedger.query.filter_by(id=transaction_id, user_id=user_id).first()
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': f'Transaction deletion failed: {str(e)}'}), 500
