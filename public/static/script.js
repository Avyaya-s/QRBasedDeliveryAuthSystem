const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultText = document.getElementById('result');

let blinked = false;
let countdown;
let timerId;
let processing = false;
let allowBlinkDetection = false;
let faceDetectedTime = null;

// Initialize FaceMesh from MediaPipe
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

// Set canvas size
canvas.width = 320;
canvas.height = 240;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
    video.srcObject = stream;

    video.onloadeddata = () => {
      video.play();
      if (!processing) {
        processing = true;
        resultText.innerText = "📷 Initializing camera...";
        setTimeout(() => {
          startCountdown();
          camera.start();
        }, 1000); // wait 1s to let camera settle
      }
    };

  } catch (err) {
    console.error("Camera error:", err);
    alert("Camera failed: " + err.message);
  }
}
initCamera();

const camera = new Camera(video, {
  onFrame: async () => {
    if (!blinked) {
      await faceMesh.send({ image: video });
    }
  },
  width: 320,
  height: 240
});

function onResults(results) {
  if (!results.multiFaceLandmarks?.length) {
    faceDetectedTime = null;
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];
  if (!landmarks[145] || !landmarks[159] || !landmarks[386] || !landmarks[374]) return;

  const now = Date.now();
  if (!faceDetectedTime) {
    faceDetectedTime = now;
    return;
  }

  // ✅ Require 1s of stable face detection before checking blink
  if (now - faceDetectedTime < 1000) return;
  if (!allowBlinkDetection || blinked) return;

  const leftTop = landmarks[159].y;
  const leftBottom = landmarks[145].y;
  const rightTop = landmarks[386].y;
  const rightBottom = landmarks[374].y;

  const leftEyeDist = Math.abs(leftTop - leftBottom);
  const rightEyeDist = Math.abs(rightTop - rightBottom);
  const avgEyeDist = (leftEyeDist + rightEyeDist) / 2;

  console.log("Avg Eye Distance:", avgEyeDist.toFixed(5));

  if (avgEyeDist < 0.015) {
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

  fetch('https://f07036d2cd63.ngrok-free.app/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        resultText.innerText = `✅ Welcome, ${data.user}!`;
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        setTimeout(() => {
          window.location.href = `auth.html?id=${id}&faceVerified=true`;
        }, 1500);
      } else {
        resultText.innerText = "❌ Face not recognized.";
        resetState();
      }
    })
    .catch(err => {
      console.error("[ERROR] Verification failed:", err);
      resultText.innerText = "⚠️ Error during verification.";
      resetState();
    });
}

function startCountdown() {
  allowBlinkDetection = true;
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
      resultText.innerText = "⏱ Blink not detected. Try again.";
      resetState();
    }
  }, 5000);
}

function resetState() {
  blinked = false;
  allowBlinkDetection = false;
  faceDetectedTime = null;
  setTimeout(() => {
    startCountdown();
  }, 1000);
}
