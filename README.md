# <b>QR-Based Multi-Layer Delivery Authentication System</b>

A secure delivery authentication system designed to prevent unauthorized parcel access by combining QR-based identification, cloud authentication, liveness detection, and face verification, with real-time hardware control using ESP32.<br><br>

This project emphasizes <b>system integration</b>, <b>verification pipeline design</b>, and <b>real-world deployment</b>, rather than training or optimizing AI models.

 

## <b>📌 Problem Statement</b>

In shared environments such as hostels, apartments, and campuses, parcels are often collected by unauthorized individuals.<br>
Traditional OTP or QR-only systems lack identity assurance and are vulnerable to spoofing.

 

## <b>💡 Proposed Solution</b>

Each delivery is protected using a <b>two-step, two-layer verification pipeline</b>, ensuring that only the intended recipient can unlock the delivery box.

 

## <b>🧠 Authentication Architecture</b>

### <b>Step 1: QR-Based Login Authentication</b>

- A unique QR code is generated for every delivery  
- QR embeds a <b>Delivery ID</b>  
- User scans the QR and is redirected to a Firebase-hosted web application  
- User logs in using <b>email & password</b>  
- Establishes <b>user–delivery binding</b>  

 

### <b>Step 2: Biometric Verification (Two Layers)</b>

#### <b>🔍 Layer 1: Liveness Detection (Blink Verification)</b>

- Implemented using <b>MediaPipe Face Mesh</b>  
- Eye-blink detected using eyelid landmark distance  
- Ensures presence of a <b>live human user</b>  
- Prevents spoofing via images or videos  

#### <b>👤 Layer 2: Face Verification</b>

- Face image captured <b>only after successful blink</b>  
- Image sent to a <b>Flask backend server</b>  
- Compared against registered user images using <b>DeepFace</b>  
- Verification is used as an <b>identity confirmation layer</b>, not as a trained model  

<b>✔ Approval is granted only if both layers succeed</b>

 

## <b>⚙️ End-to-End System Flow</b>

1. ESP32 displays a QR code for a specific delivery  
2. User scans QR → redirected to web interface  
3. User logs in using Firebase Authentication  
4. Camera activates for face capture  
5. Blink detection confirms liveness  
6. Captured image sent to Flask server  
7. Face verification performed  
8. Approval status updated in Firebase  
9. ESP32 reads approval status  
10. Servo motors unlock the delivery box  

 

## <b>🛠️ Technologies Used</b>

### <b>Frontend</b>
- HTML, CSS, JavaScript  
- MediaPipe Face Mesh  
- Firebase Hosting  

### <b>Backend</b>
- Python (Flask)  
- DeepFace (face verification)  
- Flask-CORS  

### <b>Cloud</b>
- Firebase Authentication  
- Firebase Firestore / Realtime Database  
- Firebase Hosting  

### <b>Hardware</b>
- ESP32  
- Servo Motors  
- LCD Display  
- Red & Green Status LEDs  

 

## <b>📁 Project Structure</b>

DeliveryAuthSystem/ <br>
│<br>
├── public/ # Firebase-hosted frontend<br>
│ ├── index.html<br>
│ ├── auth.html<br>
│ ├── face.html<br>
│ ├── thankyou.html<br>
│ └── static/script.js<br>
│<br>
├── face-server/ # Flask backend<br>
│ ├── app.py<br>
│ ├── requirements.txt<br>
│ ├── static/<br>
│ │ ├── uploads/<br>
│ │ └── user_images/<br>
│ ├── templates/<br>
│ └── venv/<br>
│<br>
├── firebase.json<br>
├── .firebaserc<br>
├── .gitignore<br>
└── README.md<br>


 

## <b>🔒 Security & Design Highlights</b>

- Unique QR per delivery  
- Cloud-based authentication  
- Two-layer biometric verification  
- Liveness detection to prevent spoofing  
- Backend-controlled approval logic  
- Hardware actions tied directly to cloud state  

 

## <b>🎯 Key Focus Areas of the Project</b>

- Secure authentication pipeline design  
- Multi-layer verification strategy  
- Web–backend–hardware integration  
- Real-time cloud-controlled actuation  
- Practical deployment considerations  

 

## <b>🚀 Possible Extensions</b>

- ESP32-CAM integration  
- Mobile application interface  
- Offline fallback authentication  
- Audit logging and analytics  
- Edge-based verification  

 

## <b>📌 Note</b>

This project focuses on <b>system architecture and integration</b>.<br>
AI libraries are used as <b>verification components</b>, not as custom-trained models.<br><br>

Sensitive credentials such as Firebase service account keys are intentionally excluded.
