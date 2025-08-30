// Pathos V2 Hybrid - Client-Side + Backend Emotion Recognition
// Can work with both client-side AI and Docker backend

// Global state
let emotionDetector = null;
let librariesLoaded = false;
let useBackend = false;
let backendUrl = 'http://localhost:5000'; // Default backend URL

// Configuration
const CONFIG = {
  // Backend settings
  backendUrl: 'http://localhost:5000',
  backendTimeout: 30000, // 30 seconds
  
  // Client-side settings
  confidenceThreshold: 0.3,
  maxImageSize: 640,
  
  // Detection settings
  frameRate: 15,
  maxFaces: 10
};

// Dynamically load required libraries
async function loadLibraries() {
  if (librariesLoaded) return;
  
  return new Promise((resolve, reject) => {
    console.log('Pathos V2: Loading libraries...');
    
    // Check if libraries are already loaded
    if (typeof tf !== 'undefined' && typeof faceapi !== 'undefined') {
      console.log('Pathos V2: Libraries already loaded');
      librariesLoaded = true;
      resolve();
      return;
    }
    
    // Load TensorFlow.js
    const tfScript = document.createElement('script');
    tfScript.src = chrome.runtime.getURL('libs/tensorflow.min.js');
    tfScript.onload = () => {
      console.log('Pathos V2: TensorFlow.js loaded');
      
      // Load face-api.js after TensorFlow.js
      const faceApiScript = document.createElement('script');
      faceApiScript.src = chrome.runtime.getURL('libs/face-api.min.js');
      faceApiScript.onload = () => {
        console.log('Pathos V2: face-api.js loaded');
        librariesLoaded = true;
        resolve();
      };
      faceApiScript.onerror = (error) => {
        console.error('Pathos V2: Failed to load face-api.js:', error);
        reject(error);
      };
      document.head.appendChild(faceApiScript);
    };
    tfScript.onerror = (error) => {
      console.error('Pathos V2: Failed to load TensorFlow.js:', error);
      reject(error);
    };
    document.head.appendChild(tfScript);
  });
}

class PathosHybridEmotionDetector {
  constructor() {
    this.isRunning = false;
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.modelsLoaded = false;
    this.initialized = false;
    this.initPromise = null;
    this.useBackend = false;
    this.backendUrl = CONFIG.backendUrl;
    
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
    
    this.init();
  }

  async init() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('Pathos V2: Initializing hybrid detector...');
        
        // Check backend availability first
        await this.checkBackendAvailability();
        
        if (!this.useBackend) {
          // Fall back to client-side
          console.log('Pathos V2: Backend not available, using client-side AI');
          await this.initClientSide();
        } else {
          console.log('Pathos V2: Using backend for emotion detection');
        }
        
        // Create canvas overlay
        this.createCanvas();
        
