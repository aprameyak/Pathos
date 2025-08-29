// Pathos V2 Background Script

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Pathos V2 installed successfully!');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically
  console.log('Extension icon clicked');
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  sendResponse({ success: true });
});
