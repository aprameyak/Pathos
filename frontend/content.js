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
    this.requestController = null; // For cancelling requests
    this.retryCount = 0;
    this.maxRetries = 3;
    this.requestTimeout = 15000; // 15 seconds timeout
    this.currentTabId = null; // Store tab ID from popup
    this.currentRequestId = 0; // Track request sequence
    this.pendingRequest = null; // Track current pending request
    
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

  async startDetection(tabId) {
    try {
      console.log('Pathos V2: Starting screenshot-based emotion detection...');
      
      this.isRunning = true;
      this.currentTabId = tabId; // Store the tab ID
      this.retryCount = 0;
      this.currentRequestId = 0;
      this.pendingRequest = null;
      this.showStatusMessage('Starting detection...', 'info');
      this.processScreenshots();
      
      console.log('Pathos V2: Screenshot detection started!');
      
    } catch (error) {
      console.error('Pathos V2: Start detection error:', error);
      this.stopDetection();
      throw error;
    }
  }

  showStatusMessage(message, type = 'info') {
    // Remove existing status message
    const existingStatus = document.getElementById('pathos-status-message');
    if (existingStatus) {
      existingStatus.remove();
    }

    const statusDiv = document.createElement('div');
    statusDiv.id = 'pathos-status-message';
    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 
                   type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 
                   'rgba(0, 0, 0, 0.9)'};
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      z-index: 1000002;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    statusDiv.textContent = message;
    
    this.overlay.appendChild(statusDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.style.opacity = '0';
        setTimeout(() => statusDiv.remove(), 300);
      }
    }, 3000);
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

      // Don't start new request if one is pending
      if (this.pendingRequest) {
        console.log('Pathos V2: Skipping - previous request still pending');
        this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
        return;
      }

      console.log('Pathos V2: Taking screenshot...');
      
      // Cancel any existing request
      if (this.requestController) {
        this.requestController.abort();
      }
      
      // Create new abort controller
      this.requestController = new AbortController();
      
      // Check if we have a tab ID
      if (!this.currentTabId) {
        console.error('Pathos V2: No tab ID available');
        this.showStatusMessage('No tab ID available', 'error');
        this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
        return;
      }
      
      // Generate unique request ID
      const requestId = ++this.currentRequestId;
      this.pendingRequest = requestId;
      
      // Request screenshot from background script
      const screenshotResponse = await chrome.runtime.sendMessage({ 
        action: 'captureScreenshot',
        tabId: this.currentTabId
      });
      
      if (!screenshotResponse || !screenshotResponse.success) {
        console.error('Pathos V2: Failed to capture screenshot:', screenshotResponse?.error);
        this.showStatusMessage('Failed to capture screenshot', 'error');
        this.pendingRequest = null;
        this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
        return;
      }
      
      const dataUrl = screenshotResponse.dataUrl;
      if (!dataUrl) {
        console.error('Pathos V2: No screenshot data received');
        this.showStatusMessage('No screenshot data received', 'error');
        this.pendingRequest = null;
        this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
        return;
      }

      console.log('Pathos V2: Screenshot captured, sending to backend...');
      this.showStatusMessage('Analyzing emotions...', 'info');
      
      // Send to backend with timeout and retry logic
      const response = await this.sendToBackendWithRetry(dataUrl, requestId);
      
      // Only process response if it's still the current request
      if (this.pendingRequest === requestId) {
        if (response && response.ok) {
          const results = await response.json();
          console.log('Pathos V2: Backend results:', results);
          this.displayResults(results);
          this.retryCount = 0; // Reset retry count on success
          this.showStatusMessage(`Found ${results.length} face(s)`, 'success');
        } else {
          console.error('Pathos V2: Backend error:', response?.status, response?.statusText);
          this.showStatusMessage('Backend error - retrying...', 'error');
        }
      } else {
        console.log('Pathos V2: Ignoring response for outdated request', requestId);
      }
      
      // Clear pending request
      this.pendingRequest = null;
      
    } catch (error) {
      console.error('Pathos V2: Screenshot processing error:', error);
      if (error.name === 'AbortError') {
        console.log('Pathos V2: Request was cancelled');
      } else {
        this.showStatusMessage('Processing error - retrying...', 'error');
      }
      this.pendingRequest = null;
    }
    
    // Continue processing
    this.animationFrame = requestAnimationFrame(() => this.processScreenshots());
  }

  async sendToBackendWithRetry(dataUrl, requestId) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Check if this request is still current
        if (this.pendingRequest !== requestId) {
          console.log('Pathos V2: Request outdated, aborting');
          throw new Error('Request outdated');
        }

        const response = await fetch(`${BACKEND_URL}/analyze_screen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ frame: dataUrl }),
          signal: this.requestController.signal,
          // Add timeout
          timeout: this.requestTimeout
        });
        
        return response;
      } catch (error) {
        console.error(`Pathos V2: Attempt ${attempt} failed:`, error);
        
        if (error.name === 'AbortError' || error.message === 'Request outdated') {
          throw error; // Don't retry if aborted or outdated
        }
        
        if (attempt === this.maxRetries) {
          throw error; // Give up after max retries
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  displayResults(results) {
    console.log('Pathos V2: Displaying results:', results);
    
    // Clear previous results
    this.overlay.innerHTML = '';
    
    if (!Array.isArray(results) || results.length === 0) {
      console.log('Pathos V2: No emotions detected');
      return;
    }
    
    console.log('Pathos V2: Creating overlay for', results.length, 'faces');
    
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
        animation: pathosFadeIn 0.3s ease-in;
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
        backdrop-filter: blur(5px);
        z-index: 1000001;
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
        z-index: 1000001;
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
      
      console.log('Pathos V2: Added emotion card for', dominant_emotion, 'at position', region.x, region.y);
    });
    
    // Ensure overlay is visible
    this.overlay.style.display = 'block';
    this.overlay.style.opacity = '1';
    
    console.log('Pathos V2: Overlay display complete with', results.length, 'emotion boxes');
  }

  stopDetection() {
    console.log('Pathos V2: Stopping screenshot detection...');
    
    this.isRunning = false;
    this.currentTabId = null;
    this.pendingRequest = null;
    
    // Cancel any ongoing request
    if (this.requestController) {
      this.requestController.abort();
      this.requestController = null;
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Clear overlay with fade out animation
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.remove();
        }
      }, 300);
    }
    
    console.log('Pathos V2: Screenshot detection stopped!');
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pathosFadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pathosSlideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);

// Initialize detector when content script loads
console.log('Pathos V2: Screenshot content script loaded!');

let emotionDetector = new ScreenshotEmotionDetector();

// Test overlay function
function testOverlay() {
  console.log('Pathos V2: Testing overlay display...');
  
  // Create test results
  const testResults = [
    {
      dominant_emotion: 'happy',
      emotion_scores: { happy: 85, sad: 5, angry: 3, fear: 2, surprise: 3, disgust: 1, neutral: 1 },
      region: { x: 100, y: 100, w: 150, h: 150 }
    },
    {
      dominant_emotion: 'sad',
      emotion_scores: { happy: 10, sad: 75, angry: 5, fear: 3, surprise: 2, disgust: 2, neutral: 3 },
      region: { x: 300, y: 200, w: 120, h: 120 }
    }
  ];
  
  emotionDetector.displayResults(testResults);
  console.log('Pathos V2: Test overlay should be visible now');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Pathos V2: Received message:', request);
  
  if (request.action === 'ping') {
    sendResponse({ success: true, timestamp: Date.now() });
  } else if (request.action === 'startDetection') {
    emotionDetector.startDetection(request.tabId)
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
  } else if (request.action === 'testOverlay') {
    testOverlay();
    sendResponse({ success: true });
  }
  
  return true;
});

// Make testOverlay available globally for debugging
window.testPathosOverlay = testOverlay;
