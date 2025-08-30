// Pathos Background Script

// Extension state
let extensionState = {
  installed: false,
  version: '2.0.0',
  lastActive: null
};

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Pathos: Extension installed/updated', details);
  
  if (details.reason === 'install') {
    extensionState.installed = true;
    extensionState.lastActive = Date.now();
    console.log('Pathos: First time installation');
    
    // Don't open any external pages - just log the installation
  } else if (details.reason === 'update') {
    console.log('Pathos: Extension updated from version', details.previousVersion);
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Pathos: Extension started');
  extensionState.lastActive = Date.now();
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Pathos: Extension icon clicked on tab:', tab.id);
  extensionState.lastActive = Date.now();
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Pathos: Background received message:', request, 'from:', sender);
  
  switch (request.action) {
    case 'getExtensionInfo':
      sendResponse({
        version: extensionState.version,
        installed: extensionState.installed,
        lastActive: extensionState.lastActive
      });
      break;
      
    case 'ping':
      sendResponse({ success: true, timestamp: Date.now() });
      break;
      
    case 'captureScreenshot':
      // Handle screenshot capture request from content script
      captureScreenshot(request.tabId)
        .then(dataUrl => {
          sendResponse({ success: true, dataUrl: dataUrl });
        })
        .catch(error => {
          console.error('Pathos: Screenshot capture failed:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep message channel open for async response
      
    default:
      sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Function to capture screenshot
async function captureScreenshot(tabId) {
  try {
    console.log('Pathos: Capturing screenshot for tab:', tabId);
    
    // Use null for windowId to capture the current window
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { 
      format: 'jpeg', 
      quality: 80 
    });
    
    console.log('Pathos: Screenshot captured successfully');
    return dataUrl;
  } catch (error) {
    console.error('Pathos: Screenshot capture error:', error);
    throw error;
  }
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !isRestrictedPage(tab.url)) {
    console.log('Pathos: Tab updated, checking content script:', tab.url);
    
    // Check if content script is already injected
    chrome.tabs.sendMessage(tabId, { action: 'ping' })
      .catch(() => {
        console.log('Pathos: Content script not found, injecting...');
        // Content script will be automatically injected via manifest
      });
  }
});

// Handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Pathos: Tab activated:', activeInfo.tabId);
  extensionState.lastActive = Date.now();
});

// Helper function to check if page is restricted
function isRestrictedPage(url) {
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

// Periodic cleanup and health check
setInterval(() => {
  const now = Date.now();
  const timeSinceLastActive = now - extensionState.lastActive;
  
  // Log health status every 5 minutes
  if (timeSinceLastActive > 300000) { // 5 minutes
    console.log('Pathos: Extension health check - last active:', new Date(extensionState.lastActive));
  }
}, 60000); // Check every minute

console.log('Pathos: Background script loaded successfully!');
