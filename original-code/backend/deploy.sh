#!/bin/bash

# Pathos Backend Docker Deployment Script
# This script helps deploy the backend to various platforms

set -e

echo "🐳 Pathos Backend Docker Deployment"
echo "===================================="
echo ""

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose not found. Using 'docker compose' instead."
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Function to build and run locally
deploy_local() {
    print_status "Building Docker image..."
    docker build -t pathos-backend .
    
    print_status "Starting services with docker-compose..."
    $DOCKER_COMPOSE up -d
    
    print_status "Waiting for service to start..."
    sleep 10
    
    # Check if service is running
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "✅ Service is running successfully!"
        echo ""
        echo "🌐 Access your API at:"
        echo "   - Health check: http://localhost:5000/health"
        echo "   - API endpoint: http://localhost:5000/analyze_screen"
        echo ""
        echo "📋 To view logs:"
        echo "   $DOCKER_COMPOSE logs -f pathos-backend"
        echo ""
        echo "🛑 To stop:"
        echo "   $DOCKER_COMPOSE down"
    else
        print_error "❌ Service failed to start properly"
        print_status "Checking logs..."
        $DOCKER_COMPOSE logs pathos-backend
        exit 1
    fi
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Please install it first:"
        echo "   npm install -g @railway/cli"
        exit 1
    fi
    
    print_status "Building and pushing to Railway..."
    railway up
    
    print_status "✅ Deployed to Railway successfully!"
}

# Function to deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    print_warning "Please create a new Web Service on Render and connect your repository."
    echo ""
    echo "📋 Render deployment steps:"
    echo "1. Go to https://render.com"
    echo "2. Create a new Web Service"
    echo "3. Connect your GitHub repository"
    echo "4. Set build command: docker build -t pathos-backend ."
    echo "5. Set start command: python app.py"
    echo "6. Set environment variables:"
    echo "   - PORT=10000"
    echo "   - DEBUG=False"
    echo ""
    print_status "The Dockerfile is ready for Render deployment!"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  local     - Deploy locally with Docker"
    echo "  railway   - Deploy to Railway"
    echo "  render    - Show Render deployment instructions"
    echo "  build     - Build Docker image only"
    echo "  test      - Test the API locally"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local"
    echo "  $0 railway"
    echo "  $0 test"
}

# Function to build only
build_only() {
    print_status "Building Docker image..."
    docker build -t pathos-backend .
    print_status "✅ Image built successfully!"
    echo ""
    echo "📋 To run the container:"
    echo "   docker run -p 5000:5000 pathos-backend"
}

# Function to test API
test_api() {
    print_status "Testing API endpoints..."
    
    # Check if service is running
    if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_error "Service is not running. Start it first with: $0 local"
        exit 1
    fi
    
    print_status "Testing health endpoint..."
    curl -s http://localhost:5000/health | python -m json.tool
    
    print_status "✅ API is working correctly!"
}

# Main script logic
case "${1:-help}" in
    "local")
        deploy_local
        ;;
    "railway")
        deploy_railway
        ;;
    "render")
        deploy_render
        ;;
    "build")
        build_only
        ;;
    "test")
        test_api
        ;;
    "help"|*)
        show_usage
        ;;
esac
