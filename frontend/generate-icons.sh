#!/bin/bash

# Pathos Icon Generation Script
# This script helps generate PNG icons from the SVG file

echo "Pathos Icon Generation Script"
echo "============================="

# Check if SVG exists
if [ ! -f "icon.svg" ]; then
    echo "Error: icon.svg not found!"
    echo "Please ensure icon.svg exists in the current directory."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Try different methods to convert SVG to PNG
if command_exists "rsvg-convert"; then
    echo "Using rsvg-convert to generate icons..."
    rsvg-convert -w 16 -h 16 icon.svg -o icon16.png
    rsvg-convert -w 48 -h 48 icon.svg -o icon48.png
    rsvg-convert -w 128 -h 128 icon.svg -o icon128.png
    echo "Icons generated successfully!"
    
elif command_exists "convert"; then
    echo "Using ImageMagick convert to generate icons..."
    convert icon.svg -resize 16x16 icon16.png
    convert icon.svg -resize 48x48 icon48.png
    convert icon.svg -resize 128x128 icon128.png
    echo "Icons generated successfully!"
    
elif command_exists "magick"; then
    echo "Using ImageMagick magick to generate icons..."
    magick icon.svg -resize 16x16 icon16.png
    magick icon.svg -resize 48x48 icon48.png
    magick icon.svg -resize 128x128 icon128.png
    echo "Icons generated successfully!"
    
else
    echo "No suitable conversion tool found."
    echo ""
    echo "To generate PNG icons, you can:"
    echo "1. Install rsvg-convert: brew install librsvg (macOS) or apt-get install librsvg2-bin (Ubuntu)"
    echo "2. Install ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Ubuntu)"
    echo "3. Use an online SVG to PNG converter with the icon.svg file"
    echo "4. Use a graphics editor like Inkscape, GIMP, or Photoshop"
    echo ""
    echo "Required icon sizes: 16x16, 48x48, and 128x128 pixels"
    echo "Current placeholder files will need to be replaced with actual PNG images."
fi

echo ""
echo "Icon generation complete!"
