from flask import Blueprint, jsonify
from bson import ObjectId
from ..extensions import mongo

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/analytics", methods=["GET"])
def get_analytics():
    try:
        tasks_collection = mongo.db.tasks

        # Total tasks
        total_tasks = tasks_collection.count_documents({})

        # Status counts
        pending_tasks = tasks_collection.count_documents({"status": "pending"})
        in_progress_tasks = tasks_collection.count_documents({"status": "in_progress"})
        completed_tasks = tasks_collection.count_documents({"status": "completed"})

        # Completion rate calculation
        completion_rate = 0
        if total_tasks > 0:
            completion_rate = (completed_tasks / total_tasks) * 100

        return jsonify({
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completion_rate, 2)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500