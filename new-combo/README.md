# Pathos Hybrid Solution

This folder contains the hybrid approach that combines both client-side AI and backend deployment.

## Files:
- `content-hybrid.js` - Extension content script that can switch between client-side AI and backend API

## How it works:
1. First tries to connect to configured backend URL
2. If backend fails, falls back to client-side AI
3. Provides seamless experience regardless of backend availability

## Usage:
- Copy this content script to your extension
- Configure backend URL in the script
- Extension will automatically choose the best available method
