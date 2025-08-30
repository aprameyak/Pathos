# 🐳 Docker Deployment Guide for Pathos Backend

This guide shows you how to deploy the Python backend using Docker to various free hosting platforms.

## 🎯 Overview

You now have **3 deployment options**:

1. **🧠 Client-Side Only** (V2) - 100% free, no backend needed
2. **🐳 Docker Backend** - Free hosting on Railway/Render
3. **🔄 Hybrid Mode** - Best of both worlds

## 🚀 Quick Start

### Option 1: Local Docker Deployment

```bash
# Navigate to backend directory
cd backend

# Build and run locally
./deploy.sh local

# Test the API
curl http://localhost:5000/health
```

### Option 2: Railway Deployment (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
./deploy.sh railway
```

### Option 3: Render Deployment

```bash
# Follow the instructions
./deploy.sh render
```

## 📋 Free Hosting Platforms

### 1. **Railway** (Recommended)
- **Cost**: Free tier available
- **Features**: Auto-deploy from GitHub, custom domains
- **Limits**: 500 hours/month free
- **Setup**: Very easy with CLI

### 2. **Render**
- **Cost**: Free tier available
- **Features**: Auto-deploy, SSL certificates
- **Limits**: Sleeps after 15 minutes of inactivity
- **Setup**: Web interface

### 3. **Fly.io**
- **Cost**: Free tier available
- **Features**: Global deployment, custom domains
- **Limits**: 3 shared-cpu VMs, 3GB persistent volume
- **Setup**: CLI-based

### 4. **Heroku**
- **Cost**: Free tier discontinued
- **Features**: Easy deployment, add-ons
- **Setup**: CLI-based

## 🔧 Docker Configuration

### Dockerfile Features
- **Multi-stage build** for smaller images
- **Security**: Non-root user
- **Health checks** for monitoring
- **Optimized** for DeepFace and OpenCV

### Environment Variables
```bash
PORT=5000              # Server port
DEBUG=False            # Debug mode
PYTHONUNBUFFERED=1     # Python output
```

### Port Configuration
- **Local**: `http://localhost:5000`
- **Railway**: Auto-assigned
- **Render**: `https://your-app.onrender.com`

## 🎯 Hybrid Extension Setup

The hybrid extension automatically detects if a backend is available and switches between:

1. **Backend Mode**: Uses Docker backend for processing
2. **Client-Side Mode**: Falls back to browser AI if backend is unavailable

### Configuration
```javascript
// In content-hybrid.js
const CONFIG = {
  backendUrl: 'http://localhost:5000',  // Your backend URL
  backendTimeout: 30000,                // 30 seconds
  confidenceThreshold: 0.3,             // Detection threshold
  frameRate: 15                         // Processing rate
};
```

## 📊 Performance Comparison

| Platform | Cost | Speed | Reliability | Setup |
|----------|------|-------|-------------|-------|
| **Client-Side** | $0 | Fast | 100% | Easy |
| **Railway** | $0 | Fast | 99% | Easy |
| **Render** | $0 | Medium | 95% | Medium |
| **Local Docker** | $0 | Fast | 100% | Hard |

## 🚀 Deployment Steps

### Railway Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy**
   ```bash
   cd backend
   ./deploy.sh railway
   ```

4. **Get your URL**
   ```bash
   railway status
   ```

### Render Deployment

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   ```
   Name: pathos-backend
   Build Command: docker build -t pathos-backend .
   Start Command: python app.py
   ```

4. **Set Environment Variables**
   ```
   PORT=10000
   DEBUG=False
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete

### Local Docker

1. **Build Image**
   ```bash
   docker build -t pathos-backend .
   ```

2. **Run Container**
   ```bash
   docker run -p 5000:5000 pathos-backend
   ```

3. **Test**
   ```bash
   curl http://localhost:5000/health
   ```

## 🔄 Using the Hybrid Extension

### 1. Update Extension Configuration
```javascript
// In popup.js, add backend URL setting
const backendUrl = 'https://your-railway-app.railway.app';
```

### 2. Load Hybrid Content Script
```json
// In manifest.json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-hybrid.js"]
    }
  ]
}
```

### 3. Test Both Modes
- **With Backend**: Faster, more accurate
- **Without Backend**: Works offline, privacy-focused

## 🧪 Testing Your Deployment

### Health Check
```bash
curl https://your-app.railway.app/health
```

### API Test
```bash
# Test emotion analysis endpoint
curl -X POST https://your-app.railway.app/analyze_screen \
  -H "Content-Type: application/json" \
  -d '{"frame": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

### Extension Test
1. Load the hybrid extension
2. Navigate to any website
3. Click extension icon
4. Click "Start Detection"
5. Check console for backend status

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check Docker logs
   docker logs <container_id>
   
   # Rebuild with no cache
   docker build --no-cache -t pathos-backend .
   ```

2. **Backend Not Responding**
   ```bash
   # Check if container is running
   docker ps
   
   # Check container logs
   docker logs <container_id>
   ```

3. **CORS Issues**
   - Ensure CORS is enabled in app.py
   - Check if backend URL is correct
   - Verify HTTPS/HTTP protocol

4. **Memory Issues**
   ```bash
   # Increase Docker memory limit
   docker run -m 2g -p 5000:5000 pathos-backend
   ```

### Performance Optimization

1. **Reduce Image Size**
   ```dockerfile
   # Use multi-stage build
   FROM python:3.9-slim as builder
   # ... build steps
   FROM python:3.9-slim
   # ... copy only necessary files
   ```

2. **Optimize Dependencies**
   ```bash
   # Use specific versions
   pip install --no-cache-dir -r requirements.txt
   ```

3. **Enable Caching**
   ```dockerfile
   # Copy requirements first for better caching
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   ```

## 📈 Monitoring

### Health Checks
```bash
# Automatic health check
curl -f https://your-app.railway.app/health

# Manual check
curl https://your-app.railway.app/health | jq
```

### Logs
```bash
# Railway logs
railway logs

# Docker logs
docker logs <container_id> -f
```

### Metrics
- **Response Time**: < 2 seconds
- **Memory Usage**: < 1GB
- **CPU Usage**: < 50%

## 🎉 Success Checklist

- [ ] Backend builds successfully
- [ ] Health endpoint responds
- [ ] API accepts requests
- [ ] Extension connects to backend
- [ ] Emotion detection works
- [ ] Fallback to client-side works
- [ ] Performance is acceptable

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**🎯 Result**: You now have a production-ready, free backend that works seamlessly with the extension!
