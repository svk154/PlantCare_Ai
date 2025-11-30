# app/models/forum.py
from app import db
from datetime import datetime

class ForumPost(db.Model):
    __tablename__ = 'forum_posts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(64))
    is_expert_question = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(32), default="open")
    views = db.Column(db.Integer, default=0)
    is_flagged = db.Column(db.Boolean, default=False)
    flagged_reason = db.Column(db.String(200), nullable=True)
    reply_count = db.Column(db.Integer, default=0)
    solved = db.Column(db.Boolean, default=False)
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    edited_at = db.Column(db.DateTime, nullable=True)
    edit_count = db.Column(db.Integer, default=0)
    replies = db.relationship('ForumReply', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    votes = db.relationship('ForumVote', backref='post', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "is_expert_question": self.is_expert_question,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "status": self.status,
            "views": self.views,
            "is_flagged": self.is_flagged,
            "flagged_reason": self.flagged_reason,
            "reply_count": self.reply_count,
            "solved": self.solved,
            "upvotes": self.upvotes,
            "downvotes": self.downvotes,
            "edited_at": self.edited_at.isoformat() if self.edited_at else None,
            "edit_count": self.edit_count,
            "replies": [reply.to_dict() for reply in self.replies]
        }

class ForumReply(db.Model):
    __tablename__ = 'forum_replies'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('forum_posts.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_expert_reply = db.Column(db.Boolean, default=False)
    is_accepted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_flagged = db.Column(db.Boolean, default=False)
    flagged_reason = db.Column(db.String(200), nullable=True)
    helpful_count = db.Column(db.Integer, default=0)
    edited_at = db.Column(db.DateTime, nullable=True)
    edit_count = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
            "content": self.content,
            "is_expert_reply": self.is_expert_reply,
            "is_accepted": self.is_accepted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_flagged": self.is_flagged,
            "flagged_reason": self.flagged_reason,
            "helpful_count": self.helpful_count,
            "edited_at": self.edited_at.isoformat() if self.edited_at else None,
            "edit_count": self.edit_count
        }

class ForumVote(db.Model):
    __tablename__ = 'forum_votes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('forum_posts.id'), nullable=False)
    vote_type = db.Column(db.String(10), nullable=False)  # 'upvote' or 'downvote'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_post_vote'),)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
            "vote_type": self.vote_type,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
