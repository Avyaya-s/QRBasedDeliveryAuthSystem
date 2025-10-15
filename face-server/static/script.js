const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultText = document.getElementById('result');

let blinked = false;
let countdown;
let timerId;

// MediaPipe FaceMesh setup
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  startCountdown();
});

// Feed webcam frames into FaceMesh
const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 320,
  height: 240
});
camera.start();

function onResults(results) {
  if (blinked || !results.multiFaceLandmarks) return;

  const landmarks = results.multiFaceLandmarks[0];
  const top = landmarks[33];
  const bottom = landmarks[159];
  const eyeDist = Math.abs(top.y - bottom.y);

  if (eyeDist < 0.01) {
    blinked = true;
    clearTimeout(timerId);
    clearInterval(countdown);
    resultText.innerText = "✅ Blink detected. Verifying...";
    captureImage();
  }
}

function captureImage() {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL('image/png');

  fetch('http://127.0.0.1:5000/login', { // or replace with Firebase Functions URL if deployed
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  })
  .then(res => res.json())
  .then(data => {
    console.log("[DEBUG] Server response:", data);
    if (data.status === "success") {
      resultText.innerText = `✅ Welcome, ${data.user}!`;
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      setTimeout(() => {
        window.location.href = `auth.html?id=${id}&faceVerified=true`;
      }, 1500);
    } else {
      resultText.innerText = "❌ Login failed. Face not recognized.";
      blinked = false;
      setTimeout(resetState, 2000);
    }
  })
  .catch(err => {
    console.error("[ERROR] Server request failed:", err);
    resultText.innerText = "⚠️ Error during verification.";
    blinked = false;
    setTimeout(resetState, 2000);
  });
}

function startCountdown() {
  let timeLeft = 5;
  resultText.innerText = `Please blink within ${timeLeft} seconds...`;

  countdown = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      resultText.innerText = `Please blink within ${timeLeft} seconds...`;
    }
  }, 1000);

  timerId = setTimeout(() => {
    clearInterval(countdown);
    if (!blinked) {
      resultText.innerText = "⏱ Blink not detected in time. Try again.";
      resetState();
    }
  }, 5000);
}

function resetState() {
  blinked = false;
  setTimeout(() => {
    startCountdown();
  }, 1000);
}
