#!/bin/bash

# Pathos Backend - Hugging Face Spaces Deployment Script
# Optimized for 2 CPU cores and 16GB RAM

set -e

echo "🤗 Pathos Backend - Hugging Face Spaces Deployment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "app.py" ] || [ ! -f "Dockerfile" ] || [ ! -f "requirements.txt" ]; then
    print_error "Missing required files (app.py, Dockerfile, requirements.txt)"
    echo "Please run this script from the backend directory."
    exit 1
fi

print_status "✅ Found all required files for Hugging Face Spaces deployment"

# Check file sizes and optimization
print_info "Checking file sizes and optimizations..."

# Check Dockerfile
if grep -q "OMP_NUM_THREADS=2" Dockerfile; then
    print_status "✅ Dockerfile optimized for 2 CPU cores"
else
    print_warning "⚠️  Dockerfile not optimized for 2 CPU cores"
fi

# Check requirements.txt
if grep -q "tensorflow" requirements.txt; then
    print_status "✅ TensorFlow included in requirements"
else
    print_error "❌ TensorFlow missing from requirements"
fi

# Check app.py
if grep -q "OMP_NUM_THREADS.*2" app.py; then
    print_status "✅ App optimized for 2 CPU cores"
else
    print_warning "⚠️  App not optimized for 2 CPU cores"
fi

echo ""
print_info "📋 Deployment Steps for Hugging Face Spaces:"
echo ""

echo "1. 🚀 Create a new Space on Hugging Face:"
echo "   - Go to https://huggingface.co/spaces"
echo "   - Click 'Create new Space'"
echo "   - Choose 'Docker' as the SDK"
echo "   - Set Space name: pathos-emotion-api"
echo "   - Set visibility: Public or Private"
echo ""

echo "2. 🔗 Connect your repository:"
echo "   - Connect your GitHub repository"
echo "   - Set repository path to your backend folder"
echo "   - Click 'Create Space'"
echo ""

echo "3. ⚙️  Configure Space settings:"
echo "   - Hardware: CPU (2 cores, 16GB RAM)"
echo "   - Build command: (auto-detected from Dockerfile)"
echo "   - Start command: (auto-detected from Dockerfile)"
echo ""

echo "4. 🐳 Docker configuration:"
echo "   - Port: 7860 (HF Spaces default)"
echo "   - Environment: Optimized for 2 CPU cores"
echo "   - Memory: Up to 16GB RAM available"
echo ""

echo "5. 🔄 Auto-deployment:"
echo "   - Space will auto-deploy on git push"
echo "   - Build logs available in Space dashboard"
echo "   - Health checks run automatically"
echo ""

# Test local build
print_info "🧪 Testing local Docker build..."

if command -v docker &> /dev/null; then
    print_status "Building Docker image locally for testing..."
    
    # Build the image
    docker build -t pathos-hf-test .
    
    if [ $? -eq 0 ]; then
        print_status "✅ Docker build successful!"
        
        # Test the container
        print_status "Testing container startup..."
        docker run -d --name pathos-test -p 7860:7860 pathos-hf-test
        
        # Wait for startup
        sleep 10
        
        # Test health endpoint
        if curl -f http://localhost:7860/health > /dev/null 2>&1; then
            print_status "✅ Container health check passed!"
            
            # Show health response
            echo ""
            print_info "Health check response:"
            curl -s http://localhost:7860/health | python -m json.tool 2>/dev/null || curl -s http://localhost:7860/health
            
            # Clean up
            docker stop pathos-test
            docker rm pathos-test
            
        else
            print_error "❌ Container health check failed"
            docker logs pathos-test
            docker stop pathos-test
            docker rm pathos-test
        fi
        
    else
        print_error "❌ Docker build failed"
        exit 1
    fi
else
    print_warning "⚠️  Docker not available, skipping local test"
fi

echo ""
print_info "📊 Performance Optimizations for 2 CPU cores & 16GB RAM:"
echo ""

echo "✅ Threading optimized for 2 cores:"
echo "   - OMP_NUM_THREADS=2"
echo "   - MKL_NUM_THREADS=2"
echo "   - OPENBLAS_NUM_THREADS=2"
echo ""

echo "✅ Memory optimized for 16GB RAM:"
echo "   - Max image size: 1024px"
echo "   - Max faces: 10"
echo "   - Cache size: 100 results"
echo ""

echo "✅ Performance features:"
echo "   - Result caching (LRU)"
echo "   - Image compression"
echo "   - Silent DeepFace mode"
echo "   - Optimized OpenCV backend"
echo ""

print_info "🔗 After deployment, your API will be available at:"
echo "   https://your-username-pathos-emotion-api.hf.space"
echo ""

print_info "🧪 Test endpoints:"
echo "   - Health: https://your-username-pathos-emotion-api.hf.space/health"
echo "   - Config: https://your-username-pathos-emotion-api.hf.space/config"
echo "   - API: https://your-username-pathos-emotion-api.hf.space/analyze_screen"
echo ""

print_info "📈 Monitoring:"
echo "   - View logs in Space dashboard"
echo "   - Monitor resource usage"
echo "   - Check health endpoint regularly"
echo ""

print_status "🎉 Ready for Hugging Face Spaces deployment!"
echo ""
print_info "Next steps:"
echo "1. Create Space on Hugging Face"
echo "2. Connect your repository"
echo "3. Deploy and test"
echo "4. Update extension with your Space URL"
echo ""

print_status "✨ Happy deploying!"
