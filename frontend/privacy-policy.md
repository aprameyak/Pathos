# Privacy Policy for Pathos Chrome Extension

**Last updated:** December 2024

## Overview
Pathos is a Chrome extension that provides real-time emotion recognition by analyzing facial expressions on web pages. This privacy policy explains how we handle your data and protect your privacy.

## Data Collection
**We do not collect, store, or transmit any personal data.**

### What We Don't Collect:
- Personal information
- Browsing history
- Screenshots or images
- Usage analytics
- Tracking data
- Any form of user data

### What Happens to Images:
- Screenshots are captured temporarily for emotion analysis
- Images are processed in memory only
- Images are immediately discarded after processing
- No images are stored, saved, or transmitted
- No images leave your device except for the brief moment of analysis

## Data Processing
### Local Processing:
- Screenshot capture happens locally in your browser
- Images are sent to our AI backend for emotion analysis
- Analysis results are returned to display emotion overlays
- All processing data is discarded immediately

### Backend Processing:
- Our backend service processes images for emotion recognition
- No images are stored on our servers
- Processing is done in memory and results are returned
- Server logs do not contain image data

## Third-Party Services
### AI Backend:
- We use a Hugging Face Spaces hosted backend for emotion analysis
- The backend uses DeepFace technology for facial expression recognition
- No data is shared with third parties beyond this processing

## Permissions
### Required Permissions:
- `activeTab`: To capture screenshots of the current tab
- `scripting`: To inject content scripts for overlay display
- `storage`: To save user preferences (start/stop state)
- `tabs`: To access tab information for screenshot capture
- `<all_urls>`: To work on any website with faces

### How Permissions Are Used:
- Screenshot capture: Only when detection is active
- Content scripts: To display emotion overlays
- Storage: To remember if detection is running
- Tab access: To capture visible content for analysis

## Security
- All communication is secured via HTTPS
- No sensitive data is transmitted
- Images are processed securely on our backend
- No persistent storage of any user data

## Children's Privacy
This extension is not intended for children under 13. We do not knowingly collect any personal information from children under 13.

## Changes to This Policy
We may update this privacy policy from time to time. We will notify users of any material changes by updating the version number and date.

## Contact Information
For questions about this privacy policy, please contact us through our GitHub repository or support channels.

## Compliance
This extension complies with:
- Chrome Web Store policies
- GDPR requirements (no personal data collection)
- CCPA requirements (no personal data collection)
- General privacy best practices

## Data Retention
- No user data is retained
- All processing data is discarded immediately
- No logs contain personal information
- No analytics or tracking data is collected

Your privacy is our priority. Pathos is designed to provide emotion recognition functionality without compromising your personal data or privacy.
