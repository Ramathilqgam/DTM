#!/usr/bin/env python3
"""
Test Face Registration
This script tests the face registration endpoint to ensure it works properly.
"""

import base64
import io
import requests
from PIL import Image
import numpy as np

def create_test_image():
    """Create a test image for face registration testing"""
    # Create a simple test image (simulating a face)
    image = Image.new('RGB', (640, 480), color='white')
    
    # Convert to base64
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG')
    image_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/jpeg;base64,{image_str}"

def test_face_registration():
    """Test the face registration endpoint"""
    
    print("Testing Face Registration Endpoint...")
    print("=" * 50)
    
    # Create test image data
    test_image = create_test_image()
    
    # Test data
    test_data = {
        "image": test_image
    }
    
    try:
        # Test the registration endpoint
        response = requests.post(
            "http://localhost:5000/api/face-login/register",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("Face registration test: PASSED")
                print(f"Quality Score: {result.get('quality_score')}")
                print(f"Message: {result.get('message')}")
            else:
                print("Face registration test: FAILED")
                print(f"Error: {result.get('error')}")
        else:
            print("Face registration test: FAILED")
            print(f"HTTP Error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("Connection Error: Make sure the Flask server is running on localhost:5000")
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_face_registration()
