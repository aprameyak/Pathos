# Pathos – Real-time Face Recognition and Emotion Classification

![React.js](https://img.shields.io/badge/React.js-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white&style=for-the-badge)
![DeepFace](https://img.shields.io/badge/DeepFace-F28500?style=for-the-badge)
![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-4285F4?logo=googlechrome&logoColor=white&style=for-the-badge)

## About

**Pathos** is a real-time face recognition and emotion classification tool that detects faces on the screen using the **DeepFace** framework. It supports state-of-the-art facial recognition models such as:

- VGG-Face  
- FaceNet  
- OpenFace  
- DeepID  
- ArcFace  
- Dlib  
- SFace  
- GhostFaceNet

The tool classifies detected facial expressions into the following emotion categories:

- Happy  
- Sad  
- Anger  
- Fear  
- Surprise  
- Disgust  
- Neutral

## Features

- **Face Recognition**: Detects faces on-screen using advanced models  
- **Emotion Classification**: Identifies 7 core emotions in real time  
- **Screen Capture**: Uses Chrome APIs to analyze tab content  
- **Canvas Overlay**: Visualizes detection on screen  
- **Chrome Extension UI**: Interactive popup with real-time control  
- **Python Backend**: Handles image decoding, emotion recognition, and response handling

## Technology Stack

### Frontend
- React.js  
- JavaScript (Vanilla)  
- HTML5 / CSS3  
- Chrome Extension APIs  
- Canvas API  
- RequestAnimationFrame for smooth rendering

### Backend
- Python  
- Flask  
- DeepFace  
- OpenCV (cv2)  
- NumPy

### Chrome Extension Architecture
- Manifest V3  
- Background service worker  
- Content scripts  
- Popup interface  
- Message passing (runtime & tabs API)

## Integration

- **Image Transfer**: Captured screen frames are encoded in Base64 and sent to Flask backend  
- **Real-time Classification**: Backend returns emotion classification as JSON  
- **Asynchronous Data Flow**: Uses `async/await` and event-driven updates for responsiveness  
