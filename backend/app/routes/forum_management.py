# app/routes/forum_management.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.forum import ForumPost, ForumReply, ForumVote
from datetime import datetime
import bleach

forum_management_bp = Blueprint('forum_management', __name__)

@forum_management_bp.route('/my-comments', methods=['GET'])
@jwt_required()
def get_my_comments():
    """Get all comments/replies made by the current user"""
    user_id = get_jwt_identity()
    # Convert to int for database query
    jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    # Get paginated results for user's replies
    q = ForumReply.query.filter_by(user_id=jwt_user_id).order_by(ForumReply.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)
    
    # Add post title and other details to each reply
    comments_with_context = []
    for reply in paginated.items:
        post = ForumPost.query.get(reply.post_id)
        reply_dict = reply.to_dict()
        reply_dict['post_title'] = post.title if post else "Unknown Post"
        reply_dict['post_category'] = post.category if post else None
        comments_with_context.append(reply_dict)
    
    result = {
        "comments": comments_with_context,
        "pagination": {
            "total": paginated.total,
            "pages": paginated.pages,
            "page": page,
            "per_page": per_page,
            "has_next": paginated.has_next,
            "has_prev": paginated.has_prev
        }
    }
    
    return jsonify(result)

@forum_management_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Delete a post (only by the post creator)"""
    user_id = get_jwt_identity()
    
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Check if user owns the post - convert to int for comparison
    try:
        jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
        if post.user_id != jwt_user_id:
            return jsonify({"error": "You can only delete your own posts"}), 403
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user authentication"}), 401
    
    try:
        # Delete the post (cascade will handle replies and votes due to our relationship setup)
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({"message": "Post and all associated replies have been deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete post: {str(e)}"}), 500

@forum_management_bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def edit_post(post_id):
    """Edit a post (only by the post creator)"""
    user_id = get_jwt_identity()
    data = request.json or {}
    
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Check if user owns the post - convert to int for comparison
    try:
        jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
        if post.user_id != jwt_user_id:
            return jsonify({"error": "You can only edit your own posts"}), 403
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user authentication"}), 401
    
    # Validate input
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    category = data.get('category', '').strip()
    
    if not title or len(title) < 5:
        return jsonify({"error": "Title must be at least 5 characters long"}), 400
        
    if not content or len(content) < 10:
        return jsonify({"error": "Content must be at least 10 characters long"}), 400
        
    if not category:
        return jsonify({"error": "Category is required"}), 400
    
    # Sanitize input
    allowed_tags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre']
    sanitized_title = bleach.clean(title, tags=[], strip=True)
    sanitized_content = bleach.clean(content, tags=allowed_tags, strip=True)
    sanitized_category = bleach.clean(category, tags=[], strip=True)
    
    try:
        # Update post
        post.title = sanitized_title
        post.content = sanitized_content
        post.category = sanitized_category
        post.edited_at = datetime.utcnow()
        post.edit_count = (post.edit_count or 0) + 1
        
        db.session.commit()
        
        return jsonify({
            "message": "Post updated successfully",
            "post": post.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update post: {str(e)}"}), 500

@forum_management_bp.route('/replies/<int:reply_id>', methods=['DELETE'])
@jwt_required()
def delete_reply(reply_id):
    """Delete a reply (only by the reply creator)"""
    user_id = get_jwt_identity()
    
    reply = ForumReply.query.get(reply_id)
    if not reply:
        return jsonify({"error": "Reply not found"}), 404
    
    # Check if user owns the reply - convert to int for comparison
    try:
        jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
        if reply.user_id != jwt_user_id:
            return jsonify({"error": "You can only delete your own replies"}), 403
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user authentication"}), 401
    
    try:
        # Get the post to update reply count
        post = ForumPost.query.get(reply.post_id)
        
        # Delete the reply
        db.session.delete(reply)
        
        # Update reply count on the post
        if post:
            post.reply_count = max(0, post.reply_count - 1)
        
        db.session.commit()
        
        return jsonify({"message": "Reply deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete reply: {str(e)}"}), 500

@forum_management_bp.route('/replies/<int:reply_id>', methods=['PUT'])
@jwt_required()
def edit_reply(reply_id):
    """Edit a reply (only by the reply creator)"""
    user_id = get_jwt_identity()
    data = request.json or {}
    
    reply = ForumReply.query.get(reply_id)
    if not reply:
        return jsonify({"error": "Reply not found"}), 404
    
    # Check if user owns the reply - convert to int for comparison
    try:
        jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
        if reply.user_id != jwt_user_id:
            return jsonify({"error": "You can only edit your own replies"}), 403
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user authentication"}), 401
    
    # Validate input
    content = data.get('content', '').strip()
    
    if not content or len(content) < 5:
        return jsonify({"error": "Reply content must be at least 5 characters long"}), 400
    
    # Sanitize input
    allowed_tags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre']
    sanitized_content = bleach.clean(content, tags=allowed_tags, strip=True)
    
    try:
        # Update reply
        reply.content = sanitized_content
        reply.edited_at = datetime.utcnow()
        reply.edit_count = (reply.edit_count or 0) + 1
        
        db.session.commit()
        
        return jsonify({
            "message": "Reply updated successfully",
            "reply": reply.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update reply: {str(e)}"}), 500

@forum_management_bp.route('/posts/<int:post_id>/replies', methods=['GET'])
def get_post_replies(post_id):
    """Get all replies for a specific post"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    
    # Check if post exists
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Get paginated replies
    q = ForumReply.query.filter_by(post_id=post_id).order_by(ForumReply.created_at.asc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)
    
    result = {
        "replies": [reply.to_dict() for reply in paginated.items],
        "pagination": {
            "total": paginated.total,
            "pages": paginated.pages,
            "page": page,
            "per_page": per_page,
            "has_next": paginated.has_next,
            "has_prev": paginated.has_prev
        }
    }
    
    return jsonify(result)