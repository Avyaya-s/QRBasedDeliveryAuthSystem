# Setup Guide — Cloning on a New Machine

## Prerequisites

Install the following before starting:

- [Python 3.10](https://www.python.org/downloads/release/python-3100/)
- [Node.js 18+](https://nodejs.org/)
- [ngrok](https://ngrok.com/download) — create a free account and authenticate
- [Firebase CLI](https://firebase.google.com/docs/cli) — `npm install -g firebase-tools`
- Git

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/Avyaya-s/QRBasedDeliveryAuthSystem.git
cd QRBasedDeliveryAuthSystem
```

---

## Step 2 — Set Up the Backend

```bash
cd face-server

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate          # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### Add Reference Photo

Place a clear, front-facing photo of the authorized recipient inside:
```
face-server/static/user_images/<name>.jpg
```

---

## Step 3 — Start the Backend

```bash
# Make sure venv is activated
python app.py
```

You should see:
```
Running on http://0.0.0.0:5000
```

---

## Step 4 — Expose Backend via ngrok

Open a **second terminal** and run:

```bash
ngrok http 5000
```

Copy the `https://` URL (e.g. `https://abc123.ngrok-free.app`).

---

## Step 5 — Update the Frontend

In `public/static/script.js`, find line 107 and replace the URL:

```js
fetch('https://<your-ngrok-url>/login', {
```

---

## Step 6 — Deploy the Frontend

```bash
# From the project root
firebase login
firebase deploy --only hosting
```

Frontend is live at: `https://deliveryauthsystem.web.app`

---

## Demo URLs

| Product ID | URL |
|------------|-----|
| 111111 | https://deliveryauthsystem.web.app/auth.html?id=111111 |
| 111112 | https://deliveryauthsystem.web.app/auth.html?id=111112 |
| 111113 | https://deliveryauthsystem.web.app/auth.html?id=111113 |
| 111114 | https://deliveryauthsystem.web.app/auth.html?id=111114 |
| 111115 | https://deliveryauthsystem.web.app/auth.html?id=111115 |

> Login credentials are shared separately.

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'deepface'`**
→ Virtual environment is not activated. Run `.\venv\Scripts\Activate.ps1` first.

**Face verification returns error**
→ ngrok URL in `script.js` is outdated. Update it and redeploy the frontend.

**Firebase deploy fails with 401**
→ Run `firebase login --reauth` and try again.

**Face not recognized**
→ Ensure the reference photo in `user_images/` is clear and front-facing. Good lighting is required.
