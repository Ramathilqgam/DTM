from flask import Blueprint, request, jsonify, redirect, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
import requests as http_requests
from urllib.parse import urlencode

from ..models.user import User
from ..utils.validators import validate_email, validate_password, validate_name

auth_bp = Blueprint("auth", __name__)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def make_tokens(user_id):
    access = create_access_token(identity=user_id)
    refresh = create_refresh_token(identity=user_id)
    return access, refresh



# POST /api/auth/register
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not validate_name(name):
        return jsonify({"error": "Name must be 2–60 characters."}), 400
    if not validate_email(email):
        return jsonify({"error": "Invalid email address."}), 400
    valid, pw_error = validate_password(password)
    if not valid:
        return jsonify({"error": pw_error}), 400
    if User.find_by_email(email):
        return jsonify({"error": "An account with this email already exists."}), 409

    user = User.create(name=name, email=email, password=password)
    access, refresh = make_tokens(str(user["_id"]))

    return jsonify({
        "message": "Account created successfully.",
        "user": User.to_safe_dict(user),
        "access_token": access,
        "refresh_token": refresh,
    }), 201


# POST /api/auth/login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.find_by_email(email)
    if not user or not User.check_password(user, password):
        return jsonify({"error": "Invalid email or password."}), 401

    if not user.get("is_active"):
        return jsonify({"error": "Account is deactivated. Contact support."}), 403

    access, refresh = make_tokens(str(user["_id"]))
    return jsonify({
        "message": "Login successful.",
        "user": User.to_safe_dict(user),
        "access_token": access,
        "refresh_token": refresh
    }), 200


# GET /api/auth/google
@auth_bp.route("/google", methods=["GET"])
def google_login():
    # Check if Google OAuth is configured
    if not current_app.config.get("GOOGLE_CLIENT_ID") or current_app.config.get("GOOGLE_CLIENT_ID") == "your_google_client_id_here":
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/login?error=google_not_configured")
    
    params = {
        "client_id": current_app.config["GOOGLE_CLIENT_ID"],
        "redirect_uri": current_app.config["GOOGLE_REDIRECT_URI"],
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    return redirect(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


# GET /api/auth/google/callback
@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    code = request.args.get("code")
    if not code:
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/login?error=google_denied")
    
    # Check if Google OAuth is configured
    if not current_app.config.get("GOOGLE_CLIENT_ID") or current_app.config.get("GOOGLE_CLIENT_ID") == "your_google_client_id_here":
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/login?error=google_not_configured")
    
    try:
        token_res = http_requests.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": current_app.config["GOOGLE_CLIENT_ID"],
            "client_secret": current_app.config["GOOGLE_CLIENT_SECRET"],
            "redirect_uri": current_app.config["GOOGLE_REDIRECT_URI"],
            "grant_type": "authorization_code",
        })
        
        if token_res.status_code != 200:
            frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
            error_msg = token_res.json().get("error_description", "token_exchange_failed")
            return redirect(f"{frontend_url}/login?error=google_token_fail&details={error_msg}")
        
        token_data = token_res.json()
        google_access = token_data.get("access_token")
        if not google_access:
            frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
            return redirect(f"{frontend_url}/login?error=google_token_fail")
    except Exception as e:
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/login?error=google_token_fail&details={str(e)}")
    
    userinfo_res = http_requests.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {google_access}"})
    info = userinfo_res.json()
    
    google_id = info.get("sub")
    email = info.get("email")
    name = info.get("name", email.split("@")[0])
    avatar = info.get("picture")
    
    user = User.find_by_google_id(google_id) or User.find_by_email(email)
    if not user:
        user = User.create(name=name, email=email, auth_provider="google", google_id=google_id, avatar=avatar, role="user")
    
    # Link google id/avatar for existing account to make future Google logins seamless.
    if not user.get("google_id"):
        User.collection().update_one(
            {"_id": user["_id"]},
            {"$set": {"google_id": google_id, "avatar": user.get("avatar") or avatar}},
        )
        user = User.find_by_id(str(user["_id"]))
    
    # Generate JWT tokens for Google user
    access, refresh = make_tokens(str(user["_id"]))
    
    # Redirect to frontend with tokens and user info
    frontend_url = current_app.config["FRONTEND_URL"]
    user_data = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "avatar": user.get("avatar"),
        "auth_provider": "google"
    }
    
    return redirect(f"{frontend_url}/auth/callback?access_token={access}&refresh_token={refresh}&user={json.dumps(user_data)}")


# GET /api/auth/me
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": User.to_safe_dict(user)}), 200


# POST /api/auth/logout
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"message": "Logged out successfully."}), 200


# GET /api/auth/users
@auth_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    users = User.collection().find()
    return jsonify([User.to_safe_dict(user) for user in users]), 200
