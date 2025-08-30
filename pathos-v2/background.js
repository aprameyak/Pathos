// Pathos V2 Background Script

// Extension state
let extensionState = {
  installed: false,
  version: '2.0.0',
  lastActive: null
};

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Pathos V2: Extension installed/updated', details);
  
  if (details.reason === 'install') {
    extensionState.installed = true;
    extensionState.lastActive = Date.now();
    console.log('Pathos V2: First time installation');
    
    // Open welcome page or show notification
    chrome.tabs.create({
      url: 'https://github.com/your-repo/pathos-v2#readme'
    });
  } else if (details.reason === 'update') {
    console.log('Pathos V2: Extension updated from version', details.previousVersion);
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Pathos V2: Extension started');
  extensionState.lastActive = Date.now();
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Pathos V2: Extension icon clicked on tab:', tab.id);
  extensionState.lastActive = Date.now();
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Pathos V2: Background received message:', request, 'from:', sender);
  
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
      
    default:
      sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !isRestrictedPage(tab.url)) {
    console.log('Pathos V2: Tab updated, checking content script:', tab.url);
    
    // Check if content script is already injected
    chrome.tabs.sendMessage(tabId, { action: 'ping' })
      .catch(() => {
        console.log('Pathos V2: Content script not found, injecting...');
        // Content script will be automatically injected via manifest
      });
  }
});

// Handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Pathos V2: Tab activated:', activeInfo.tabId);
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
    console.log('Pathos V2: Extension health check - last active:', new Date(extensionState.lastActive));
  }
}, 60000); // Check every minute

console.log('Pathos V2: Background script loaded successfully!');
