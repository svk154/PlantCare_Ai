import os
from flask import send_from_directory, Flask

def configure_react_serve(app: Flask, react_build_path=None):
    """
    Configure Flask app to serve the React frontend from the root URL.
    This is useful for port forwarding and production scenarios.
    
    Args:
        app: Flask application instance
        react_build_path: Path to the React build directory (if None, will use default path)
    """
    if not react_build_path:
        # Default path is relative to this file, assuming standard project structure
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        react_build_path = os.path.join(current_dir, '..', 'frontend', 'build')
    
    # Normalize path
    react_build_path = os.path.normpath(os.path.abspath(react_build_path))
    
    if not os.path.exists(react_build_path):
        app.logger.warning(
            f"React build directory not found at {react_build_path}. "
            f"Root URL serving is disabled. Run 'npm run build' in the frontend directory."
        )
        # Still register the route but it will return an informative message
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_react_fallback(path):
            return """
            <html>
            <head><title>PlantCare AI - Development Mode</title></head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb;">
                <div style="max-width: 800px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #16a34a;">PlantCare AI - Development Mode</h1>
                    <p>The React frontend build directory was not found. This API server is running in development mode.</p>
                    <p>To access the API directly, use endpoints starting with <code>/api</code>.</p>
                    <p>To serve the frontend from this server, build the React application with:</p>
                    <pre style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; overflow-x: auto;">cd frontend<br>npm run build</pre>
                    <p>For development, access the React dev server directly at <a href="http://localhost:3000">http://localhost:3000</a></p>
                </div>
            </body>
            </html>
            """
        return
    
    # Serve static files from React build directory
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        # If path is an API endpoint, let Flask handle it
        if path.startswith('api/'):
            return app.view_functions[path]()
            
        # Special case for the root path - serve index.html
        if not path:
            return send_from_directory(react_build_path, 'index.html')
            
        # Try to serve the file directly
        if os.path.exists(os.path.join(react_build_path, path)):
            return send_from_directory(react_build_path, path)
            
        # For all other routes, serve the index.html for client-side routing
        return send_from_directory(react_build_path, 'index.html')
        
    # Also handle favicon specially
    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(
            os.path.join(react_build_path, 'favicon.ico'), 
            'favicon.ico'
        )
