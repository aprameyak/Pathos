# Pathos V2 - Client-Side Emotion Recognition

🚀 **100% FREE | No Backend Required | Privacy-First**

## What's New in V2?

- ✅ **Zero Backend Costs** - Everything runs in the browser
- ✅ **Lightning Fast** - No network latency, instant results
- ✅ **Privacy-First** - All processing happens locally
- ✅ **Always Available** - No server downtime
- ✅ **Easy Distribution** - Single extension file

## Technology Stack

- **Face Detection**: face-api.js (TensorFlow.js)
- **Emotion Recognition**: Custom CNN model
- **Browser APIs**: MediaDevices, Canvas, WebGL
- **Extension**: Manifest V3

## Architecture

```
Browser Extension
├── Face Detection (face-api.js)
├── Emotion Classification (TensorFlow.js)
├── Screen Capture (MediaDevices API)
└── Visual Overlay (Canvas API)
```

## Benefits Over V1

| Feature | V1 (DeepFace) | V2 (Client-Side) |
|---------|---------------|------------------|
| Cost | Backend hosting | **FREE** |
| Speed | Network dependent | **Instant** |
| Reliability | Server dependent | **Always works** |
| Privacy | Data sent to server | **100% local** |
| Distribution | Complex deployment | **Single file** |

## Quick Start

1. Load the extension in Chrome
2. Click the extension icon
3. Grant screen capture permission
4. See real-time emotion detection!

## Performance

- **Face Detection**: ~30ms per frame
- **Emotion Recognition**: ~50ms per face
- **Total Latency**: <100ms (vs 500ms+ with backend)
- **Memory Usage**: ~50MB (vs 2GB+ server)

## Supported Emotions

- 😊 Happy
- 😢 Sad  
- 😠 Angry
- 😨 Fear
- 😲 Surprise
- 🤢 Disgust
- 😐 Neutral
