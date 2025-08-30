#!/bin/bash

# Pathos V2 Extension Installer
# This script helps install the Pathos V2 extension in Chrome

echo "🚀 Pathos V2 Extension Installer"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found!"
    echo "Please run this script from the pathos-v2 directory."
    exit 1
fi

echo "✅ Found Pathos V2 extension files"
echo ""

# Detect operating system
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "🖥️  Detected OS: $MACHINE"
echo ""

# Get current directory
CURRENT_DIR=$(pwd)
echo "📁 Extension location: $CURRENT_DIR"
echo ""

# Instructions for different browsers
echo "📋 Installation Instructions:"
echo ""

case $MACHINE in
    "Mac")
        echo "🍎 For macOS:"
        echo "1. Open Chrome"
        echo "2. Go to chrome://extensions/"
        echo "3. Enable 'Developer mode' (toggle in top right)"
        echo "4. Click 'Load unpacked'"
        echo "5. Select this folder: $CURRENT_DIR"
        echo ""
        echo "💡 Quick open:"
        echo "   open -a "Google Chrome" chrome://extensions/"
        ;;
    "Linux")
        echo "🐧 For Linux:"
        echo "1. Open Chrome"
        echo "2. Go to chrome://extensions/"
        echo "3. Enable 'Developer mode' (toggle in top right)"
        echo "4. Click 'Load unpacked'"
        echo "5. Select this folder: $CURRENT_DIR"
        echo ""
        echo "💡 Quick open:"
        echo "   google-chrome chrome://extensions/"
        ;;
    "Cygwin"|"MinGw")
        echo "🪟 For Windows:"
        echo "1. Open Chrome"
        echo "2. Go to chrome://extensions/"
        echo "3. Enable 'Developer mode' (toggle in top right)"
        echo "4. Click 'Load unpacked'"
        echo "5. Select this folder: $CURRENT_DIR"
        echo ""
        echo "💡 Quick open:"
        echo "   start chrome chrome://extensions/"
        ;;
    *)
        echo "❓ For your operating system:"
        echo "1. Open Chrome"
        echo "2. Go to chrome://extensions/"
        echo "3. Enable 'Developer mode' (toggle in top right)"
        echo "4. Click 'Load unpacked'"
        echo "5. Select this folder: $CURRENT_DIR"
        ;;
esac

echo ""
echo "🧪 Testing:"
echo "1. After installation, open test.html in Chrome"
echo "2. Click the extension icon in the toolbar"
echo "3. Click 'Start Detection'"
echo "4. Select a window when prompted"
echo "5. See emotion detection in action!"
echo ""

# Check if required files exist
echo "📁 Checking required files:"
required_files=("manifest.json" "content.js" "popup.html" "popup.js" "background.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo ""
    echo "🎉 All required files are present!"
else
    echo ""
    echo "⚠️  Warning: Some files are missing. The extension may not work properly."
fi

echo ""
echo "📚 For more information, see README.md"
echo "🐛 For troubleshooting, check the browser console for error messages"
echo ""
echo "✨ Happy emotion detecting!"
