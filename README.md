
## What it does

**Pathos** identifies faces on the screen using DeepFace's, a lightweight face recognition and facial attribute analysis (age, gender, emotion and race) framework for python. It is a hybrid face recognition framework wrapping state-of-the-art models: VGG-Face, FaceNet, OpenFace, DeepFace, DeepID, ArcFace, Dlib, SFace and GhostFaceNet. Using DeepFace, **Pathos** can segment the screen to identify faces, and classify their facial expressions into different emotional categories: _happy, sad, anger, fear, surprise, disgust,_ and _neutral_. 

## How we built it
 
**Frontend Technologies:**
- ReactJS
- JavaScript (Vanilla/Native)
- HTML5
- CSS3
- Chrome Extension APIs
- chrome.runtime for message passing
- chrome.tabs for tab management
- chrome.desktopCapture for screen capture
- MediaDevices API for stream handling

**Backend:**
- Flask
- DeepFace
- cv2
- NumPy

**Key Chrome Extension Components:**
- Manifest V3 (latest Chrome extension architecture)
- Background Service Worker
- Content Scripts
- Popup Interface
- Cross-script Communication

**Features/APIs:**
- Screen Capture API
- Canvas API for real-time drawing
- RequestAnimationFrame for smooth frame processing
- Async/Await for handling asynchronous operations

**Integration:**
- Real-time communication with Python backend
- Base64 image encoding/processing
- JSON for data exchange
