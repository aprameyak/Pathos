// Pathos V2 Popup Controller

class PathosPopup {
  constructor() {
    this.isRunning = false;
    this.modelsLoaded = false;
    this.initialized = false;
    this.currentTab = null;
    this.backendOnline = false;
    this.init();
  }

  async init() {
    // Get DOM elements
    this.statusIndicator = document.getElementById('statusIndicator');
    this.statusText = document.getElementById('statusText');
    this.backendStatus = document.getElementById('backendStatus');
    this.backendIndicator = document.getElementById('backendIndicator');
    this.backendText = document.getElementById('backendText');
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');

    // Add event listeners
    this.startBtn.addEventListener('click', () => this.startDetection());
    this.stopBtn.addEventListener('click', () => this.stopDetection());

    // Check initial status
    await this.updateStatus();
    await this.checkBackendStatus();
    
    // Update status every 2 seconds
    setInterval(() => this.updateStatus(), 2000);
    setInterval(() => this.checkBackendStatus(), 10000); // Check backend every 10 seconds
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

      // Try to send message to content script
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
      } catch (error) {
        // If content script is not running, try to inject it
        if (error.message.includes('Receiving end does not exist')) {
          console.log('Content script not found, attempting to inject...');
          await this.injectContentScript(tab.id);
          
          // Wait a moment for injection to complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try again
          try {
            response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
          } catch (retryError) {
            console.error('Failed to inject content script:', retryError);
            this.updateUI('error', 'Navigate to a web page');
            return;
          }
        } else {
          throw error;
        }
      }
      
      if (response) {
        this.isRunning = response.isRunning;
        this.modelsLoaded = response.modelsLoaded;
        this.initialized = response.initialized;
        
        if (this.isRunning) {
          this.updateUI('running', 'Detection Active');
        } else if (this.initialized && this.modelsLoaded) {
          if (this.backendOnline) {
            this.updateUI('stopped', 'Ready to Start');
          } else {
            this.updateUI('error', 'Backend Offline');
          }
        } else if (this.initialized) {
          this.updateUI('loading', 'Connecting to Backend...');
        } else {
          this.updateUI('loading', 'Initializing...');
        }
      } else {
        this.updateUI('error', 'Extension not ready');
      }
    } catch (error) {
      console.error('Status update error:', error);
      this.updateUI('error', 'Extension not ready');
    }
  }

  async injectContentScript(tabId) {
    try {
      // Inject the content script manually
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      console.log('Content script injected successfully');
    } catch (error) {
      console.error('Failed to inject content script:', error);
      throw error;
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

  async checkBackendStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('https://aprameyak-pathos.hf.space/health', {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.backendOnline = true;
        this.backendStatus.style.display = 'block';
        this.backendIndicator.className = 'status-indicator backend';
        this.backendText.textContent = 'Backend Online';
      } else {
        this.backendOnline = false;
        this.backendStatus.style.display = 'block';
        this.backendIndicator.className = 'status-indicator error';
        this.backendText.textContent = 'Backend Offline';
      }
    } catch (error) {
      this.backendOnline = false;
      this.backendStatus.style.display = 'block';
      this.backendIndicator.className = 'status-indicator error';
      this.backendText.textContent = 'Backend Unreachable';
    }
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
        this.startBtn.disabled = !this.backendOnline;
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

      // Check if backend is online
      if (!this.backendOnline) {
        throw new Error('Backend is offline. Please try again later.');
      }

      // Ensure content script is running
      try {
        await chrome.tabs.sendMessage(this.currentTab.id, { action: 'ping' });
      } catch (error) {
        if (error.message.includes('Receiving end does not exist')) {
          await this.injectContentScript(this.currentTab.id);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Send start message to content script with tab ID
      const response = await chrome.tabs.sendMessage(this.currentTab.id, { 
        action: 'startDetection',
        tabId: this.currentTab.id
      });
      
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
      } else if (error.message.includes('Backend is offline')) {
        this.updateUI('error', 'Backend is offline');
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
