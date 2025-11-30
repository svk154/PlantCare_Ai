# app/routes/voting.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.forum import ForumPost, ForumVote

voting_bp = Blueprint('voting', __name__)

@voting_bp.route('/posts/<int:post_id>/vote', methods=['POST'])
@jwt_required()
def vote_post(post_id):
    """Vote on a forum post (upvote or downvote)"""
    data = request.json or {}
    vote_type = data.get('vote_type')  # 'upvote' or 'downvote'
    user_id = get_jwt_identity()
    # Convert to int for database operations
    jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
    
    # Validate vote type
    if vote_type not in ['upvote', 'downvote']:
        return jsonify({"error": "Invalid vote type. Must be 'upvote' or 'downvote'"}), 400
    
    # Check if post exists
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Check if user has already voted on this post
    existing_vote = ForumVote.query.filter_by(user_id=jwt_user_id, post_id=post_id).first()
    
    if existing_vote:
        # If same vote type, remove the vote (toggle)
        if existing_vote.vote_type == vote_type:
            # Remove the vote
            if vote_type == 'upvote':
                post.upvotes = max(0, post.upvotes - 1)
            else:
                post.downvotes = max(0, post.downvotes - 1)
            
            db.session.delete(existing_vote)
            db.session.commit()
            
            return jsonify({
                "message": f"{vote_type.capitalize()} removed",
                "upvotes": post.upvotes,
                "downvotes": post.downvotes,
                "user_vote": None
            }), 200
        else:
            # Change vote type
            if existing_vote.vote_type == 'upvote':
                post.upvotes = max(0, post.upvotes - 1)
                post.downvotes += 1
            else:
                post.downvotes = max(0, post.downvotes - 1)
                post.upvotes += 1
            
            existing_vote.vote_type = vote_type
            db.session.commit()
            
            return jsonify({
                "message": f"Vote changed to {vote_type}",
                "upvotes": post.upvotes,
                "downvotes": post.downvotes,
                "user_vote": vote_type
            }), 200
    else:
        # Create new vote
        new_vote = ForumVote(
            user_id=jwt_user_id,
            post_id=post_id,
            vote_type=vote_type
        )
        
        if vote_type == 'upvote':
            post.upvotes += 1
        else:
            post.downvotes += 1
        
        db.session.add(new_vote)
        db.session.commit()
        
        return jsonify({
            "message": f"{vote_type.capitalize()} added",
            "upvotes": post.upvotes,
            "downvotes": post.downvotes,
            "user_vote": vote_type
        }), 200

@voting_bp.route('/posts/<int:post_id>/vote', methods=['GET'])
@jwt_required()
def get_vote_status(post_id):
    """Get the current user's vote status for a post"""
    user_id = get_jwt_identity()
    # Convert to int for database operations
    jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
    
    # Check if post exists
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Get user's vote if it exists
    user_vote = ForumVote.query.filter_by(user_id=jwt_user_id, post_id=post_id).first()
    
    return jsonify({
        "upvotes": post.upvotes,
        "downvotes": post.downvotes,
        "user_vote": user_vote.vote_type if user_vote else None
    }), 200