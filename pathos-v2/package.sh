#!/bin/bash

echo "📦 Packaging Pathos V2 Extension"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    print_error "manifest.json not found. Make sure you're in the pathos-v2 directory."
    exit 1
fi

# Check if required files exist
required_files=(
    "manifest.json"
    "content.js"
    "popup.html"
    "popup.js"
    "background.js"
    "libs/tensorflow.min.js"
    "libs/face-api.min.js"
    "models/tiny_face_detector_model-weights_manifest.json"
    "models/face_landmark_68_model-weights_manifest.json"
    "models/face_expression_model-weights_manifest.json"
)

print_status "Checking required files..."
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Missing required file: $file"
        print_warning "Run ./download-assets.sh first to download the required libraries and models."
        exit 1
    fi
done

print_status "All required files found!"

# Create distribution directory
print_status "Creating distribution package..."
mkdir -p ../dist

# Copy all files to dist directory
cp -r * ../dist/

# Create zip file
cd ../dist
zip -r ../pathos-v2-extension.zip . -x "*.DS_Store" "*.git*" "*.zip" "download-assets.sh" "package.sh"

# Clean up
cd ..
rm -rf dist

print_status "Extension packaged successfully: pathos-v2-extension.zip"
print_status ""
print_status "🎉 Pathos V2 is ready for distribution!"
print_status ""
print_status "To install in Chrome:"
print_status "1. Open Chrome and go to chrome://extensions/"
print_status "2. Enable 'Developer mode'"
print_status "3. Click 'Load unpacked'"
print_status "4. Select the pathos-v2 folder"
print_status ""
print_status "To distribute:"
print_status "1. Upload pathos-v2-extension.zip to GitHub Releases"
print_status "2. Share the download link with users"
print_status "3. Users can install by dragging the zip file to chrome://extensions/"
print_status ""
print_warning "Remember: This version is 100% client-side - no backend required!"
