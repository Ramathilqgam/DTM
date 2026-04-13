#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from flask import Flask
from flask_mail import Mail, Message

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure mail
app.config.update(
    MAIL_SERVER=os.getenv('MAIL_SERVER', 'smtp.gmail.com'),
    MAIL_PORT=int(os.getenv('MAIL_PORT', 587)),
    MAIL_USE_TLS=os.getenv('MAIL_USE_TLS', 'True').lower() == 'true',
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.getenv('MAIL_DEFAULT_SENDER')
)

print("🔧 Email Configuration Test")
print("=" * 50)
print(f"MAIL_SERVER: {app.config['MAIL_SERVER']}")
print(f"MAIL_PORT: {app.config['MAIL_PORT']}")
print(f"MAIL_USE_TLS: {app.config['MAIL_USE_TLS']}")
print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
print(f"MAIL_PASSWORD: {'Configured' if app.config['MAIL_PASSWORD'] else 'NOT SET'}")
print(f"MAIL_DEFAULT_SENDER: {app.config['MAIL_DEFAULT_SENDER']}")
print("=" * 50)

# Initialize mail
try:
    mail = Mail(app)
    print("✅ Mail initialized successfully")
except Exception as e:
    print(f"❌ Mail initialization failed: {e}")
    exit(1)

# Test email sending
try:
    print("📧 Attempting to send test email...")
    
    msg = Message(
        "DTM Email Test",
        sender=app.config['MAIL_DEFAULT_SENDER'],
        recipients=["ramathilagam1819@gmail.com"]
    )
    msg.body = "This is a test email from DTM OTP system."
    msg.html = """
    <html>
    <body>
        <h2>DTM Email Test</h2>
        <p>If you receive this email, the email configuration is working correctly!</p>
        <p>Time: <strong>{import datetime; datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</strong></p>
    </body>
    </html>
    """
    
    with app.app_context():
        mail.send(msg)
    
    print("✅ Test email sent successfully!")
    print("📧 Check your inbox for the test email.")
    
except Exception as e:
    print(f"❌ Failed to send test email: {e}")
    print(f"❌ Error type: {type(e).__name__}")
    import traceback
    print(f"❌ Full error: {traceback.format_exc()}")
    print("\n🔍 Common Issues:")
    print("1. Using regular Gmail password instead of App Password")
    print("2. 2-factor authentication not enabled")
    print("3. App Password generated for wrong app")
    print("4. Firewall blocking SMTP connections")
    print("5. Incorrect email address")
