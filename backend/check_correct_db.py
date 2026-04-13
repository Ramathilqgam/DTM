import sys
sys.path.append('.')
from app.models.user import User
from app.extensions import mongo
from flask import Flask

# Initialize Flask app with correct config
app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://localhost:27017/digital_talent_db'
mongo.init_app(app)

# Check if user exists in the correct database
try:
    print("=== Checking active database (digital_talent_db) ===")
    user = User.find_by_email('thelittleone248@gmail.com')
    if user:
        print('User found in digital_talent_db:')
        print(f'ID: {user["_id"]}')
        print(f'Email: {user["email"]}')
        print(f'Name: {user["name"]}')
        print(f'Has Password: {bool(user.get("password"))}')
        
        # Test password
        if User.check_password(user, 'password123'):
            print('Password check: PASSED')
        else:
            print('Password check: FAILED')
    else:
        print('User NOT found in digital_talent_db')
        print('The account may have been created in a different local database')
        
        # Create user in the active database
        print('\nCreating user in active database...')
        new_user = User.create(
            name='Test User',
            email='thelittleone248@gmail.com',
            password='password123'
        )
        print('User created successfully in digital_talent_db!')
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
