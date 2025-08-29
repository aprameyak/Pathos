#!/bin/bash

echo "🚀 Deploying Pathos - Emotion Recognition System"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "All dependencies are installed ✓"
}

# Deploy Backend to Render
deploy_backend() {
    print_status "Deploying backend to Render..."
    
    cd backend
    
    # Check if requirements.txt exists
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found in backend directory"
        exit 1
    fi
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in backend directory"
        exit 1
    fi
    
    print_status "Backend files are ready for deployment ✓"
    print_warning "Please deploy to Render manually:"
    print_warning "1. Go to https://render.com"
    print_warning "2. Connect your GitHub repository"
    print_warning "3. Create a new Web Service"
    print_warning "4. Select the backend directory"
    print_warning "5. Use Docker deployment"
    print_warning "6. Set environment variables if needed"
    
    cd ..
}

# Deploy Frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build the project
    print_status "Building frontend..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend build successful ✓"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_status "Deploying to Vercel..."
    vercel --prod
    
    cd ..
}

# Prepare Chrome Extension
prepare_extension() {
    print_status "Preparing Chrome extension for distribution..."
    
    cd chromeextension
    
    # Check if manifest.json exists
    if [ ! -f "manifest.json" ]; then
        print_error "manifest.json not found in chromeextension directory"
        exit 1
    fi
    
    # Create a zip file for distribution
    print_status "Creating extension package..."
    zip -r ../pathos-extension.zip . -x "*.DS_Store" "*.git*"
    
    if [ $? -eq 0 ]; then
        print_status "Extension package created: pathos-extension.zip ✓"
    else
        print_error "Failed to create extension package"
        exit 1
    fi
    
    cd ..
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    # Check dependencies
    check_dependencies
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Prepare extension
    prepare_extension
    
    print_status "Deployment process completed!"
    print_status "Next steps:"
    print_status "1. Update the backend URL in chromeextension/manifest.json"
    print_status "2. Update the backend URL in frontend environment variables"
    print_status "3. Upload pathos-extension.zip to GitHub Releases"
    print_status "4. Share the extension with users"
}

# Run main function
main
