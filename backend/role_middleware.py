from functools import wraps
from flask import request, jsonify
import jwt

# Secret key (use environment variable in real projects)
SECRET_KEY = "your_secret_key"

def role_required(required_role):
    """
    Middleware to restrict access based on user role
    Usage: @role_required("admin") or @role_required("user")
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            token = None

            # Get token from header
            if "Authorization" in request.headers:
                token = request.headers["Authorization"].split(" ")[1]

            if not token:
                return jsonify({"message": "Token is missing"}), 401

            try:
                # Decode JWT token
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                user_role = data.get("role")

                # Check role
                if user_role != required_role:
                    return jsonify({"message": "Access denied"}), 403

            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"message": "Invalid token"}), 401

            return func(*args, **kwargs)

        return wrapper
    return decorator