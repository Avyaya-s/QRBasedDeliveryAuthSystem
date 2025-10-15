from flask import Flask, render_template, request
from flask_cors import CORS
from deepface import DeepFace
import os
import cv2
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/login": {"origins": "https://deliveryauthsystem.web.app"}})

# Absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
KNOWN_USERS_FOLDER = os.path.join(BASE_DIR, 'static', 'user_images')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(KNOWN_USERS_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    print("[INFO] /login route hit")

    data = request.get_json()
    if not data or 'image' not in data:
        print("⚠️ No image key found in POST data")
        return {"status": "fail", "message": "No image provided"}, 400

    print(f"[INFO] Received keys: {data.keys()}")

    try:
        # Decode base64 image
        header, encoded = data['image'].split(",", 1)
        img_data = base64.b64decode(encoded)
        filename = f"captured_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        img_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(img_path, "wb") as f:
            f.write(img_data)
        print(f"📸 Saved image to: {img_path}")

        # Compare with known user images
        for user_img in os.listdir(KNOWN_USERS_FOLDER):
            user_img_path = os.path.join(KNOWN_USERS_FOLDER, user_img)
            try:
                result = DeepFace.verify(img_path, user_img_path, enforce_detection=False)
                print(f"[INFO] Compared with {user_img}: Verified = {result['verified']}")
                if result["verified"]:
                    return {"status": "success", "user": os.path.splitext(user_img)[0]}
            except Exception as e:
                print(f"[ERROR] Failed to compare with {user_img}: {str(e)}")

        print("❌ No match found")
        return {"status": "fail", "message": "Face not recognized"}

    except Exception as e:
        print("[ERROR] Login error:", str(e))
        return {"status": "fail", "message": "Internal error"}, 500

if __name__ == '__main__':
    print(f"Known users folder: {KNOWN_USERS_FOLDER}")
    app.run(host='0.0.0.0', port=5000, debug=True)
