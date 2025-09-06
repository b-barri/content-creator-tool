#!/bin/bash

# Production Deployment Script for HD Quality Upgrade
# This script deploys your app with HD quality thumbnail generation

echo "🚀 Deploying HD Quality Upgrade to Production..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set in environment"
    echo "   Make sure to set it in Vercel dashboard after deployment"
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 HD Quality Upgrade Deployed!"
    echo "================================"
    echo ""
    echo "📊 What's New in Production:"
    echo "   • DALL-E 3 HD Quality (2x better images)"
    echo "   • Enhanced photorealism prompts"
    echo "   • Professional photography terms"
    echo "   • 4K quality details"
    echo "   • Better text rendering"
    echo ""
    echo "💰 Cost Impact:"
    echo "   • ~$0.08 per image (vs $0.04 standard)"
    echo "   • 2x cost increase for better quality"
    echo ""
    echo "🔍 Next Steps:"
    echo "   1. Test the production deployment"
    echo "   2. Monitor OpenAI usage dashboard"
    echo "   3. Check user feedback on quality"
    echo "   4. Consider Gemini integration (Phase 2)"
    echo ""
    echo "🧪 Test your deployment:"
    echo "   node test-production-hd.js"
    echo ""
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
