#!/bin/bash

echo "📦 Packaging Chrome Extension for Distribution"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "chromeextension/manifest.json" ]; then
    echo "Error: manifest.json not found. Make sure you're in the project root."
    exit 1
fi

# Create distribution directory
print_status "Creating distribution directory..."
mkdir -p dist

# Copy extension files
print_status "Copying extension files..."
cp -r chromeextension/* dist/

# Create zip file
print_status "Creating extension package..."
cd dist
zip -r ../pathos-extension.zip . -x "*.DS_Store" "*.git*" "*.zip"
cd ..

# Clean up
rm -rf dist

print_status "Extension packaged successfully: pathos-extension.zip"
print_status ""
print_status "Next steps:"
print_status "1. Deploy your backend to Railway or Render"
print_status "2. Update the backend URL in chromeextension/manifest.json"
print_status "3. Upload pathos-extension.zip to GitHub Releases"
print_status "4. Share the extension with users"
print_status ""
print_warning "Remember to update the host_permissions in manifest.json with your deployed backend URL!"
