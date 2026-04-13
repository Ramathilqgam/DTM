#!/usr/bin/env python3

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔧 Google OAuth Configuration Check")
print("=" * 50)

# Check each variable
google_vars = {
    'GOOGLE_CLIENT_ID': os.getenv('GOOGLE_CLIENT_ID'),
    'GOOGLE_CLIENT_SECRET': os.getenv('GOOGLE_CLIENT_SECRET'),
    'GOOGLE_REDIRECT_URI': os.getenv('GOOGLE_REDIRECT_URI'),
    'FRONTEND_URL': os.getenv('FRONTEND_URL')
}

for var_name, value in google_vars.items():
    status = "✅ SET" if value else "❌ NOT SET"
    print(f"{var_name:<20}: {status:<10} | {value[:50] if value else 'N/A'}")

print("=" * 50)
print("🔍 Diagnosis:")
print("❌ Error 401: invalid_client")
print("➡ This means GOOGLE_CLIENT_ID is missing or incorrect")
print("➡ Check your .env file and ensure:")
print("   GOOGLE_CLIENT_ID=your_actual_google_client_id")
print("   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret")
print("   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback")
print("   FRONTEND_URL=http://localhost:5174")
print()
print("🔑 Get Google OAuth Credentials:")
print("   1. Go to Google Cloud Console")
print("   2. Select your project")
print("   3. Go to APIs & Services → Credentials")
print("   4. Create OAuth 2.0 Client ID")
print("   5. Copy Client ID and Secret")
