# 👤 Pathos - Real-time Face Recognition and Emotion Classification  

![React](https://img.shields.io/badge/Frontend-React.js-blue?logo=react)  
![Python](https://img.shields.io/badge/Backend-Python-blue?logo=python)  
![Flask](https://img.shields.io/badge/Backend-Flask-green?logo=flask)  
![DeepFace](https://img.shields.io/badge/AI-DeepFace-orange)  
![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-blue?logo=googlechrome)

## 📌 What it Does  

**Pathos** is a **face recognition and emotion classification** tool that identifies faces on the screen using the **DeepFace** framework. Leveraging **state-of-the-art models** such as **VGG-Face, FaceNet, OpenFace, DeepID, ArcFace, Dlib, SFace, and GhostFaceNet**, Pathos can detect faces, segment the screen, and classify facial expressions into the following emotional categories:  

- Happy  
- Sad  
- Anger  
- Fear  
- Surprise  
- Disgust  
- Neutral  

## 🚀 How We Built It  

### Frontend Technologies:  

- **ReactJS:** For building the UI components.  
- **JavaScript (Vanilla/Native):** For core logic and interaction.  
- **HTML5/CSS3:** For structuring and styling the application.  
- **Chrome Extension APIs:**  
    - `chrome.runtime` for message passing  
    - `chrome.tabs` for tab management  
    - `chrome.desktopCapture` for screen capture  
    - `MediaDevices API` for stream handling  

### Backend Technologies:  

- **Flask:** Lightweight Python web framework for API communication.  
- **DeepFace:** Face recognition and emotion analysis framework.  
- **cv2 (OpenCV):** Image and video processing.  
- **NumPy:** Numerical operations and array management.

### Key Chrome Extension Components:  

- **Manifest V3:** Latest Chrome extension architecture.  
- **Background Service Worker:** Handles background tasks for the extension.  
- **Content Scripts:** Interact with web pages for face detection.  
- **Popup Interface:** User interface for interaction with the extension.  
- **Cross-script Communication:** Efficient communication between background scripts, content scripts, and popup interface.

## 🚀 Features/APIs  

- **Screen Capture API:** Capture the screen for face detection.  
- **Canvas API:** For real-time drawing and display of face recognition results.  
- **RequestAnimationFrame:** Ensures smooth frame processing during screen capture.  
- **Async/Await:** Handles asynchronous operations for seamless user experience.  

## 🔗 Integration  

- **Real-time communication with Python backend:** Pathos exchanges data with the Flask backend for processing.  
- **Base64 Image Encoding/Processing:** Used for transferring images between the frontend and backend.  
- **JSON for Data Exchange:** Efficient data exchange for face detection results and emotions.

