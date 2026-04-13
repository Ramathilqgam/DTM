# Fix MongoDB URI in .env file
with open('.env', 'r') as f:
    content = f.read()

# Replace the problematic MongoDB URI with a working one
fixed_content = content.replace(
    'mongodb+srv://ram:ram123@cluster0.abcd.mongodb.net/digital_talent_db?retryWrites=true&w=majority',
    'mongodb://localhost:27017/digital_talent_db'
)

with open('.env', 'w') as f:
    f.write(fixed_content)

print("✅ MongoDB URI fixed to use localhost")
print("🔄 Please restart the Flask server")
