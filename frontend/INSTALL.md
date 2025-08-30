# 🚀 Pathos Extension Installation Guide

## Quick Setup

### 1. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `frontend` folder from this project
5. The Pathos extension should now appear in your extensions list

### 2. Test the Extension

1. Open the test page: `frontend/test.html` in Chrome
2. Click the Pathos extension icon in your toolbar
3. Click "Start Detection"
4. Watch for emotion boxes around the faces on the page

## 🎯 What the Extension Does

- **Takes screenshots** of the current tab every 3 seconds
- **Sends screenshots** to the AI backend for emotion analysis
- **Displays emotion boxes** around detected faces with:
  - Color-coded borders (each emotion has a unique color)
  - Emotion labels with confidence scores
  - Real-time summary panel

## 🎨 Emotion Color Codes

- **Happy** 🟢 `#00FF88`
- **Sad** 🔵 `#0088FF`
- **Angry** 🔴 `#FF4444`
- **Fear** 🟣 `#AA44FF`
- **Surprise** 🟡 `#FFAA00`
- **Disgust** 🟤 `#8B4513`
- **Neutral** ⚪ `#CCCCCC`

## 🔧 Troubleshooting

### Extension Not Working?
- Make sure you're on a regular webpage (not `chrome://` pages)
- Check that the backend is online (should show "Backend Online" in popup)
- Try refreshing the page and restarting detection

### No Emotion Boxes Appearing?
- Check browser console for errors (F12 → Console)
- Make sure faces are visible on the page
- Wait a few seconds - analysis happens every 3 seconds

### Backend Errors?
- The backend might be temporarily unavailable
- Wait a few minutes and try again
- Check the extension popup for backend status

## 📱 Permissions

The extension needs these permissions:
- `activeTab` - To capture screenshots of the current tab
- `scripting` - To inject content scripts
- `storage` - To save settings
- `<all_urls>` - To work on any website

## 🎪 Test Scenarios

1. **Basic Test**: Use the provided `test.html` page
2. **Social Media**: Try on Facebook, Instagram, or LinkedIn
3. **Video Calls**: Test during Zoom or Google Meet calls
4. **News Sites**: Try on sites with profile photos

## 🚨 Important Notes

- **Privacy**: Screenshots are sent to the backend for analysis but not stored
- **Performance**: Analysis happens every 3 seconds to avoid overwhelming the backend
- **Accuracy**: Emotion detection accuracy depends on image quality and face visibility
- **Browser Support**: Currently optimized for Chrome/Chromium browsers

## 🔄 Updates

To update the extension:
1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Pathos extension
4. Reload any test pages

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the backend is online at `https://aprameyak-pathos.hf.space/health`
3. Try on different websites to isolate the issue
4. Restart the extension and browser if needed

---

**Happy emotion detecting! 😊**
