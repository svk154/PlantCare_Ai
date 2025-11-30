# app/routes/forum.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.forum import ForumPost, ForumReply, ForumVote
from sqlalchemy import func

forum_bp = Blueprint('forum', __name__)

@forum_bp.route('/posts', methods=['GET'])
def get_posts():
    # Get query parameters
    category = request.args.get("category")
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    sort_by = request.args.get("sort_by", "recent")  # Options: recent, replies, views
    search = request.args.get("search", "")
    
    # Build query
    q = ForumPost.query
    
    # Apply filters
    if category:
        q = q.filter_by(category=category)
    
    # Apply search if provided
    if search:
        search_term = f"%{search}%"
        q = q.filter((ForumPost.title.ilike(search_term)) | 
                     (ForumPost.content.ilike(search_term)))
    
    # Apply sorting
    if sort_by == "replies":
        q = q.order_by(ForumPost.reply_count.desc())
    elif sort_by == "views":
        q = q.order_by(ForumPost.views.desc())
    else:  # Default to recent
        q = q.order_by(ForumPost.created_at.desc())
    
    # Pagination
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)
    
    # Prepare response
    result = {
        "posts": [p.to_dict() for p in paginated.items],
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

@forum_bp.route('/posts', methods=['POST'])
@jwt_required()
def post_question():
    import bleach
    
    data = request.json or {}
    title = data.get('title')
    content = data.get('content')
    category = data.get('category')
    user_id = get_jwt_identity()
    
    # Improved input validation
    if not title:
        return jsonify({"error": "Title is required"}), 400
    
    if len(title) < 5:
        return jsonify({"error": "Title must be at least 5 characters long"}), 400
        
    if not content:
        return jsonify({"error": "Content is required"}), 400
    
    if len(content) < 10:
        return jsonify({"error": "Post content must be at least 10 characters long"}), 400
        
    if not category:
        return jsonify({"error": "Category is required"}), 400
    
    # Sanitize user input to prevent XSS attacks
    allowed_tags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre']
    sanitized_title = bleach.clean(title, tags=[], strip=True)
    sanitized_content = bleach.clean(content, tags=allowed_tags, strip=True)
    sanitized_category = bleach.clean(category, tags=[], strip=True)
    
    # Create the post
    post = ForumPost(
        user_id=user_id,
        title=title,
        content=content,
        category=category,
        is_expert_question=data.get('is_expert_question', False)
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201

@forum_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
        
    # Increment view counter
    post.views += 1
    db.session.commit()
    
    return jsonify(post.to_dict())

@forum_bp.route('/posts/<int:post_id>/replies', methods=['POST'])
@jwt_required()
def reply(post_id):
    data = request.json or {}
    content = data.get('content')
    
    # Enhanced validation
    if not content:
        return jsonify({"error": "Reply content is required"}), 400
        
    if len(content) < 5:
        return jsonify({"error": "Reply must be at least 5 characters long"}), 400
    
    user_id = get_jwt_identity()
    
    # Check if post exists
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Prevent users from replying to their own posts
    jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
    if post.user_id == jwt_user_id:
        return jsonify({"error": "You cannot reply to your own post"}), 403
    
    # Create the reply
    reply = ForumReply(
        user_id=user_id,
        post_id=post_id,
        content=content,
        is_expert_reply=data.get('is_expert_reply', False)
    )
    db.session.add(reply)
    
    # Update reply count on the post
    post.reply_count = ForumReply.query.filter_by(post_id=post_id).count() + 1
    
    db.session.commit()
    return jsonify(reply.to_dict()), 201

@forum_bp.route('/my-posts', methods=['GET'])
@jwt_required()
def my_posts():
    user_id = get_jwt_identity()
    # Convert to int for database query
    jwt_user_id = int(user_id) if isinstance(user_id, str) else user_id
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    # Get paginated results
    q = ForumPost.query.filter_by(user_id=jwt_user_id).order_by(ForumPost.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)
    
    result = {
        "posts": [p.to_dict() for p in paginated.items],
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

# New endpoints for additional functionality

@forum_bp.route('/posts/<int:post_id>/flag', methods=['POST'])
@jwt_required()
def flag_post(post_id):
    """Flag a post as inappropriate"""
    data = request.json or {}
    reason = data.get('reason', 'Inappropriate content')
    
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    post.is_flagged = True
    post.flagged_reason = reason
    db.session.commit()
    
    return jsonify({"message": "Post has been flagged for review"}), 200

@forum_bp.route('/replies/<int:reply_id>/flag', methods=['POST'])
@jwt_required()
def flag_reply(reply_id):
    """Flag a reply as inappropriate"""
    data = request.json or {}
    reason = data.get('reason', 'Inappropriate content')
    
    reply = ForumReply.query.get(reply_id)
    if not reply:
        return jsonify({"error": "Reply not found"}), 404
    
    reply.is_flagged = True
    reply.flagged_reason = reason
    db.session.commit()
    
    return jsonify({"message": "Reply has been flagged for review"}), 200

@forum_bp.route('/replies/<int:reply_id>/helpful', methods=['POST'])
@jwt_required()
def mark_helpful(reply_id):
    """Mark a reply as helpful"""
    reply = ForumReply.query.get(reply_id)
    if not reply:
        return jsonify({"error": "Reply not found"}), 404
    
    reply.helpful_count += 1
    db.session.commit()
    
    return jsonify({"message": "Reply marked as helpful", "helpful_count": reply.helpful_count}), 200

@forum_bp.route('/posts/<int:post_id>/solved', methods=['POST'])
@jwt_required()
def mark_solved(post_id):
    """Mark a post as solved"""
    user_id = get_jwt_identity()
    post = ForumPost.query.get(post_id)
    
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Only the post creator can mark it as solved
    if post.user_id != user_id:
        return jsonify({"error": "Only the post creator can mark a post as solved"}), 403
    
    post.solved = True
    db.session.commit()
    
    return jsonify({"message": "Post marked as solved"}), 200

@forum_bp.route('/search', methods=['GET'])
def search_posts():
    """Search for posts by keyword"""
    query = request.args.get('query', '')
    if not query or len(query) < 3:
        return jsonify({"error": "Search query must be at least 3 characters"}), 400
    
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    search_term = f"%{query}%"
    q = ForumPost.query.filter(
        (ForumPost.title.ilike(search_term)) | 
        (ForumPost.content.ilike(search_term))
    ).order_by(ForumPost.created_at.desc())
    
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)
    
    result = {
        "posts": [p.to_dict() for p in paginated.items],
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
