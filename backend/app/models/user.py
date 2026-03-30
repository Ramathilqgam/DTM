from datetime import datetime
from bson import ObjectId
from ..extensions import mongo
import bcrypt


class User:
    COLLECTION = "users"

    @staticmethod
    def collection():
        return mongo.db[User.COLLECTION]

    @staticmethod
    def create(name, email, password=None, auth_provider="local", google_id=None, avatar=None):
        hashed = None
        if password:
            hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user_doc = {
            "name": name,
            "email": email.lower().strip(),
            "password": hashed,
            "role": "user",
            "auth_provider": auth_provider,
            "google_id": google_id,
            "avatar": avatar,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = User.collection().insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        return user_doc

    @staticmethod
    def find_by_email(email):
        return User.collection().find_one({"email": email.lower().strip()})

    @staticmethod
    def find_by_id(user_id):
        return User.collection().find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def find_by_google_id(google_id):
        return User.collection().find_one({"google_id": google_id})

    @staticmethod
    def check_password(user_doc, password):
        if not user_doc.get("password"):
            return False
        return bcrypt.checkpw(password.encode("utf-8"), user_doc["password"].encode("utf-8"))

    @staticmethod
    def to_safe_dict(user_doc):
        return {
            "id": str(user_doc["_id"]),
            "name": user_doc.get("name"),
            "email": user_doc.get("email"),
            "role": user_doc.get("role", "user"),
            "auth_provider": user_doc.get("auth_provider", "local"),
            "avatar": user_doc.get("avatar"),
            "created_at": user_doc.get("created_at", "").isoformat() if user_doc.get("created_at") else None,
        }
