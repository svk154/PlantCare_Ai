import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache

# Load environment variables from .env file
load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
cache = Cache()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["2000 per day", "1000 per hour"],  # Much higher limits for development
    storage_uri="memory://"
)
csrf = CSRFProtect()  # CSRF protection
# Talisman will be initialized with the app

def create_app(config_name='default'):
    app = Flask(__name__)

    # Load configuration
    from app.config import config
    app.config.from_object(config[config_name])

    # Setup extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize caching (SimpleCache by default; can switch to Redis via env vars)
    cache_config = {
        'CACHE_TYPE': os.environ.get('CACHE_TYPE', 'SimpleCache'),
        'CACHE_DEFAULT_TIMEOUT': int(os.environ.get('CACHE_DEFAULT_TIMEOUT', '300'))
    }
    if cache_config['CACHE_TYPE'].lower() == 'redis':
        cache_config.update({
            'CACHE_REDIS_URL': os.environ.get('CACHE_REDIS_URL', 'redis://localhost:6379/0'),
        })
    cache.init_app(app, config=cache_config)
    
    limiter.init_app(app)
    csrf.init_app(app)  # Initialize CSRF protection
    
    # Setup security headers with Talisman
    # Only enable HTTPS in production
    is_production = os.environ.get('FLASK_ENV') == 'production'
    Talisman(
        app,
        force_https=is_production,
        session_cookie_secure=is_production,
        session_cookie_http_only=True,
        strict_transport_security=True,
        content_security_policy={
            'default-src': "'self'",
            'img-src': ["'self'", 'data:'],
            'script-src': ["'self'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'connect-src': ["'self'", 'https://api.openai.com']
        },
    )
    
    # Enable CORS with dynamic origin handling
    # In development or port-forwarding scenarios, we need to be more permissive
    # For production, this would be restricted to specific domains
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    if is_production:
        # In production, only allow specific origins
        cors_origins = ["https://plantcare-ai.com"]
    else:
        # In development, allow both localhost and port-forwarded origins
        cors_origins = ["http://localhost:3000", "http://localhost:5000", "*"]
        
    CORS(app, 
         resources={r"/*": {"origins": cors_origins}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Language"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Register blueprints
    from app.routes import (
        auth, disease_detection, calculators, forum,
        weather, analytics, profile, farms, monitored_crops, disease_scans,
        calculator_results, calculator, delete_user, voting, forum_management,
        crop_predictions
    )
    
    # Register auth blueprint and exempt it from CSRF protection
    app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    csrf.exempt(auth.auth_bp)
    
    # Register our modified disease detection routes without JWT requirement
    from app.routes import disease_detection_no_jwt
    app.register_blueprint(disease_detection_no_jwt.disease_bp, url_prefix='/api/disease')
    csrf.exempt(disease_detection_no_jwt.disease_bp)
    
    app.register_blueprint(calculators.calc_bp, url_prefix='/api/calculators')
    csrf.exempt(calculators.calc_bp)
    app.register_blueprint(calculator_results.calculator_results_bp, url_prefix='/api/calculator-results')
    csrf.exempt(calculator_results.calculator_results_bp)
    app.register_blueprint(calculator.calculator_bp, url_prefix='/api/calculator')
    csrf.exempt(calculator.calculator_bp)
    app.register_blueprint(forum.forum_bp, url_prefix='/api/forum')
    csrf.exempt(forum.forum_bp)
    app.register_blueprint(voting.voting_bp, url_prefix='/api/forum')
    csrf.exempt(voting.voting_bp)
    app.register_blueprint(forum_management.forum_management_bp, url_prefix='/api/forum')
    csrf.exempt(forum_management.forum_management_bp)
    app.register_blueprint(weather.weather_bp, url_prefix='/api/weather')
    csrf.exempt(weather.weather_bp)
    app.register_blueprint(analytics.analytics_bp, url_prefix='/api/analytics')
    csrf.exempt(analytics.analytics_bp)
    app.register_blueprint(profile.profile_bp, url_prefix='/api/profile')
    csrf.exempt(profile.profile_bp)
    app.register_blueprint(farms.farms_bp, url_prefix='/api/farms')
    csrf.exempt(farms.farms_bp)
    app.register_blueprint(monitored_crops.monitored_crops_bp, url_prefix='/api/crops')
    csrf.exempt(monitored_crops.monitored_crops_bp)
    app.register_blueprint(disease_scans.disease_scans_bp, url_prefix='/api/disease-scans')
    csrf.exempt(disease_scans.disease_scans_bp)
    
    # Register delete user blueprint
    app.register_blueprint(delete_user.delete_user_bp, url_prefix='/api/delete')
    csrf.exempt(delete_user.delete_user_bp)
    
    # Register crop prediction blueprint
    app.register_blueprint(crop_predictions.crop_prediction_bp, url_prefix='/api/crop-predictions')
    csrf.exempt(crop_predictions.crop_prediction_bp)
    
    # Also register the disease detection blueprint without API prefix for direct access
    # Using name parameter to avoid naming conflict
    app.register_blueprint(disease_detection_no_jwt.disease_bp, url_prefix='/disease', name='disease_direct')
    
    # Configure the app to serve React frontend from the root URL
    from app.utils.react_serve import configure_react_serve
    configure_react_serve(app)

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

    # Add default cache headers for GET responses (short-lived)
    @app.after_request
    def add_cache_headers(response):
        try:
            if response.status_code == 200 and response.direct_passthrough is False:
                # Only add for GET/HEAD requests
                from flask import request as _req
                if _req.method in ('GET', 'HEAD'):
                    # Use private cache for user-specific data
                    response.headers.setdefault('Cache-Control', 'private, max-age=60, must-revalidate')
        except Exception:
            pass
        return response

    return app
