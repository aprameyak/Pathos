// Pathos V2 - Screenshot-based Emotion Detection
// Takes full screenshots and displays emotions in a clean overlay

// Backend URL
const BACKEND_URL = 'https://aprameyak-pathos.hf.space';

class ScreenshotEmotionDetector {
  constructor() {
    this.isRunning = false;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.lastProcessTime = 0;
    this.lastResults = null;
    this.overlay = null;
    
    // Emotion colors
    this.emotionColors = {
      happy: '#00FF88',
      sad: '#0088FF', 
      angry: '#FF4444',
      fear: '#AA44FF',
      surprise: '#FFAA00',
      disgust: '#8B4513',
      neutral: '#CCCCCC'
    };
    
    this.createOverlay();
  }

  createOverlay() {
    // Remove existing overlay
    const existingOverlay = document.getElementById('pathos-emotion-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'pathos-emotion-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(this.overlay);
  }

  async startDetection() {
    try {
      console.log('Pathos V2: Starting screenshot-based emotion detection...');
      
      this.isRunning = true;
      this.processScreenshots();
      
      console.log('Pathos V2: Screenshot detection started!');
      
    } catch (error) {
      console.error('Pathos V2: Start detection error:', error);
      this.stopDetection();
      throw error;
    }
  }

  async processScreenshots() {
    if (!this.isRunning) return;

    try {
      // Throttle to every 3 seconds
      const now = Date.now();
      if (now - this.lastProcessTime < 3000) {
        this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
        return;
      }
      this.lastProcessTime = now;

      console.log('Pathos V2: Taking screenshot...');
      
      // Take screenshot using chrome.tabs.captureVisibleTab
      const dataUrl = await new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 80 }, resolve);
      });
      
      if (!dataUrl) {
        console.error('Pathos V2: Failed to capture screenshot');
        this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
        return;
      }

      console.log('Pathos V2: Screenshot captured, sending to backend...');
      
      // Send to backend
      const response = await fetch(`${BACKEND_URL}/analyze_screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frame: dataUrl })
      });
      
      console.log('Pathos V2: Backend response status:', response.status);
      
      if (response.ok) {
        const results = await response.json();
        console.log('Pathos V2: Backend results:', results);
        this.displayResults(results);
      } else {
        console.error('Pathos V2: Backend error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Pathos V2: Error details:', errorText);
      }
      
    } catch (error) {
      console.error('Pathos V2: Screenshot processing error:', error);
    }
    
    // Continue processing
    this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
  }

  displayResults(results) {
    console.log('Pathos V2: Displaying results:', results);
    
    // Clear previous results
    this.overlay.innerHTML = '';
    
    if (!Array.isArray(results) || results.length === 0) {
      console.log('Pathos V2: No emotions detected');
      return;
    }
    
    // Create emotion cards
    results.forEach((result, index) => {
      const { dominant_emotion, emotion_scores, region } = result;
      console.log('Pathos V2: Displaying emotion:', dominant_emotion, 'with region:', region);
      
      const color = this.emotionColors[dominant_emotion] || '#CCCCCC';
      const confidence = Math.max(...Object.values(emotion_scores));
      
      // Create emotion card
      const card = document.createElement('div');
      card.style.cssText = `
        position: absolute;
        left: ${region.x}px;
        top: ${region.y}px;
        width: ${region.w}px;
        height: ${region.h}px;
        border: 3px solid ${color};
        border-radius: 8px;
        pointer-events: none;
        z-index: 1000000;
        box-shadow: 0 0 20px ${color}40;
      `;
      
      // Create emotion label
      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        top: -35px;
        left: 0;
        background: rgba(0, 0, 0, 0.9);
        color: ${color};
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        border: 2px solid ${color};
      `;
      label.textContent = `${dominant_emotion.toUpperCase()} (${Math.round(confidence)}%)`;
      
      // Create confidence bar
      const confidenceBar = document.createElement('div');
      confidenceBar.style.cssText = `
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 100%;
        height: 6px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
        overflow: hidden;
      `;
      
      const confidenceFill = document.createElement('div');
      confidenceFill.style.cssText = `
        width: ${confidence}%;
        height: 100%;
        background: ${color};
        transition: width 0.3s ease;
      `;
      
      confidenceBar.appendChild(confidenceFill);
      card.appendChild(label);
      card.appendChild(confidenceBar);
      this.overlay.appendChild(card);
    });
    
    // Add summary info
    const summary = document.createElement('div');
    summary.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-size: 14px;
      z-index: 1000001;
      border: 2px solid #00FF88;
    `;
    
    const emotionCounts = {};
    results.forEach(result => {
      const emotion = result.dominant_emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    summary.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px;">😊 Emotions Detected</div>
      ${Object.entries(emotionCounts).map(([emotion, count]) => 
        `<div style="color: ${this.emotionColors[emotion]}; margin: 2px 0;">
          ${emotion.toUpperCase()}: ${count}
        </div>`
      ).join('')}
      <div style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
        Total: ${results.length} faces
      </div>
    `;
    
    this.overlay.appendChild(summary);
  }

  stopDetection() {
    console.log('Pathos V2: Stopping screenshot detection...');
    
    this.isRunning = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Clear overlay
    if (this.overlay) {
      this.overlay.innerHTML = '';
    }
    
    console.log('Pathos V2: Screenshot detection stopped!');
  }
}

// Initialize detector when content script loads
console.log('Pathos V2: Screenshot content script loaded!');

let emotionDetector = new ScreenshotEmotionDetector();

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
