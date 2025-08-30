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
    this.lastProcessTime = 0;
    this.lastResults = null;
    
    // Enhanced emotion colors with better contrast
    this.emotionColors = {
      happy: '#00FF88',
      sad: '#0088FF', 
      angry: '#FF4444',
      fear: '#AA44FF',
      surprise: '#FFAA00',
      disgust: '#8B4513',
      neutral: '#CCCCCC'
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
      
      // Always display last results if available
      if (this.lastResults) {
        this.drawResults(this.lastResults);
      }
      
      // Throttle processing to avoid overwhelming the backend
      const now = Date.now();
      if (now - this.lastProcessTime < 1000) { // Process every 1 second
        this.animationFrame = requestAnimationFrame(() => this.processFrame());
        return;
      }
      this.lastProcessTime = now;
      
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      const videoCtx = canvas.getContext('2d');
      videoCtx.drawImage(this.video, 0, 0);
      
      console.log('Pathos V2: Captured frame size:', canvas.width, 'x', canvas.height);
      
      // Convert to base64
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Pathos V2: Frame data length:', frameData.length);
      
      // Send to backend
      console.log('Pathos V2: Sending frame to backend...');
      const response = await fetch(`${BACKEND_URL}/analyze_screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frame: frameData })
      });
      
      console.log('Pathos V2: Backend response status:', response.status);
      
      if (response.ok) {
        const results = await response.json();
        console.log('Pathos V2: Backend results:', results);
        this.drawResults(results);
      } else {
        console.error('Pathos V2: Backend error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Pathos V2: Error details:', errorText);
      }
      
    } catch (error) {
      console.error('Pathos V2: Frame processing error:', error);
    }
    
    // Continue processing
    this.animationFrame = requestAnimationFrame(() => this.processFrame());
  }

  drawResults(results) {
    console.log('Pathos V2: Drawing results:', results);
    if (!Array.isArray(results) || results.length === 0) {
      console.log('Pathos V2: No results to draw');
      return;
    }
    
    // Store results for continuous display
    this.lastResults = results;
    
    results.forEach(result => {
      const { dominant_emotion, emotion_scores, region } = result;
      console.log('Pathos V2: Drawing emotion:', dominant_emotion, 'with region:', region);
      
      // Scale region to screen coordinates
      const scaleX = window.innerWidth / this.video.videoWidth;
      const scaleY = window.innerHeight / this.video.videoHeight;
      
      const x = region.x * scaleX;
      const y = region.y * scaleY;
      const width = region.w * scaleX;
      const height = region.h * scaleY;
      
      const color = this.emotionColors[dominant_emotion] || '#CCCCCC';
      
      // Draw enhanced face box with rounded corners
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 4;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = color;
      this.ctx.setLineDash([10, 5]);
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.setLineDash([]);
      
      // Draw emotion label with background
      const labelText = `${dominant_emotion.toUpperCase()}`;
      this.ctx.font = 'bold 18px Arial';
      const textMetrics = this.ctx.measureText(labelText);
      const labelWidth = textMetrics.width + 20;
      const labelHeight = 25;
      
      // Draw label background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(x, y - labelHeight - 5, labelWidth, labelHeight);
      
      // Draw label text
      this.ctx.fillStyle = color;
      this.ctx.shadowBlur = 3;
      this.ctx.fillText(labelText, x + 10, y - 10);
      
      // Draw confidence bar
      const maxConfidence = Math.max(...Object.values(emotion_scores));
      const barWidth = width;
      const barHeight = 6;
      
      // Background bar
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(x, y + height + 5, barWidth, barHeight);
      
      // Confidence bar
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y + height + 5, barWidth * (maxConfidence / 100), barHeight);
      
      // Draw corner indicators
      const cornerSize = 8;
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([]);
      
      // Top-left corner
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + cornerSize);
      this.ctx.lineTo(x, y);
      this.ctx.lineTo(x + cornerSize, y);
      this.ctx.stroke();
      
      // Top-right corner
      this.ctx.beginPath();
      this.ctx.moveTo(x + width - cornerSize, y);
      this.ctx.lineTo(x + width, y);
      this.ctx.lineTo(x + width, y + cornerSize);
      this.ctx.stroke();
      
      // Bottom-left corner
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + height - cornerSize);
      this.ctx.lineTo(x, y + height);
      this.ctx.lineTo(x + cornerSize, y + height);
      this.ctx.stroke();
      
      // Bottom-right corner
      this.ctx.beginPath();
      this.ctx.moveTo(x + width - cornerSize, y + height);
      this.ctx.lineTo(x + width, y + height);
      this.ctx.lineTo(x + width, y + height - cornerSize);
      this.ctx.stroke();
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
