from datetime import datetime
from bson import ObjectId
from ..extensions import mongo


class Task:
    COLLECTION = "tasks"
    STATUS_OPTIONS = ["pending", "in_progress", "completed"]

    @staticmethod
    def collection():
        return mongo.db[Task.COLLECTION]

    @staticmethod
    def create(title, description, created_by, due_date=None, priority="medium", assigned_to=None):
        # ✅ assigned_to is now optional — only convert to ObjectId if provided
        assigned_to_val = None
        if assigned_to and str(assigned_to).strip():
            try:
                assigned_to_val = ObjectId(assigned_to)
            except Exception:
                assigned_to_val = None

        task_doc = {
            "title": title,
            "description": description,
            "assigned_to": assigned_to_val,
            "created_by": ObjectId(created_by) if isinstance(created_by, str) else created_by,
            "status": "pending",
            "priority": priority,
            "due_date": due_date,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = Task.collection().insert_one(task_doc)
        task_doc["_id"] = result.inserted_id
        return task_doc

    @staticmethod
    def find_by_id(task_id):
        return Task.collection().find_one({"_id": ObjectId(task_id)})

    @staticmethod
    def find_by_user(user_id):
        return list(Task.collection().find({"assigned_to": ObjectId(user_id)}))

    @staticmethod
    def find_visible_to_user(user_id):
        oid = ObjectId(user_id)
        return list(Task.collection().find({
            "$or": [
                {"created_by": oid},
                {"assigned_to": oid},
            ]
        }))

    @staticmethod
    def find_all():
        return list(Task.collection().find())

    @staticmethod
    def update(task_id, update_data):
        # ✅ Remove assigned_to from updates if present and empty
        if "assigned_to" in update_data:
            val = update_data["assigned_to"]
            if val and str(val).strip():
                try:
                    update_data["assigned_to"] = ObjectId(val)
                except Exception:
                    del update_data["assigned_to"]
            else:
                del update_data["assigned_to"]

        update_data["updated_at"] = datetime.utcnow()
        result = Task.collection().update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    @staticmethod
    def delete(task_id):
        result = Task.collection().delete_one({"_id": ObjectId(task_id)})
        return result.deleted_count > 0

    @staticmethod
    def to_dict(task_doc):
        assigned = task_doc.get("assigned_to")
        return {
            "id": str(task_doc["_id"]),
            "title": task_doc.get("title"),
            "description": task_doc.get("description"),
            # ✅ safely handles None assigned_to without crashing
            "assigned_to": str(assigned) if assigned else None,
            "created_by": str(task_doc.get("created_by", "")),
            "status": task_doc.get("status", "pending"),
            "priority": task_doc.get("priority", "medium"),
            "due_date": task_doc.get("due_date").isoformat() if task_doc.get("due_date") else None,
            "created_at": task_doc.get("created_at").isoformat() if task_doc.get("created_at") else None,
            "updated_at": task_doc.get("updated_at").isoformat() if task_doc.get("updated_at") else None,
        }