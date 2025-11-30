import os

class Config:
    # Remove default values for security-critical settings
    SECRET_KEY = os.environ.get("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set in environment variables")
        
    # Database configuration without defaults
    MYSQL_USER = os.environ.get('MYSQL_USER')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD')
    MYSQL_HOST = os.environ.get('MYSQL_HOST')
    MYSQL_DB = os.environ.get('MYSQL_DB')
    
    # Validate required environment variables
    if not all([MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_DB]):
        raise ValueError("Missing required database environment variables")
        
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Optimize database connection pooling for better performance
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,          # Number of connections to maintain
        'max_overflow': 30,       # Additional connections during high load
        'pool_timeout': 30,       # Timeout for getting connection from pool
        'pool_recycle': 3600,     # Recycle connections every hour
        'pool_pre_ping': True,    # Validate connections before use
        'connect_args': {
            'charset': 'utf8mb4',
            'connect_timeout': 10,
            'read_timeout': 10,
            'write_timeout': 10,
        }
    }
    
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise ValueError("No JWT_SECRET_KEY set in environment variables")
        
    # Configure JWT cookies for security
    JWT_TOKEN_LOCATION = ['cookies', 'headers']
    JWT_COOKIE_SECURE = os.environ.get("ENV") == "production"  # Only True in production
    JWT_COOKIE_CSRF_PROTECT = False  # Disable CSRF protection for port forwarding compatibility
    JWT_COOKIE_SAMESITE = None  # Allow cross-site cookies for port forwarding
    JWT_COOKIE_DOMAIN = None  # Allow dynamic domain resolution
    JWT_COOKIE_HTTPONLY = True  # Make cookies HttpOnly
    JWT_ACCESS_TOKEN_EXPIRES = 3600 * 24  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRES = 3600 * 24 * 30  # 30 days
    
    # Configure JWT headers for frontend access
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"
    JWT_CSRF_CHECK_FORM = False  # Disable CSRF form check since we're using API endpoints

    # Optional: Flask-Mail and Weather
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", MAIL_USERNAME or "")
    WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "")

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'default': DevelopmentConfig,
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
