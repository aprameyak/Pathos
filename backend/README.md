# Pathos Emotion Recognition API - Hugging Face Spaces

🚀 **Free deployment on Hugging Face Spaces**

This is a Flask-based emotion recognition API using DeepFace that can be deployed for free on Hugging Face Spaces.

## 🎯 Features

- **Real-time emotion detection** using DeepFace
- **RESTful API** with CORS support
- **Health monitoring** endpoints
- **Optimized for Hugging Face Spaces**
- **Free hosting** with automatic scaling

## 🚀 Quick Deploy

### Option 1: Deploy to Hugging Face Spaces

1. **Fork this repository** to your GitHub account
2. **Go to [Hugging Face Spaces](https://huggingface.co/spaces)**
3. **Click "Create new Space"**
4. **Choose "Docker"** as the SDK
5. **Connect your GitHub repository**
6. **Set the repository path** to your forked repo
7. **Click "Create Space"**

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/pathos-backend.git
cd pathos-backend

# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

## 📋 API Endpoints

### Health Check
```bash
GET /
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "pathos-emotion-api",
  "version": "2.0.0",
  "deployment": "huggingface-spaces"
}
```

### Emotion Analysis
```bash
POST /analyze_screen
Content-Type: application/json

{
  "frame": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
[
  {
    "dominant_emotion": "happy",
    "emotion_scores": {
      "angry": 0.01,
      "disgust": 0.02,
      "fear": 0.03,
      "happy": 0.85,
      "sad": 0.04,
      "surprise": 0.03,
      "neutral": 0.02
    },
    "region": {
      "x": 100,
      "y": 150,
      "w": 200,
      "h": 200
    }
  }
]
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `7860` | Server port (HF Spaces default) |
| `DEBUG` | `False` | Debug mode |
| `LOG_LEVEL` | `INFO` | Logging level |

### Hugging Face Spaces Settings

The Space is configured to:
- **Use Docker** for deployment
- **Auto-restart** on inactivity
- **Handle CORS** for browser extensions
- **Optimize** for emotion recognition workloads

## 🐳 Docker Configuration

### Dockerfile Features
- **Python 3.9** base image
- **OpenCV** and **DeepFace** pre-installed
- **Non-root user** for security
- **Health checks** for monitoring
- **Optimized** for Hugging Face Spaces

### Build Process
```dockerfile
# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    # ... other dependencies

# Install Python packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY . .

# Run as non-root user
USER appuser

# Expose port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1
```

## 🧪 Testing

### Local Testing
```bash
# Test health endpoint
curl http://localhost:7860/health

# Test with sample image
curl -X POST http://localhost:7860/analyze_screen \
  -H "Content-Type: application/json" \
  -d '{"frame": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

### Hugging Face Spaces Testing
```bash
# Replace with your Space URL
curl https://your-username-pathos-backend.hf.space/health

# Test API endpoint
curl -X POST https://your-username-pathos-backend.hf.space/analyze_screen \
  -H "Content-Type: application/json" \
  -d '{"frame": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

## 🔄 Integration with Extension

### Update Extension Configuration
```javascript
// In your Chrome extension
const BACKEND_URL = 'https://your-username-pathos-backend.hf.space';

// Send requests to backend
const response = await fetch(`${BACKEND_URL}/analyze_screen`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ frame: base64Image })
});
```

### Hybrid Mode
The extension can automatically detect if the backend is available:
- **Backend available**: Uses Hugging Face Spaces API
- **Backend unavailable**: Falls back to client-side AI

## 📊 Performance

### Hugging Face Spaces Limits
- **CPU**: Shared CPU resources
- **Memory**: Up to 16GB RAM
- **Storage**: 50GB persistent storage
- **Uptime**: Auto-restart on inactivity

### Optimization Tips
1. **Image compression**: Reduce image size before sending
2. **Batch processing**: Process multiple faces efficiently
3. **Caching**: Cache results for repeated requests
4. **Error handling**: Graceful fallback to client-side

## 🔧 Troubleshooting

### Common Issues

1. **Space not starting**
   - Check Docker build logs
   - Verify requirements.txt
   - Ensure port 7860 is exposed

2. **CORS errors**
   - Verify CORS headers in app.py
   - Check if extension URL is allowed

3. **Memory issues**
   - Reduce image resolution
   - Optimize DeepFace parameters
   - Monitor memory usage

4. **Timeout errors**
   - Increase timeout settings
   - Optimize image processing
   - Check network connectivity

### Debug Mode
```bash
# Enable debug mode
export DEBUG=True
export LOG_LEVEL=DEBUG

# Run with debug
python app.py
```

## 📈 Monitoring

### Health Checks
```bash
# Automatic health check
curl -f https://your-username-pathos-backend.hf.space/health

# Manual monitoring
watch -n 30 'curl -s https://your-username-pathos-backend.hf.space/health | jq'
```

### Logs
- **Hugging Face Spaces**: View logs in Space dashboard
- **Local**: Check console output
- **Docker**: `docker logs <container_id>`

## 🎉 Success Metrics

- [ ] Space builds successfully
- [ ] Health endpoint responds
- [ ] API accepts requests
- [ ] Emotion detection works
- [ ] Extension connects successfully
- [ ] Performance is acceptable
- [ ] Auto-restart works

## 🔗 Useful Links

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Docker Spaces Guide](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [DeepFace Documentation](https://github.com/serengil/deepface)
- [Flask Documentation](https://flask.palletsprojects.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎯 Deploy your emotion recognition API for free on Hugging Face Spaces!**
