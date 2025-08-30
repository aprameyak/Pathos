#!/bin/bash

echo "📥 Downloading Pathos V2 Assets"
echo "================================"

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

# Create directories if they don't exist
mkdir -p libs models

# Download TensorFlow.js
print_status "Downloading TensorFlow.js..."
curl -L "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js" -o libs/tensorflow.min.js

# Download face-api.js
print_status "Downloading face-api.js..."
curl -L "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js" -o libs/face-api.min.js

# Download face-api.js models
print_status "Downloading face detection models..."

# Tiny Face Detector
curl -L "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json" -o models/tiny_face_detector_model-weights_manifest.json
curl -L "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1" -o models/tiny_face_detector_model-shard1

# Face Landmark 68
curl -L "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json" -o models/face_landmark_68_model-weights_manifest.json
curl -L "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1" -o models/face_landmark_68_model-shard1

# Face Expression
curl -L "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-weights_manifest.json" -o models/face_expression_model-weights_manifest.json
curl -L "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-shard1" -o models/face_expression_model-shard1

print_status "All assets downloaded successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Create extension icons (16x16, 48x48, 128x128 PNG files)"
print_status "2. Load the extension in Chrome Developer Mode"
print_status "3. Test the emotion detection!"
print_status ""
print_warning "Note: The models are quite large (~10MB total). This is normal for AI models."
