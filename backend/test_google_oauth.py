#!/usr/bin/env python3
"""
Test Google OAuth Configuration
This script verifies that Google OAuth credentials are properly configured.
"""

import os
from dotenv import load_dotenv

def test_oauth_config():
    """Test Google OAuth configuration"""
    
    # Load environment variables
    load_dotenv()
    
    print("🔍 Testing Google OAuth Configuration...")
    print("=" * 50)
    
    # Check required environment variables
    required_vars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET', 
        'GOOGLE_REDIRECT_URI',
        'FRONTEND_URL'
    ]
    
    all_configured = True
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'SECRET' in var:
                # Mask secrets for security
                masked_value = value[:8] + '*' * (len(value) - 12) + value[-4:] if len(value) > 12 else '*' * len(value)
                print(f"✅ {var}: {masked_value}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT CONFIGURED")
            all_configured = False
    
    print("=" * 50)
    
    if all_configured:
        print("🎉 Google OAuth is properly configured!")
        print("\n📋 Next Steps:")
        print("1. Start your Flask backend server")
        print("2. Open frontend application")
        print("3. Click 'Continue with Google' button")
        print("4. Test authentication with your Google account")
        
        print("\n🔗 Test URLs:")
        print(f"   Backend: http://localhost:5000")
        print(f"   Frontend: {os.getenv('FRONTEND_URL')}")
        print(f"   Google OAuth: http://localhost:5000/api/auth/google")
        
        print("\n⚠️  Important Notes:")
        print("- Make sure Google Cloud Console has the correct redirect URI")
        print("- Your Google account should be added as test user if restricted")
        print("- Check browser console for any OAuth errors")
        
    else:
        print("❌ Google OAuth configuration is incomplete!")
        print("\n🔧 To fix:")
        print("1. Ensure .env file exists in backend directory")
        print("2. Add all required environment variables")
        print("3. Restart the Flask application")
    
    return all_configured

if __name__ == "__main__":
    test_oauth_config()
