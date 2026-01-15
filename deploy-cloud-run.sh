#!/bin/bash

# Configuration
PROJECT_ID="optical-habitat-478204-p3"
REGION="europe-west1"
SERVICE_NAME="homecareexperts-next"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# API URLs
REACT_APP_API_URL="https://homecareexperts-api-416311469862.europe-west1.run.app"
REACT_APP_API_GRAPHQL_URL="https://homecareexperts-api-416311469862.europe-west1.run.app/graphql"
REACT_APP_API_WS="wss://homecareexperts-api-416311469862.europe-west1.run.app"

echo "========================================================"
echo "Deploying $SERVICE_NAME to Google Cloud Run"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Image: $IMAGE_NAME"
echo "========================================================"

# 1. Configure Docker Auth
echo "Configuring Docker authentication..."
gcloud auth configure-docker

# 2. Build Docker Image
echo "Building Docker image..."
docker build \
  --platform linux/amd64 \
  --build-arg REACT_APP_API_URL=$REACT_APP_API_URL \
  --build-arg REACT_APP_API_GRAPHQL_URL=$REACT_APP_API_GRAPHQL_URL \
  --build-arg REACT_APP_API_WS=$REACT_APP_API_WS \
  -t $IMAGE_NAME .

# 2. Push Docker Image
echo "Pushing Docker image to Container Registry..."
docker push $IMAGE_NAME

# 3. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --timeout 300

echo "Deployment completed successfully!"
