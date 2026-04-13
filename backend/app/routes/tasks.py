from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models.task import Task
from ..models.user import User

tasks_bp = Blueprint("tasks", __name__)

# Get all tasks (for admin) or user's assigned tasks
@tasks_bp.route("/", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.get("role") == "admin":
        tasks = Task.find_all()
    else:
        tasks = Task.find_visible_to_user(user_id)

    return jsonify([Task.to_dict(task) for task in tasks]), 200


# Create a new task
@tasks_bp.route("/", methods=["POST"])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    if not data.get("title"):
        return jsonify({"error": "Missing required field: title"}), 400

    try:
        due_date = data.get("due_date")

        if due_date:
            try:
                due_date = datetime.strptime(due_date, "%Y-%m-%d")
            except:
                due_date = None

        task = Task.create(
            title=data.get("title"),
            description=data.get("description", ""),
            assigned_to=None,
            created_by=user_id,  # ✅ IMPORTANT FIX
            due_date=due_date,
            priority=data.get("priority", "medium")
        )

        return jsonify(Task.to_dict(task)), 201

    except Exception as e:
        print("CREATE ERROR:", str(e))
        return jsonify({"error": str(e)}), 400


# Update task
@tasks_bp.route("/<task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    task = Task.find_by_id(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.get("role") != "admin" and str(task.get("assigned_to")) != user_id and str(task.get("created_by")) != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    update_data = {}

    for field in ["title", "description", "status", "priority", "due_date"]:
        if field in data:
            update_data[field] = data[field]

    if not update_data:
        return jsonify({"error": "No fields to update"}), 400

    try:
        if Task.update(task_id, update_data):
            updated_task = Task.find_by_id(task_id)
            return jsonify(Task.to_dict(updated_task)), 200
        return jsonify({"error": "Update failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Delete task
@tasks_bp.route("/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    task = Task.find_by_id(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    if user.get("role") != "admin" and str(task.get("assigned_to")) != user_id and str(task.get("created_by")) != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        if Task.delete(task_id):
            return jsonify({"message": "Deleted"}), 200
        return jsonify({"error": "Delete failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Get single task
@tasks_bp.route("/<task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    task = Task.find_by_id(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.get("role") != "admin" and str(task.get("assigned_to")) != user_id and str(task.get("created_by")) != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify(Task.to_dict(task)), 200
