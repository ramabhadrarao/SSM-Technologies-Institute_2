#!/bin/bash

# SSM Technologies Frontend Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
BUILD_DIR="dist"
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run linting
echo "🔍 Running code quality checks..."
npm run lint

# Create backup of existing build (if exists)
if [ -d "$BUILD_DIR" ]; then
    echo "💾 Creating backup of existing build..."
    mv "$BUILD_DIR" "$BACKUP_DIR"
fi

# Build for production
echo "🏗️  Building application for $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build:prod
elif [ "$ENVIRONMENT" = "staging" ]; then
    npm run build:staging
else
    npm run build
fi

# Verify build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build failed! Restoring backup..."
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$BUILD_DIR"
    fi
    exit 1
fi

echo "✅ Build completed successfully!"

# Optional: Copy to web server directory
# Uncomment and modify the path below for your server setup
# WEB_ROOT="/var/www/html/ssm-technologies"
# if [ -d "$WEB_ROOT" ]; then
#     echo "📁 Copying files to web server..."
#     sudo cp -r $BUILD_DIR/* $WEB_ROOT/
#     sudo chown -R www-data:www-data $WEB_ROOT
#     echo "✅ Files copied to $WEB_ROOT"
# fi

# Clean up old backup (keep only last 5)
echo "🧹 Cleaning up old backups..."
ls -t backup_* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

echo "🎉 Deployment completed successfully!"
echo "📁 Build files are in: $BUILD_DIR"
echo "💡 To serve locally, run: npm run preview:prod"