import sys
sys.path.append('.')
from app.models.user import User
from app.extensions import mongo
from flask import Flask

# Initialize Flask app to get MongoDB connection
app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://localhost:27017/digital_talent_db'
mongo.init_app(app)

# Check if user exists
try:
    user = User.find_by_email('thelittleone248@gmail.com')
    if user:
        print('User found:')
        print(f'ID: {user["_id"]}')
        print(f'Email: {user["email"]}')
        print(f'Name: {user["name"]}')
        print(f'Auth Provider: {user.get("auth_provider", "local")}')
        print(f'Is Active: {user.get("is_active", True)}')
        print(f'Has Password: {bool(user.get("password"))}')
        if user.get('password'):
            print(f'Password Hash: {user["password"][:50]}...')
    else:
        print('User not found in database')
except Exception as e:
    print(f'Error: {e}')
