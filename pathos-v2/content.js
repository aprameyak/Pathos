// Pathos V2 - Client-Side Emotion Recognition
// No backend required - everything runs in the browser!

// Global state
let emotionDetector = null;
let librariesLoaded = false;

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

class PathosEmotionDetector {
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
        console.log('Pathos V2: Initializing...');
        
        // Load libraries first
        await loadLibraries();
        
        // Wait for face-api to be available
        if (typeof faceapi === 'undefined') {
          console.log('Pathos V2: Waiting for face-api.js to load...');
          await this.waitForFaceAPI();
        }
        
        // Load face-api.js models
        await this.loadModels();
        
        // Create canvas overlay
        this.createCanvas();
        
        this.initialized = true;
        console.log('Pathos V2: Initialized successfully!');
        resolve();
      } catch (error) {
        console.error('Pathos V2: Initialization error:', error);
        this.initialized = false;
        reject(error);
      }
    });
    
    return this.initPromise;
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
    
    if (!this.initialized || !this.modelsLoaded) {
      console.log('Pathos V2: Still initializing, please wait...');
      throw new Error('Not initialized');
    }
    
    try {
      console.log('Pathos V2: Starting emotion detection...');
      
      // Get screen capture
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 15, max: 30 }
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
      
      console.log('Pathos V2: Emotion detection started!');
      
    } catch (error) {
      console.error('Pathos V2: Start detection error:', error);
      this.stopDetection();
      throw error;
    }
  }

  async processFrame() {
    if (!this.isRunning || !this.modelsLoaded) return;

    try {
      // Update canvas size
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Detect faces and emotions
      const detections = await faceapi
        .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      
      // Draw results
      this.drawDetections(detections);
      
    } catch (error) {
      console.error('Pathos V2: Frame processing error:', error);
    }
    
    // Continue processing
    this.animationFrame = requestAnimationFrame(() => this.processFrame());
  }

  drawDetections(detections) {
    detections.forEach(detection => {
      const { box, expressions } = detection;
      
      // Get dominant emotion
      const emotions = Object.entries(expressions);
      const dominantEmotion = emotions.reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const confidence = emotions.reduce((a, b) => a[1] > b[1] ? a : b)[1];
      
      // Only show if confidence is high enough
      if (confidence < 0.3) return;
      
      const color = this.emotionColors[dominantEmotion] || '#9E9E9E';
      
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
        `${dominantEmotion.toUpperCase()} (${Math.round(confidence * 100)}%)`,
        x,
        y - 10
      );
      
      // Draw confidence bar
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y + height + 5, width * confidence, 4);
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
console.log('Pathos V2: Content script loaded!');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Pathos V2: Received message:', request);
  
  if (request.action === 'startDetection') {
    if (!emotionDetector) {
      emotionDetector = new PathosEmotionDetector();
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
      initialized: emotionDetector ? emotionDetector.initialized : false
    });
  }
  
  // Always return true to indicate we will send a response asynchronously
  return true;
});
