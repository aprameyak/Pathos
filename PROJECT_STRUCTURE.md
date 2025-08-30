# Pathos Project Structure

## 📁 Directory Organization

### 🏗️ `original-code/`
**Original implementation (V1)**
- `backend/` - Flask API with DeepFace
- `chromeextension/` - Chrome extension (V1)
- `frontend/` - React frontend

### 🚀 `new-backend/`
**Optimized backend for free hosting**
- `pathos-hf-backend/` - Dockerized Flask app for Hugging Face Spaces
  - `app.py` - Optimized Flask API (2 CPU, 16GB RAM)
  - `Dockerfile` - Docker configuration
  - `requirements.txt` - Python dependencies

### 🎯 `new-frontend/`
**Client-side AI solution (V2)**
- `pathos-v2/` - Chrome extension with TensorFlow.js
  - No backend required
  - 100% local processing
  - <100ms latency

### 🔄 `new-combo/`
**Hybrid solution**
- `content-hybrid.js` - Extension that switches between client-side and backend
- `README.md` - Hybrid approach documentation

## 🎯 Quick Start Guide

### For Free Deployment:
1. Use `new-backend/pathos-hf-backend/` for Hugging Face Spaces
2. Use `new-frontend/pathos-v2/` for client-side only

### For Hybrid Approach:
1. Deploy backend from `new-backend/`
2. Use `new-combo/content-hybrid.js` in your extension

### For Reference:
- Check `original-code/` for the original implementation

## 💡 Key Differences

| Feature | Original | New Backend | New Frontend | Hybrid |
|---------|----------|-------------|--------------|---------|
| Cost | Expensive | Free | Free | Free |
| Latency | High | Medium | Low | Adaptive |
| Setup | Complex | Simple | Simple | Medium |
| Reliability | High | Medium | High | High |
