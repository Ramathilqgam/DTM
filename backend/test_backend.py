#!/usr/bin/env python3
"""
Test backend startup without MongoDB dependency
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    print("Successfully imported app module")
    
    app = create_app()
    print("Successfully created Flask app")
    
    # Test basic configuration
    print(f"SECRET_KEY: {app.config.get('SECRET_KEY', 'Not set')}")
    print(f"MONGO_URI: {app.config.get('MONGO_URI', 'Not set')}")
    print(f"JWT_SECRET_KEY: {app.config.get('JWT_SECRET_KEY', 'Not set')}")
    
    print("Backend configuration looks good!")
    
except Exception as e:
    print(f"Error creating app: {e}")
    import traceback
    traceback.print_exc()
