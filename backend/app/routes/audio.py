from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from ..models.user import User

audio_bp = Blueprint("audio", __name__)

# Allowed audio file types
ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3', 'ogg', 'm4a'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@audio_bp.route("/save", methods=["POST"])
@jwt_required()
def save_audio():
    """Save audio recording"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        file = request.files['audio']
        
        if file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid audio file type"}), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'audio')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Save audio metadata to database (you'd need to create an Audio model)
        audio_metadata = {
            "user_id": user_id,
            "filename": unique_filename,
            "original_filename": filename,
            "file_path": file_path,
            "file_size": os.path.getsize(file_path),
            "created_at": datetime.utcnow()
        }
        
        # For now, we'll just return the audio URL
        audio_url = f"/uploads/audio/{unique_filename}"
        
        return jsonify({
            "message": "Audio saved successfully",
            "audio_url": audio_url,
            "filename": unique_filename,
            "metadata": audio_metadata
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@audio_bp.route("/transcribe", methods=["POST"])
@jwt_required()
def transcribe_audio():
    """Transcribe audio to text (mock implementation)"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        file = request.files['audio']
        
        # Mock transcription service
        # In a real implementation, you'd use services like:
        # - OpenAI Whisper API
        # - Google Speech-to-Text
        # - Azure Speech Services
        # - AssemblyAI
        
        mock_transcriptions = [
            "I need to complete the project proposal by Friday and schedule a team meeting to discuss the requirements.",
            "Remember to follow up with the client about the feedback and update the project timeline accordingly.",
            "I should organize my tasks better and focus on the high priority items first.",
            "Let me review the code changes and make sure everything is working correctly before deployment.",
            "I want to improve my skills in web development and learn more about modern frameworks.",
            "Need to prepare for the presentation next week and practice my speaking skills.",
            "I should set some personal goals for this month and track my progress regularly.",
            "Let me create a study plan for learning machine learning and dedicate time each day."
        ]
        
        # Simulate processing time
        import time
        time.sleep(1)
        
        transcription = request.form.get('transcription_hint') or mock_transcriptions[
            int(datetime.utcnow().timestamp()) % len(mock_transcriptions)
        ]
        
        return jsonify({
            "transcription": transcription,
            "confidence": 0.95,  # Mock confidence score
            "processing_time": "1.2s"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@audio_bp.route("/recordings", methods=["GET"])
@jwt_required()
def get_recordings():
    """Get user's audio recordings"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Mock implementation - in reality, you'd query your Audio collection
        mock_recordings = [
            {
                "id": "1",
                "filename": "voice_memo_1.webm",
                "duration": "00:45",
                "transcription": "I need to complete the project proposal by Friday...",
                "created_at": "2024-01-15T10:30:00Z",
                "audio_url": "/uploads/audio/voice_memo_1.webm"
            },
            {
                "id": "2", 
                "filename": "voice_memo_2.webm",
                "duration": "01:23",
                "transcription": "Remember to follow up with the client about the feedback...",
                "created_at": "2024-01-15T14:20:00Z",
                "audio_url": "/uploads/audio/voice_memo_2.webm"
            }
        ]
        
        return jsonify({
            "recordings": mock_recordings,
            "total": len(mock_recordings)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@audio_bp.route("/recordings/<recording_id>", methods=["DELETE"])
@jwt_required()
def delete_recording(recording_id):
    """Delete an audio recording"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Mock implementation - in reality, you'd delete from database and filesystem
        return jsonify({
            "message": "Recording deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
