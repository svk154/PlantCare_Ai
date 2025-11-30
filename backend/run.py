import os
import logging
import sys
import subprocess
import argparse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Parse command line arguments
parser = argparse.ArgumentParser(description='Run PlantCare AI backend server')
parser.add_argument('--build-frontend', action='store_true', 
                    help='Build the React frontend before starting the server')
args = parser.parse_args()

# Set the default encoding for stdout/stderr
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

# Import the application after environment setup
from app import create_app, db

# Direct monkey patching of Werkzeug's logging system
import re
from werkzeug.serving import WSGIRequestHandler, _log

# Completely replace Werkzeug's logging function
original_werkzeug_log = WSGIRequestHandler.log

def clean_werkzeug_log(self, type, message, *args):
    """Clean log function that handles binary data properly"""
    try:
        # Convert any binary data to a safe representation
        if isinstance(message, bytes):
            # Try to decode as utf-8, ignoring errors
            message = message.decode('utf-8', errors='replace')
        elif isinstance(message, str):
            # Check for binary data patterns
            if (
                '\\x' in repr(message) or 
                re.search(r'[^\x20-\x7E]', message) or
                message.startswith('\x16')
            ):
                if 'code 400' in message or 'Bad request' in message:
                    message = '[Binary data removed - Bad Request (400)]'
                elif type == 'error':
                    message = '[Binary data removed - HTTP Error]'
                else:
                    message = '[Binary data removed - HTTP Request]'
        
        # Use original logging function with sanitized message
        original_werkzeug_log(self, type, message, *args)
    except Exception as e:
        print(f"ERROR: Exception in log handler: {str(e)}")

# Replace the log method
WSGIRequestHandler.log = clean_werkzeug_log

# Configure logging with proper encoding support
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    force=True
)

# Set all loggers to the appropriate level
logging.getLogger('werkzeug').setLevel(logging.INFO)
logging.getLogger('flask').setLevel(logging.INFO)

# Set UTF-8 encoding for all log handlers
for handler in logging.root.handlers:
    if hasattr(handler, 'setFormatter'):
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s', '%Y-%m-%d %H:%M:%S')
        handler.setFormatter(formatter)
    if hasattr(handler, 'stream') and hasattr(handler.stream, 'reconfigure'):
        handler.stream.reconfigure(encoding='utf-8', errors='replace')

# Build the React frontend if requested
if args.build_frontend:
    try:
        frontend_dir = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend'))
        logging.info(f"Building React frontend in {frontend_dir}...")
        
        if not os.path.exists(frontend_dir):
            logging.error(f"Frontend directory not found at {frontend_dir}")
        else:
            # Execute npm run build in the frontend directory
            process = subprocess.run(
                ['npm', 'run', 'build'], 
                cwd=frontend_dir, 
                capture_output=True, 
                text=True
            )
            
            if process.returncode == 0:
                logging.info("React build completed successfully")
            else:
                logging.error(f"React build failed with error: {process.stderr}")
    except Exception as e:
        logging.error(f"Failed to build frontend: {str(e)}")

app = create_app()

# For Flask CLI shell (flask shell)
@app.shell_context_processor
def make_shell_context():
    from app.models import user, farm, disease, forum, transaction, weather
    return {
        'db': db,
        'User': user.User,
        'Farm': farm.Farm,
        'Crop': farm.Crop,
        'DiseaseDetection': disease.DiseaseDetection,
        'DiseaseInfo': disease.DiseaseInfo,
        'ForumPost': forum.ForumPost,
        'ForumReply': forum.ForumReply,
        'Transaction': transaction.Transaction,
        'WeatherData': weather.WeatherData,
    }

if __name__ == "__main__":
    # Check if the React build directory exists
    current_dir = os.path.dirname(os.path.abspath(__file__))
    react_build_path = os.path.normpath(os.path.join(current_dir, '..', 'frontend', 'build'))
    
    if os.path.exists(react_build_path):
        logging.info("🌱 PlantCare AI - Running in integrated mode (serving React frontend)")
        logging.info(f"🌐 Access the application at http://localhost:5000")
        logging.info(f"🚀 Forward this port for remote access")
    else:
        logging.info("🌱 PlantCare AI - Running in API-only mode")
        logging.info(f"🌐 API available at http://localhost:5000/api")
        logging.info(f"💻 For development, run the React frontend separately with 'npm start' in the frontend directory")
        logging.info(f"🏗️  Build the React frontend with 'python run.py --build-frontend' to serve everything from this server")
    
    # Run the Flask app with our custom logging already in place
    app.run(
        host="0.0.0.0", 
        port=5000, 
        debug=True
    )
