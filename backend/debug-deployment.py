#!/usr/bin/env python3
"""
Debug script for Render deployment
"""
import os
import sys
from pymongo import MongoClient

def test_connections():
    print("=== DTM Backend Deployment Debug ===")
    
    # Test MongoDB Connection
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/digital_talent_db')
        print(f"Testing MongoDB: {mongo_uri}")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("MongoDB: SUCCESS")
    except Exception as e:
        print(f"MongoDB: FAILED - {e}")
    
    # Test Flask App
    try:
        from app import create_app
        app = create_app()
        with app.app_context():
            print("Flask App: SUCCESS")
    except Exception as e:
        print(f"Flask App: FAILED - {e}")
    
    # Test Environment Variables
    required_vars = ['FLASK_ENV', 'SECRET_KEY', 'JWT_SECRET_KEY', 'MONGO_URI', 'FRONTEND_URL']
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"{var}: SET")
        else:
            print(f"{var}: MISSING")

if __name__ == "__main__":
    test_connections()
