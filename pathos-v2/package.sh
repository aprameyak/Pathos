#!/bin/bash

# Pathos V2 Extension Packager
# This script creates a distributable zip file of the extension

echo "📦 Pathos V2 Extension Packager"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found!"
    echo "Please run this script from the pathos-v2 directory."
    exit 1
fi

# Get version from manifest.json
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "📋 Version: $VERSION"

# Create output directory
OUTPUT_DIR="../dist"
mkdir -p "$OUTPUT_DIR"

# Create zip filename
ZIP_NAME="pathos-v2-extension-v${VERSION}.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

echo "📁 Creating package: $ZIP_PATH"
echo ""

# List files to be included
echo "📋 Files to be included:"
FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "popup.html"
    "popup.js"
    "README.md"
    "install.sh"
    "test.html"
    "libs/"
    "models/"
)

for file in "${FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

echo ""

# Create the zip file
echo "🗜️  Creating zip file..."
if command -v zip >/dev/null 2>&1; then
    # Use zip command
    zip -r "$ZIP_PATH" "${FILES[@]}" -x "*.DS_Store" "*.git*" "node_modules/*"
    echo "✅ Zip file created successfully!"
elif command -v 7z >/dev/null 2>&1; then
    # Use 7zip command
    7z a "$ZIP_PATH" "${FILES[@]}" -xr!*.DS_Store -xr!*.git* -xr!node_modules/*
    echo "✅ 7z file created successfully!"
else
    echo "❌ Error: Neither 'zip' nor '7z' command found!"
    echo "Please install zip or 7zip to create the package."
    exit 1
fi

# Check if zip was created successfully
if [ -f "$ZIP_PATH" ]; then
    SIZE=$(du -h "$ZIP_PATH" | cut -f1)
    echo ""
    echo "📊 Package Information:"
    echo "   File: $ZIP_NAME"
    echo "   Size: $SIZE"
    echo "   Location: $ZIP_PATH"
    echo ""
    echo "🎉 Package created successfully!"
    echo ""
    echo "📋 Distribution Instructions:"
    echo "1. Share the zip file with users"
    echo "2. Users extract the zip file"
    echo "3. Run install.sh or follow manual installation"
    echo "4. Load as unpacked extension in Chrome"
    echo ""
    echo "💡 Quick test:"
    echo "   unzip -l $ZIP_PATH"
else
    echo "❌ Error: Failed to create package!"
    exit 1
fi

echo "✨ Packaging complete!"
