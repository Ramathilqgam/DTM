#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/digital_talent_db')
client = MongoClient(MONGO_URI)
db = client.get_default_database() or client["digital_talent_db"]

print("🧹 Clearing existing OTP records for ramathilagam1819@gmail.com")

try:
    # Delete all OTP records for this email
    result = db.otps.delete_many({"email": "ramathilagam1819@gmail.com"})
    
    if result.deleted_count > 0:
        print(f"✅ Cleared {result.deleted_count} OTP records")
    else:
        print("ℹ️ No existing OTP records found")
        
    print("🎯 You can now request a new OTP immediately!")
    
except Exception as e:
    print(f"❌ Error clearing OTPs: {e}")
finally:
    client.close()