        this.initialized = true;
        console.log('Pathos V2: Hybrid detector initialized successfully!');
        resolve();
      } catch (error) {
        console.error('Pathos V2: Initialization error:', error);
        this.initialized = false;
        reject(error);
      }
    });
    
    return this.initPromise;
  }

  async checkBackendAvailability() {
    try {
      console.log('Pathos V2: Checking backend availability...');
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        this.useBackend = true;
        console.log('Pathos V2: Backend is available');
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      console.log('Pathos V2: Backend not available, will use client-side AI');
      this.useBackend = false;
    }
  }

  async initClientSide() {
    // Load libraries first
    await loadLibraries();
    
    // Wait for face-api to be available
    if (typeof faceapi === 'undefined') {
      console.log('Pathos V2: Waiting for face-api.js to load...');
      await this.waitForFaceAPI();
    }
    
    // Load face-api.js models
    await this.loadModels();
  }

  async waitForFaceAPI() {
    return new Promise((resolve) => {
      const checkFaceAPI = () => {
        if (typeof faceapi !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkFaceAPI, 100);
        }
      };
      checkFaceAPI();
    });
  }

  async loadModels() {
    try {
      console.log('Pathos V2: Loading face-api.js models...');
      
      const modelPath = chrome.runtime.getURL('models');
      console.log('Pathos V2: Model path:', modelPath);
      
      // Load face detection and landmark models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
      ]);
      
      this.modelsLoaded = true;
      console.log('Pathos V2: Models loaded successfully!');
    } catch (error) {
      console.error('Pathos V2: Model loading error:', error);
      throw error;
    }
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
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999999;
    `;
    
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);
  }

  async startDetection() {
    if (this.isRunning) {
      console.log('Pathos V2: Detection already running');
      return;
    }
    
    // Wait for initialization
    await this.init();
    
    if (!this.initialized) {
      console.log('Pathos V2: Still initializing, please wait...');
      throw new Error('Not initialized');
    }
    
    if (this.useBackend && !this.modelsLoaded) {
      // If using backend, we don't need client-side models
      this.modelsLoaded = true;
    }
    
    try {
      console.log('Pathos V2: Starting hybrid emotion detection...');
      
      // Get screen capture
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: CONFIG.frameRate, max: 30 }
        },
        audio: false
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
      
      console.log('Pathos V2: Hybrid emotion detection started!');
      
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
      
      let detections = [];
      
      if (this.useBackend) {
        // Use backend for emotion detection
        detections = await this.detectWithBackend();
      } else {
        // Use client-side AI
        detections = await this.detectWithClientSide();
      }
      
      // Draw results
      this.drawDetections(detections);
      
    } catch (error) {
      console.error('Pathos V2: Frame processing error:', error);
    }
    
    // Continue processing
    this.animationFrame = requestAnimationFrame(() => this.processFrame());
  }

  async detectWithBackend() {
    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0);
      
      // Convert to base64
      const base64Frame = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to backend
      const response = await fetch(`${this.backendUrl}/analyze_screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ frame: base64Frame }),
        timeout: CONFIG.backendTimeout
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const results = await response.json();
      
      // Convert backend format to client-side format
      return results.map(result => ({
        box: {
          x: result.region.x,
          y: result.region.y,
          width: result.region.w,
          height: result.region.h
        },
        expressions: result.emotion_scores,
        dominantEmotion: result.dominant_emotion
      }));
      
    } catch (error) {
      console.error('Pathos V2: Backend detection error:', error);
      // Fall back to client-side if backend fails
      if (!this.modelsLoaded) {
        await this.initClientSide();
      }
      return await this.detectWithClientSide();
    }
  }

  async detectWithClientSide() {
    if (!this.modelsLoaded) {
      return [];
    }
    
    // Detect faces and emotions using face-api.js
    const detections = await faceapi
      .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    
    // Convert to our format
    return detections.map(detection => {
      const { box, expressions } = detection;
      const emotions = Object.entries(expressions);
      const dominantEmotion = emotions.reduce((a, b) => a[1] > b[1] ? a : b)[0];
      
      return {
        box,
        expressions,
        dominantEmotion
      };
    });
  }

  drawDetections(detections) {
    detections.forEach(detection => {
      const { box, expressions, dominantEmotion } = detection;
      
      // Get dominant emotion and confidence
      const emotions = Object.entries(expressions);
      const dominant = dominantEmotion || emotions.reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const confidence = emotions.reduce((a, b) => a[1] > b[1] ? a : b)[1];
      
      // Only show if confidence is high enough
      if (confidence < CONFIG.confidenceThreshold) return;
      
      const color = this.emotionColors[dominant] || '#9E9E9E';
      
      // Scale box to screen coordinates
      const scaleX = window.innerWidth / this.video.videoWidth;
      const scaleY = window.innerHeight / this.video.videoHeight;
      
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const width = box.width * scaleX;
      const height = box.height * scaleY;
      
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
        `${dominant.toUpperCase()} (${Math.round(confidence * 100)}%)`,
        x,
        y - 10
      );
      
      // Draw confidence bar
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y + height + 5, width * confidence, 4);
    });
  }

  stopDetection() {
    console.log('Pathos V2: Stopping hybrid emotion detection...');
    
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
    
    console.log('Pathos V2: Hybrid emotion detection stopped!');
  }

  // Method to update backend URL
  setBackendUrl(url) {
    this.backendUrl = url;
    console.log(`Pathos V2: Backend URL updated to ${url}`);
  }
}

// Initialize detector when content script loads
console.log('Pathos V2: Hybrid content script loaded!');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Pathos V2: Received message:', request);
  
  if (request.action === 'ping') {
    // Simple ping to check if content script is running
    sendResponse({ success: true, timestamp: Date.now() });
  } else if (request.action === 'startDetection') {
    if (!emotionDetector) {
      emotionDetector = new PathosHybridEmotionDetector();
    }
    
    // Update backend URL if provided
    if (request.backendUrl) {
      emotionDetector.setBackendUrl(request.backendUrl);
    }
    
    emotionDetector.startDetection()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Pathos V2: Start detection failed:', error);
        sendResponse({ success: false, error: error.message });
      });
  } else if (request.action === 'stopDetection') {
    if (emotionDetector) {
      emotionDetector.stopDetection();
    }
    sendResponse({ success: true });
  } else if (request.action === 'getStatus') {
    sendResponse({ 
      isRunning: emotionDetector ? emotionDetector.isRunning : false,
      modelsLoaded: emotionDetector ? emotionDetector.modelsLoaded : false,
      initialized: emotionDetector ? emotionDetector.initialized : false,
      useBackend: emotionDetector ? emotionDetector.useBackend : false,
      backendUrl: emotionDetector ? emotionDetector.backendUrl : null
    });
  } else if (request.action === 'setBackendUrl') {
    if (emotionDetector) {
      emotionDetector.setBackendUrl(request.url);
    }
    sendResponse({ success: true });
  }
  
  // Always return true to indicate we will send a response asynchronously
  return true;
});
