# Pathos

Pathos is a Chrome extension that screenshots the visible browser tab every few seconds, sends it to a Flask backend that runs facial emotion classification with the DeepFace library, and draws a color-coded box with the predicted emotion over each detected face. It was built at Hack NYU 2025 as a demo of real-time emotion recognition on whatever is on screen, such as a video call or a video.

## Quick start

The extension talks to a hosted backend on Hugging Face Spaces, so you only need to load it:

1. Clone the repo: `git clone https://github.com/aprameyak/Pathos`
2. Open `chrome://extensions/`, turn on Developer mode, click "Load unpacked", and select the `frontend/` folder.
3. Open a normal web page with faces on it (not a `chrome://` page), click the Pathos icon, then click "Start Detection".

The Start button stays disabled while the backend health check fails. If the Space is asleep, wait a minute and reopen the popup.

## Usage

In the browser, each detected face gets a box colored by emotion (green happy, blue sad, red angry, purple fear, orange surprise, brown disgust, gray neutral) with a label such as `HAPPY (98%)`. Click "Stop Detection" to remove the overlay.

The backend can also be called directly. `/analyze_screen` takes a base64 image (a data URL prefix is optional):

```bash
curl -X POST https://aprameyak-pathos.hf.space/analyze_screen \
  -H "Content-Type: application/json" \
  -d "{\"frame\": \"$(base64 < face.jpg | tr -d '\n')\"}"
```

Real response for a 400x400 portrait of a smiling man, scores rounded:

```json
[
  {
    "dominant_emotion": "happy",
    "emotion_scores": {
      "angry": 0.0, "disgust": 0.0, "fear": 0.0002, "happy": 98.46,
      "neutral": 1.25, "sad": 0.0003, "surprise": 0.29
    },
    "region": { "x": 85, "y": 24, "w": 207, "h": 207 }
  }
]
```

Scores are percentages from DeepFace and `region` is in pixels of the (possibly resized) input image. Other endpoints: `GET /health`, `GET /config`, and `GET /`.

## Features

- Start and Stop buttons in the extension popup, plus a backend status indicator that polls `/health` every 10 seconds.
- Captures the visible tab as a JPEG with `chrome.tabs.captureVisibleTab` about every 3 seconds while detection is running.
- Classifies each face into one of seven emotions: happy, sad, angry, fear, surprise, disgust, neutral.
- Backend limits results to 10 faces, downsizes images to a max side of 1024 px, and keeps an in-memory cache of the last 100 results.

## Tech stack

- Backend: Python 3.9, Flask, Flask-CORS, DeepFace 0.0.79 (TensorFlow 2.13), OpenCV (`opencv-python-headless`)
- Extension: Chrome Manifest V3, plain JavaScript and HTML (no framework or build step)
- Deployment: Docker image on Hugging Face Spaces (`https://aprameyak-pathos.hf.space`)

## Running the backend locally

Needs Python 3.9 or Docker. DeepFace downloads its model weights on first use, so the first request is slow and needs internet access. Optional environment variables: `PORT` (default `7860`) and `DEBUG` (`true` enables Flask debug mode).

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Or with Docker, from `backend/`:

```bash
docker build -t pathos-backend . && docker run -p 7860:7860 pathos-backend
```

Check it with `curl http://localhost:7860/health`. The backend URL is hardcoded in `frontend/content.js` (`BACKEND_URL`) and `frontend/popup.js` (the `/health` check). To use your local backend, change both to `http://localhost:7860` and reload the extension.

## Testing

There are no automated tests. `frontend/test.html` and `frontend/test-debug.html` are manual test pages with sample face photos (loaded from Unsplash). `content.js` also exposes `window.testPathosOverlay()`, which draws fake results to check the overlay without the backend.

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

Issues and pull requests are welcome. Please keep changes to the backend response format (`dominant_emotion`, `emotion_scores`, `region`) in sync with `frontend/content.js`.

## License

MIT, see [LICENSE](LICENSE).
