// Pathos V2 Popup Controller

class PathosPopup {
  constructor() {
    this.isRunning = false;
    this.modelsLoaded = false;
    this.initialized = false;
    this.currentTab = null;
    this.init();
  }

  async init() {
    // Get DOM elements
    this.statusIndicator = document.getElementById('statusIndicator');
    this.statusText = document.getElementById('statusText');
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');

    // Add event listeners
    this.startBtn.addEventListener('click', () => this.startDetection());
    this.stopBtn.addEventListener('click', () => this.stopDetection());

    // Check initial status
    await this.updateStatus();
    
    // Update status every 2 seconds
    setInterval(() => this.updateStatus(), 2000);
  }

  async updateStatus() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      if (!tab) {
        this.updateUI('error', 'No active tab found');
        return;
      }

      // Check if content script can run on this tab
      if (this.isRestrictedPage(tab.url)) {
        this.updateUI('error', 'Not available on this page');
        return;
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
      
      if (response) {
        this.isRunning = response.isRunning;
        this.modelsLoaded = response.modelsLoaded;
        this.initialized = response.initialized;
        
        if (this.isRunning) {
          this.updateUI('running', 'Detection Active');
        } else if (this.initialized && this.modelsLoaded) {
          this.updateUI('stopped', 'Ready to Start');
        } else if (this.initialized) {
          this.updateUI('loading', 'Loading Models...');
        } else {
          this.updateUI('loading', 'Initializing...');
        }
      } else {
        this.updateUI('error', 'Extension not ready');
      }
    } catch (error) {
      console.error('Status update error:', error);
      // Check if it's a connection error (content script not running)
      if (error.message.includes('Receiving end does not exist')) {
        this.updateUI('error', 'Navigate to a web page');
      } else {
        this.updateUI('error', 'Extension not ready');
      }
    }
  }

  isRestrictedPage(url) {
    const restrictedPrefixes = [
      'chrome://',
      'chrome-extension://',
      'edge://',
      'about:',
      'moz-extension://',
      'safari-extension://'
    ];
    
    return restrictedPrefixes.some(prefix => url.startsWith(prefix));
  }

  updateUI(status, text) {
    // Update status indicator
    this.statusIndicator.className = `status-indicator ${status}`;
    
    // Update status text
    this.statusText.textContent = text;
    
    // Update button states
    switch (status) {
      case 'running':
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        break;
      case 'stopped':
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        break;
      case 'loading':
        this.startBtn.disabled = true;
        this.stopBtn.disabled = true;
        break;
      case 'error':
        this.startBtn.disabled = true;
        this.stopBtn.disabled = true;
        break;
    }
  }

  async startDetection() {
    try {
      this.startBtn.disabled = true;
      this.updateUI('loading', 'Starting...');
      
      if (!this.currentTab) {
        throw new Error('No active tab found');
      }

      // Check if content script can run on this tab
      if (this.isRestrictedPage(this.currentTab.url)) {
        throw new Error('Not available on this page');
      }

      // Send start message to content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'startDetection' });
      
      if (response && response.success) {
        this.updateUI('running', 'Detection Active');
        this.isRunning = true;
      } else {
        const errorMsg = response && response.error ? response.error : 'Failed to start detection';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Start detection error:', error);
      if (error.message.includes('Receiving end does not exist')) {
        this.updateUI('error', 'Navigate to a web page');
      } else if (error.message.includes('Not available on this page')) {
        this.updateUI('error', 'Not available on this page');
      } else {
        this.updateUI('error', error.message || 'Failed to start');
      }
      this.startBtn.disabled = false;
    }
  }

  async stopDetection() {
    try {
      this.stopBtn.disabled = true;
      this.updateUI('loading', 'Stopping...');
      
      if (!this.currentTab) {
        throw new Error('No active tab found');
      }

      // Check if content script can run on this tab
      if (this.isRestrictedPage(this.currentTab.url)) {
        throw new Error('Not available on this page');
      }

      // Send stop message to content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'stopDetection' });
      
      if (response && response.success) {
        this.updateUI('stopped', 'Ready to Start');
        this.isRunning = false;
      } else {
        throw new Error('Failed to stop detection');
      }
    } catch (error) {
      console.error('Stop detection error:', error);
      if (error.message.includes('Receiving end does not exist')) {
        this.updateUI('error', 'Navigate to a web page');
      } else if (error.message.includes('Not available on this page')) {
        this.updateUI('error', 'Not available on this page');
      } else {
        this.updateUI('error', 'Failed to stop');
      }
      this.stopBtn.disabled = false;
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PathosPopup();
});
