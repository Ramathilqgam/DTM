import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import os

from .config import Config
from .extensions import mongo, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    mail = Mail(app)

    # CORS
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.tasks import tasks_bp
    from .routes.analytics import analytics_bp
    from .routes.ai import ai_bp
    from .routes.audio import audio_bp
    from .routes.collaboration import collaboration_bp
    from .routes.gamification import gamification_bp
    from .routes.analytics_enhanced import analytics_bp
    from .routes.calendar import calendar_bp
    from .routes.priority_matrix import priority_matrix_bp
    from .routes.reminders import reminders_bp
    from .routes.recurring_tasks import recurring_tasks_bp
    from .routes.team_tasks import team_tasks_bp
    from .routes.advanced_dashboard import advanced_dashboard_bp
    from .routes.calendar_view import calendar_view_bp
    from .routes.smart_automation import smart_automation_bp
    from .routes.google_calendar import google_calendar_bp
    from .routes.email_integration import email_integration_bp
    from .routes.slack_discord_integration import slack_discord_bp
    from .routes.ai_interview import ai_interview_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(audio_bp, url_prefix="/api/audio")
    app.register_blueprint(collaboration_bp, url_prefix="/api/collaboration")
    app.register_blueprint(gamification_bp, url_prefix="/api/gamification")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics-enhanced", name='analytics_enhanced')
    app.register_blueprint(calendar_bp, url_prefix="/api/calendar")
    app.register_blueprint(priority_matrix_bp, url_prefix="/api/priority-matrix")
    app.register_blueprint(reminders_bp, url_prefix="/api/reminders")
    app.register_blueprint(recurring_tasks_bp, url_prefix="/api/recurring-tasks")
    app.register_blueprint(team_tasks_bp, url_prefix="/api/team-tasks")
    app.register_blueprint(advanced_dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(calendar_view_bp, url_prefix="/api/calendar-view")
    app.register_blueprint(smart_automation_bp, url_prefix="/api/automation")
    app.register_blueprint(google_calendar_bp, url_prefix="/api/google-calendar")
    app.register_blueprint(email_integration_bp, url_prefix="/api/email")
    app.register_blueprint(slack_discord_bp, url_prefix="/api/integrations")
    app.register_blueprint(ai_interview_bp, url_prefix="/api/ai-interview")

    # Health check route
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "message": "DTMS backend is running"}), 200

    return app