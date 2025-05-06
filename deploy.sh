#!/bin/bash

# Build the React app
echo "Building React app..."
npm run build

# Clear the public directory
echo "Clearing public directory..."
rm -rf public/*

# Copy build files to public
echo "Copying build files to public..."
cp -r build/* public/

# Deploy to Firebase
echo "Deploying to Firebase..."
firebase deploy

echo "Deployment complete!" 