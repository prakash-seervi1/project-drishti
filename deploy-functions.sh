#!/bin/bash

# Firebase Functions Deployment Script for Drishti Project
# This script deploys the database setup functions to GCP

echo "🚀 Starting Firebase Functions Deployment..."

# Check if we're in the right directory
if [ ! -f "firebase_modal/package.json" ]; then
    echo "❌ Error: functions/package.json not found. Make sure you're in the project root."
    exit 1
fi

# Install dependencies in functions directory
echo "📦 Installing function dependencies..."
cd functions
npm install

# Deploy the functions
echo "🚀 Deploying Firebase Functions..."
firebase deploy --only functions

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Functions deployed successfully!"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Call the setup function to create your database:"
    echo "   curl -X POST https://us-central1-project-drishti-mvp-31f1b.cloudfunctions.net/setupDatabase"
    echo ""
    echo "2. Or visit the function URL in your browser:"
    echo "   https://us-central1-project-drishti-mvp-31f1b.cloudfunctions.net/setupDatabase"
    echo ""
    echo "3. To reset the database (optional):"
    echo "   curl -X POST https://us-central1-project-drishti-mvp-31f1b.cloudfunctions.net/resetDatabase"
    echo ""
    echo "🔗 Replace YOUR_REGION and YOUR_PROJECT_ID with your actual values"
else
    echo "❌ Function deployment failed!"
    exit 1
fi

cd .. 