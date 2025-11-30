import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)

    # Load configuration
    from config import config
    app.config.from_object(config[config_name])

    # Setup extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Enable CORS for all routes - Updated to allow any origin for testing
    CORS(app, 
         resources={r"/*": {"origins": "*"}},  # Allow any origin for testing
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Register blueprints
    from app.routes import (
        auth, disease_detection, calculators, forum,
        weather, analytics, profile
    )
    app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    
    # Register our modified disease detection routes without JWT requirement
    from app.routes import disease_detection_no_jwt
    app.register_blueprint(disease_detection_no_jwt.disease_bp, url_prefix='/api/disease')
    
    app.register_blueprint(calculators.calc_bp, url_prefix='/api/calculators')
    app.register_blueprint(forum.forum_bp, url_prefix='/api/forum')
    app.register_blueprint(weather.weather_bp, url_prefix='/api/weather')
    app.register_blueprint(analytics.analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(profile.profile_bp, url_prefix='/api/profile')
    
    # Also register the disease detection blueprint without API prefix for direct access
    app.register_blueprint(disease_detection_no_jwt.disease_bp, url_prefix='/disease')

    # CLI commands for DB mgmt (examples)
    @app.cli.command("create-db")
    def create_db():
        with app.app_context():
            db.create_all()
            print("Database tables created.")

    @app.cli.command("drop-db")
    def drop_db():
        with app.app_context():
            db.drop_all()
            print("Database tables dropped.")

    @app.cli.command("init-db")
    def init_db():
        from app.utils.database import init_db
        with app.app_context():
            init_db()
            print("Database initialized with sample data.")

    return app
