#!/usr/bin/env python3

import os
from dotenv import load_dotenv

print("🔧 Checking Environment Variables")
print("=" * 50)

# Load environment variables
load_dotenv()

# Check each variable
variables = [
    'MAIL_SERVER',
    'MAIL_PORT', 
    'MAIL_USE_TLS',
    'MAIL_USERNAME',
    'MAIL_PASSWORD',
    'MAIL_DEFAULT_SENDER',
    'FLASK_ENV',
    'SECRET_KEY',
    'JWT_SECRET_KEY',
    'MONGO_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'FRONTEND_URL'
]

for var in variables:
    value = os.getenv(var)
    status = "✅ SET" if value else "❌ NOT SET"
    print(f"{var:<20}: {status:<10} | {value[:50] if value else 'N/A'}")

print("=" * 50)
print("🔍 Diagnosis:")
print("If MAIL_USERNAME or MAIL_PASSWORD are NOT SET, that's the issue!")
print("You need to add these to your .env file:")
print()
print("MAIL_SERVER=smtp.gmail.com")
print("MAIL_PORT=587")
print("MAIL_USE_TLS=True")
print("MAIL_USERNAME=ramathilagam1819@gmail.com")
print("MAIL_PASSWORD=your_gmail_app_password")
print("MAIL_DEFAULT_SENDER=ramathilagam1819@gmail.com")
