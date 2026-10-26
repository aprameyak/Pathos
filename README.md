# Pathos

Pathos is a Chrome extension that screenshots the visible browser tab every few seconds, sends it to a Flask backend that runs facial emotion classification with the DeepFace library, and draws a color-coded box with the predicted emotion over each detected face. It was built at Hack NYU 2025 as a demo of real-time emotion recognition on whatever is on screen, such as a video call or a video.

## Features

- Start and Stop buttons in the extension popup, plus a backend status indicator that polls the `/health` endpoint every 10 seconds.
- Captures the visible tab as a JPEG with `chrome.tabs.captureVisibleTab` about every 3 seconds while detection is running.
- Classifies each face into one of seven emotions: happy, sad, angry, fear, surprise, disgust, neutral.
- Overlays a colored box per face with the dominant emotion and its score, plus a score bar.
- Backend limits results to 10 faces, downsizes images to a max side of 1024 px, and keeps an in-memory cache of the last 100 results.

## Tech stack

- Backend: Python 3.9, Flask, Flask-CORS, DeepFace 0.0.79 (TensorFlow 2.13), OpenCV (`opencv-python-headless`)
- Extension: Chrome Manifest V3, plain JavaScript and HTML (no framework or build step)
- Deployment: Docker image on Hugging Face Spaces (`https://aprameyak-pathos.hf.space`)

## Getting started

### Prerequisites

- Google Chrome (or another Chromium browser that loads unpacked extensions)
- To run the backend yourself: Python 3.9 or Docker. DeepFace downloads its model weights on first use, so the first request is slow and needs internet access.

### Backend

The backend reads two optional environment variables: `PORT` (default `7860`) and `DEBUG` (`true` to enable Flask debug mode).

With Python:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

With Docker:

```bash
cd backend
docker build -t pathos-backend .
docker run -p 7860:7860 pathos-backend
```

Check it with `curl http://localhost:7860/health`.

### Extension

1. Open `chrome://extensions/` and turn on Developer mode.
2. Click "Load unpacked" and select the `frontend/` folder.
3. Open a normal web page with faces on it (not a `chrome://` page), click the Pathos icon, then click "Start Detection".

The backend URL is hardcoded to the hosted Space `https://aprameyak-pathos.hf.space` in `frontend/content.js` (`BACKEND_URL`) and `frontend/popup.js` (the `/health` check). To use a local backend, change both to `http://localhost:7860` and reload the extension. The Start button stays disabled while the health check fails.

### Testing

There are no automated tests. `frontend/test.html` and `frontend/test-debug.html` are manual test pages that show sample face photos (loaded from Unsplash) to run the extension against. `content.js` also exposes `window.testPathosOverlay()` and a `testOverlay` message that draw fake results to check the overlay without the backend.

## How it works

1. `frontend/popup.js` checks the backend's `/health` endpoint and sends `startDetection` to the content script in the active tab, injecting `content.js` if needed.
2. `frontend/content.js` asks the service worker (`frontend/background.js`) for a screenshot about every 3 seconds. The service worker calls `chrome.tabs.captureVisibleTab` and returns a JPEG data URL.
3. `content.js` POSTs `{ "frame": <data URL> }` to `/analyze_screen`, retrying up to 3 times with backoff.
4. `backend/app.py` decodes the image with OpenCV, resizes it if needed, and calls `DeepFace.analyze(frame, actions=['emotion'], detector_backend='opencv', enforce_detection=False)`. Face detection uses OpenCV's Haar cascade detector and the emotion label comes from DeepFace's built-in pretrained facial expression model. No custom model was trained for this project.
5. The backend returns a JSON list of `{ dominant_emotion, emotion_scores, region }` per face, and `content.js` draws the boxes in a fixed, click-through overlay.

Known limitations:

- Because `enforce_detection=False`, a frame with no detected face can still return one result covering the whole image.
- Box positions use the screenshot's pixel coordinates directly. They do not account for device pixel ratio or the backend's resizing, so boxes can be misaligned on high-DPI screens or large windows.
- The result cache is keyed on a hash of the first 1000 characters of the base64 frame, so very similar frames can return a cached result.
- The `description` in `frontend/manifest.json` says "No backend required", which is out of date. The extension needs the backend.

Images are decoded in memory and the backend does not write them to disk.

## Project structure

```
Pathos/
├── backend/
│   ├── app.py              Flask API: /, /health, /config, /analyze_screen
│   ├── requirements.txt
│   ├── Dockerfile          python:3.9-slim image, port 7860
│   └── info.MD
├── frontend/               Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js       service worker, captures screenshots
│   ├── content.js          capture loop, backend calls, overlay
│   ├── popup.html
│   ├── popup.js            start/stop controls, backend status
│   ├── test.html           manual test page
│   ├── test-debug.html     manual debug page
│   └── info.MD
└── LICENSE
```

## Contributing

Pathos was built by a team at Hack NYU 2025: [@aprameyak](https://github.com/aprameyak), [@singvir23](https://github.com/singvir23), and [@bilal-ali1](https://github.com/bilal-ali1). Issues and pull requests are welcome. Please keep changes to the backend response format (`dominant_emotion`, `emotion_scores`, `region`) in sync with `frontend/content.js`.

## License

MIT, see [LICENSE](LICENSE).
