// Pathos V2 - Simple Backend Version
// Uses Hugging Face backend with DeepFace

let isRunning = false;
let canvas = null;
let ctx = null;

// Backend URL - replace with your Hugging Face Spaces URL
const BACKEND_URL = 'https://aprameyak-pathos.hf.space';

class SimpleEmotionDetector {
  constructor() {
    this.isRunning = false;
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    
    // Emotion colors
    this.emotionColors = {
      happy: '#4CAF50',
      sad: '#2196F3', 
      angry: '#F44336',
      fear: '#9C27B0',
      surprise: '#FFC107',
      disgust: '#795548',
      neutral: '#9E9E9E'
    };
    
    this.createCanvas();
  }

  createCanvas() {
    // Remove existing canvas if any
    const existingCanvas = document.getElementById('pathos-overlay');
    if (existingCanvas) {
      existingCanvas.remove();
    }
    
    // Create canvas overlay
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'pathos-overlay';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  async startDetection() {
    try {
      console.log('Pathos V2: Starting emotion detection...');
      
      // Request screen capture
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });
      
      // Create video element
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.style.display = 'none';
      document.body.appendChild(this.video);
      
      await new Promise(resolve => {
        this.video.onloadedmetadata = resolve;
      });
      
      this.video.play();
      this.isRunning = true;
      
      // Start processing frames
      this.processFrame();
      
      // Handle stream end
      this.stream.getVideoTracks()[0].onended = () => {
        console.log('Pathos V2: Stream ended');
        this.stopDetection();
      };
      
      console.log('Pathos V2: Emotion detection started!');
      
    } catch (error) {
      console.error('Pathos V2: Start detection error:', error);
      this.stopDetection();
      throw error;
    }
  }

  async processFrame() {
    if (!this.isRunning) return;

    try {
      // Update canvas size
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      const videoCtx = canvas.getContext('2d');
      videoCtx.drawImage(this.video, 0, 0);
      
      // Convert to base64
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to backend
      const response = await fetch(`${BACKEND_URL}/analyze_screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frame: frameData })
      });
      
      if (response.ok) {
        const results = await response.json();
        this.drawResults(results);
      }
      
    } catch (error) {
      console.error('Pathos V2: Frame processing error:', error);
    }
    
    // Continue processing
    this.animationFrame = requestAnimationFrame(() => this.processFrame());
  }

  drawResults(results) {
    if (!Array.isArray(results) || results.length === 0) return;
    
    results.forEach(result => {
      const { dominant_emotion, emotion_scores, region } = result;
      
      // Scale region to screen coordinates
      const scaleX = window.innerWidth / this.video.videoWidth;
      const scaleY = window.innerHeight / this.video.videoHeight;
      
      const x = region.x * scaleX;
      const y = region.y * scaleY;
      const width = region.w * scaleX;
      const height = region.h * scaleY;
      
      const color = this.emotionColors[dominant_emotion] || '#9E9E9E';
      
      // Draw face box
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = color;
      this.ctx.strokeRect(x, y, width, height);
      
      // Draw emotion label
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = color;
      this.ctx.shadowBlur = 5;
      this.ctx.fillText(
        `${dominant_emotion.toUpperCase()}`,
        x,
        y - 10
      );
    });
  }

  stopDetection() {
    console.log('Pathos V2: Stopping emotion detection...');
    
    this.isRunning = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.video) {
      this.video.remove();
      this.video = null;
    }
    
    if (this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    console.log('Pathos V2: Emotion detection stopped!');
  }
}

// Initialize detector when content script loads
console.log('Pathos V2: Simple backend content script loaded!');

let emotionDetector = new SimpleEmotionDetector();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Pathos V2: Received message:', request);
  
  if (request.action === 'ping') {
    sendResponse({ success: true, timestamp: Date.now() });
  } else if (request.action === 'startDetection') {
    emotionDetector.startDetection()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Pathos V2: Start detection failed:', error);
        sendResponse({ success: false, error: error.message });
      });
  } else if (request.action === 'stopDetection') {
    emotionDetector.stopDetection();
    sendResponse({ success: true });
  } else if (request.action === 'getStatus') {
    sendResponse({ 
      isRunning: emotionDetector.isRunning,
      modelsLoaded: true, // Always true for backend version
      initialized: true   // Always true for backend version
    });
  }
  
  return true;
});
