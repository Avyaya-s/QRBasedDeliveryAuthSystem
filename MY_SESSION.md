# My Session Startup Guide

Quick steps to get the project running at the start of every session.

---

## Every Time (Required)

### 1. Start the Backend

```powershell
cd "E:\Documents\EL_Projects\DeliveryAuthSystem\face-server"
.\venv\Scripts\Activate.ps1
python app.py
```

### 2. Start ngrok (second terminal)

```powershell
ngrok http 5000
```

---

## Only if ngrok URL changed

Check the URL ngrok gives you. If it's different from last time:

**Update `public/static/script.js` line 107:**
```js
fetch('https://<new-ngrok-url>/login', {
```

**Redeploy frontend:**
```powershell
cd "E:\Documents\EL_Projects\DeliveryAuthSystem"
firebase deploy --only hosting
```

---

## Push Changes to GitHub

```powershell
cd "E:\Documents\EL_Projects\DeliveryAuthSystem"
git add <files>
git commit -m "message"
git push
```

---

## Demo URLs

| Product | URL |
|---------|-----|
| 111111 | https://deliveryauthsystem.web.app/auth.html?id=111111 |
| 111112 | https://deliveryauthsystem.web.app/auth.html?id=111112 |
| 111113 | https://deliveryauthsystem.web.app/auth.html?id=111113 |
| 111114 | https://deliveryauthsystem.web.app/auth.html?id=111114 |
| 111115 | https://deliveryauthsystem.web.app/auth.html?id=111115 |

> Ask Claude for login credentials — saved in memory.
