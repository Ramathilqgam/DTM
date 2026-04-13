#!/usr/bin/env python3
"""
Fix .env file with proper MongoDB configuration
"""

import os

# Create .env file with working configuration
env_content = """FLASK_ENV=development
SECRET_KEY=dtms_secret_key_2024_development
JWT_SECRET_KEY=dtms_jwt_secret_key_2024_development
MONGO_URI=mongodb://localhost:27017/digital_talent_db
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173

# Email Configuration for OTP (Production)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
"""

try:
    with open('.env', 'w') as f:
        f.write(env_content)
    print("Successfully created .env file with working configuration")
    print("MongoDB URI set to: mongodb://localhost:27017/digital_talent_db")
    print("Please restart the Flask server")
except Exception as e:
    print(f"Error creating .env file: {e}")
