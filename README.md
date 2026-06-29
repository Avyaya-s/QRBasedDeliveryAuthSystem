# QR-Based Delivery Authentication System

> A multi-factor, IoT-integrated parcel security system combining QR code access, cloud authentication, facial recognition, and hardware-controlled physical locking — built for last-mile delivery security.

**Institution:** RV College of Engineering, Bengaluru – 560059  
**Program:** IDEA Lab SEE Project — Semester II, 2024–2025  
**Branch:** Computer Science and Engineering | Section A | Batch 2  
**Mentor:** Dr. Chandrakumar R | Dr. G R Rajkumar

| Name | USN |
|------|-----|
| Avyaya S Yekkar | 1RV24CS057 |
| Bhuvan K K | 1RV24CS060 |
| Chethan Suhas S | 1RV24CS066 |
| Chidanand Gowda | 1RV24CS067 |

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [System Architecture](#system-architecture)
4. [Authentication Flow](#authentication-flow)
5. [Technical Stack](#technical-stack)
6. [Component Breakdown](#component-breakdown)
7. [Installation and Setup](#installation-and-setup)
8. [Results and Performance](#results-and-performance)
9. [Real-World Applications](#real-world-applications)
10. [Future Work](#future-work)
11. [References](#references)

---

## Overview

The QR-Based Delivery Authentication System is a smart, IoT-enabled security solution that prevents unauthorized parcel access through three sequential layers of verification:

1. **QR Code Scanning** — Each delivery is assigned a unique QR code linking to a delivery-specific web page.
2. **Cloud-Based Identity Authentication** — The recipient logs in via Firebase-authenticated email and password credentials.
3. **Biometric Face Verification** — DeepFace and MediaPipe perform real-time liveness detection and face matching before granting access.

Only upon successfully completing all three layers does the system trigger an ESP32 microcontroller to actuate a servo motor, physically unlocking the delivery box.

---

## Problem Statement

In traditional delivery systems, parcels are routinely left unattended at doorsteps, making them susceptible to:

- **Theft** by unauthorized individuals
- **Tampering** with package contents
- **Delivery errors** due to lack of recipient verification
- **Impersonation** where a third party collects the parcel on behalf of the recipient

Single-factor systems (PIN codes, signatures, standard QR codes) are easily bypassed or shared. There is a critical gap in last-mile delivery for a solution that enforces biometric-level, user-specific identity verification. This project addresses that gap with a scalable, multi-factor authentication pipeline built on accessible hardware and cloud infrastructure.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DELIVERY FLOW                           │
│                                                                 │
│  [QR Code Generated]                                            │
│         │                                                       │
│         ▼                                                       │
│  [Recipient Scans QR] ──► deliveryauthsystem.web.app/auth.html  │
│                                    │                            │
│                                    ▼                            │
│                         [Firebase Auth Login]                   │
│                         Email + Password Verification           │
│                                    │                            │
│                          ✓ Credentials valid                    │
│                                    │                            │
│                                    ▼                            │
│                         [Face Verification Page]                │
│                         MediaPipe: Liveness (blink detection)   │
│                         DeepFace: Face match against stored img  │
│                                    │                            │
│                          ✓ Face verified (≥ 0.9 similarity)     │
│                                    │                            │
│                                    ▼                            │
│                    [Firebase Firestore: Status → "approved"]    │
│                                    │                            │
│                                    ▼                            │
│                    [ESP32 reads status change via Firebase]      │
│                                    │                            │
│                                    ▼                            │
│                    [Servo Motor: 0° → 90° — Box Unlocked]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Layer 1 — QR Code Access
Each delivery is registered in Firestore with a unique product ID. A QR code encodes the URL:
```
https://deliveryauthsystem.web.app/auth.html?id=<productId>
```
The ID ties the session to a specific delivery record, ensuring the authentication attempt is always linked to the correct parcel and owner.

### Layer 2 — Firebase Authentication
The web interface checks Firebase Auth for an active session. If none exists, the recipient is prompted to log in with their registered email and password. Upon login, the system queries Firestore to verify:
- The logged-in user's email matches the `owner` field of the delivery document
- The delivery has not already been approved (preventing replay access)

If either check fails, access is denied and the user is signed out.

### Layer 3 — Biometric Face Verification
The user is redirected to the face verification page (`face.html`), where:

**Liveness Detection (MediaPipe FaceMesh):** The camera feed is processed frame-by-frame. The system tracks 468 facial landmarks in real-time. A blink is required within a 5-second window by measuring the eye aspect ratio across key landmark indices (145, 159, 374, 386). If the average eye distance drops below 0.015, a blink is confirmed — this guards against photo spoofing attacks.

**Face Matching (DeepFace + Flask backend):** On confirmed blink, a frame is captured and sent as a base64-encoded image to the Flask backend via a POST request to `/login`. The backend decodes the image, saves it temporarily, and runs `DeepFace.verify()` against stored reference images of authorized users. A similarity threshold of ≥ 0.9 is required for a match.

**Result Handling:** On a successful match, the backend returns `{"status": "success", "user": "<name>"}`. The frontend updates Firestore (`status: "approved"`) and redirects to the confirmation page. The ESP32, polling Firestore, detects the status change and triggers the servo motor.

### Layer 4 — Physical Unlock (Hardware)
The ESP32 microcontroller connects to Wi-Fi and maintains a listener on the Firestore delivery document. When `status` changes to `"approved"`, it generates a PWM signal to rotate the servo motor from 0° to 90°, physically unlocking the delivery box. Response time is under 1 second from verification to unlock.

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML, CSS, JavaScript | Multi-page web interface |
| Hosting | Firebase Hosting | Serves the web interface globally |
| Authentication | Firebase Auth | Email/password user management |
| Database | Firebase Firestore | Delivery records and status management |
| Face Detection | MediaPipe FaceMesh | Real-time landmark tracking and liveness |
| Face Recognition | DeepFace 0.0.93 | Deep learning face verification |
| ML Backend | TensorFlow 2.11.0 | DeepFace model inference |
| Backend Server | Python + Flask | Image processing and face matching API |
| Computer Vision | OpenCV | Image decoding and preprocessing |
| Microcontroller | ESP32 | Wi-Fi connectivity and servo control |
| Actuation | Servo Motor (PWM) | Physical lock mechanism |
| Tunneling | ngrok | Exposes local Flask server publicly |

---

## Component Breakdown

### Frontend Pages

| Page | Path | Role |
|------|------|------|
| Auth Page | `/auth.html?id=<productId>` | Login, delivery info, approval trigger |
| Face Page | `/face.html?id=<productId>` | Camera, blink detection, face capture |
| Thank You | `/thankyou.html` | Delivery approved confirmation |
| 404 | `/404.html` | Error handling |

### Backend (`face-server/app.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Renders login template |
| `/login` | POST | Accepts base64 image, runs DeepFace verification, returns match result |

The `/login` endpoint:
1. Decodes the base64 image from the request body
2. Saves it to `static/uploads/` with a timestamp filename
3. Iterates over all images in `static/user_images/`
4. Calls `DeepFace.verify(captured, reference, enforce_detection=False)` for each
5. Returns `{"status": "success", "user": <name>}` on first match, or `{"status": "fail"}` if none match

CORS is restricted to `https://deliveryauthsystem.web.app` only.

### Hardware (ESP32)
- Connects to Wi-Fi on startup
- Maintains a Firestore listener on the delivery document
- On `status == "approved"`, sends a PWM signal at ~50Hz to rotate the servo from 0° to 90°
- Resets servo to 0° after a configurable timeout

### Project Structure

```
DeliveryAuthSystem/
│
├── public/                     # Firebase-hosted frontend
│   ├── auth.html               # Login + delivery verification page
│   ├── face.html               # Liveness + face capture page
│   ├── thankyou.html           # Success confirmation page
│   ├── 404.html                # Error page
│   └── static/
│       └── script.js           # MediaPipe + DeepFace integration logic
│
├── face-server/                # Flask backend
│   ├── app.py                  # Main server — face verification API
│   ├── requirements.txt        # Python dependencies
│   ├── Procfile                # Process declaration
│   ├── .python-version         # Python version pin (3.10)
│   ├── static/
│   │   ├── uploads/            # Captured images (temporary)
│   │   └── user_images/        # Reference photos of authorized recipients
│   ├── templates/
│   │   └── login.html
│   └── venv/                   # Virtual environment
│
├── firebase.json               # Firebase hosting configuration
├── .firebaserc                 # Firebase project binding
└── .gitignore
```

---

## Installation and Setup

### Prerequisites
- Python 3.10
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- ngrok

### Backend Setup

```bash
cd face-server

# Activate virtual environment
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate          # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Add reference photo of authorized recipient
# Place in: face-server/static/user_images/<recipient_name>.jpg

# Start the server
python app.py
```

### Expose Backend via ngrok

```bash
# In a separate terminal
ngrok http 5000
```

Copy the `https://` URL provided by ngrok.

### Update Frontend with Backend URL

In `public/static/script.js`, update the fetch call:
```js
fetch('https://<your-ngrok-url>/login', {
```

### Deploy Frontend

```bash
firebase login
firebase deploy --only hosting
```

Frontend is live at `https://deliveryauthsystem.web.app`.

### Adding Authorized Users
Place a clear, front-facing photo of the authorized recipient in:
```
face-server/static/user_images/<recipient_name>.jpg
```
The filename (without extension) is returned as the matched user's name on successful verification.

---

## Results and Performance

| Metric | Result |
|--------|--------|
| Face recognition accuracy | ~97% under standard lighting |
| End-to-end authentication time | 6–8 seconds |
| Unauthorized access attempts blocked | 100% during testing |
| Servo motor response time | < 1 second post-verification |
| System uptime during testing | 100% (no crashes or failures) |
| Face match similarity threshold | ≥ 0.9 |
| Test participants | 10 users in simulated hostel environment |

**Key observations:**
- Accuracy drops under poor or uneven lighting; consistent ambient light is recommended.
- The 5-second blink window was sufficient for all test users under normal conditions.
- All unauthorized face mismatch attempts were correctly denied with no false positives recorded.
- Users reported high satisfaction with ease of use and perceived security.

---

## Real-World Applications

### Hostel and PG Accommodation Delivery
The most immediate application. Parcels addressed to hostel residents can be deposited in a shared secure box. The resident receives a QR code via SMS or email. Without their face verification, no one else — including hostel staff — can open the box.

### Apartment Complex Smart Lockers
In gated communities and apartment buildings, a bank of smart delivery boxes can each run this system. Delivery agents deposit parcels without needing to reach the recipient's floor. The resident collects at their convenience using the QR and face verification.

### Last-Mile E-Commerce Delivery
E-commerce platforms can issue unique QR codes per order. The recipient performs face verification via their phone before the box opens, eliminating signature fraud and impersonation at the doorstep.

### Corporate and Office Mailrooms
Sensitive documents or high-value equipment can be secured in smart mailroom lockers. Only the verified employee can retrieve their parcel, creating an auditable access log tied to Firebase.

### Medical and Pharmaceutical Delivery
Prescription medication, medical devices, or lab samples requiring chain-of-custody verification can use this system to ensure delivery only to the verified patient or authorized medical professional.

### High-Value Retail (Electronics, Jewelry)
Retail stores offering click-and-collect can integrate this system to prevent claim fraud, where an unauthorized person attempts to collect a purchased item.

### Government and Legal Document Delivery
Official documents requiring verified receipt (legal notices, government IDs, certificates) can be delivered to secure boxes accessible only to the named recipient, providing a digital audit trail.

---

## Future Work

- **GPS-Based Location Tracking:** Integrate GPS to restrict box unlock to a geofenced delivery zone, ensuring the parcel is accessed only at the correct address.
- **Mobile Application:** A dedicated app for QR scanning, push notifications on delivery, access history, and one-tap remote unlock.
- **Multi-Modal Biometrics:** Add fingerprint or voice recognition alongside face verification for higher-assurance environments.
- **Tamper Detection:** Integrate vibration and accelerometer sensors on the box with real-time alerts via SMS or app push notification on unauthorized physical access attempts.
- **OTP Fallback:** For cases where face recognition fails due to poor lighting or camera issues, an OTP sent to the registered phone number provides an alternate verification path.
- **Offline Mode:** Local caching of authentication state for environments with intermittent internet connectivity.
- **Multi-Delivery Support:** Allow a single box to manage multiple parcel slots, each independently locked and tied to a different delivery record.

---

## References

1. S. Seetharaman, "QR Code Authentication Based Goods Delivery System," Academia.edu.
2. N. R. Pandiri and G. Varshney, "E-Authentication System with QR Code," EasyChair Preprint 12842, Mar. 31, 2024.
3. U. Kumar and S. Sachi, "An Analytical Study on QR Code-Based E-Authentication," NeuroQuantology, vol. 19, no. 12, pp. 12459, Dec. 2021.
4. S. Taigman et al., "DeepFace: Closing the Gap to Human-Level Performance in Face Verification," IEEE CVPR, 2014.

---

*Developed as part of the IDEA Lab SEE Project, Semester II 2024–2025, RV College of Engineering, Bengaluru.*
