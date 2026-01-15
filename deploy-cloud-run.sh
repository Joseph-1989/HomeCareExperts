#!/bin/bash

# Configuration
PROJECT_ID="optical-habitat-478204-p3"
REGION="europe-west1"
SERVICE_NAME="homecareexperts-api"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
ENV_FILE=".env"

echo "========================================================"
echo "Deploying $SERVICE_NAME to Google Cloud Run"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Image: $IMAGE_NAME"
echo "========================================================"

# 0. Load Environment Variables
if [ -f "$ENV_FILE" ]; then
  echo "Loading environment variables from $ENV_FILE..."
  export $(grep -v '^#' $ENV_FILE | xargs)
else
  echo "Error: $ENV_FILE not found!"
  exit 1
fi

# Verify required variables
if [ -z "$MONGO_PROD" ] || [ -z "$SECRET_TOKEN" ] || [ -z "$GCS_BUCKET_NAME" ]; then
  echo "Error: Missing required environment variables (MONGO_PROD, SECRET_TOKEN, GCS_BUCKET_NAME)"
  exit 1
fi

# 1. Configure Docker Auth
echo "Configuring Docker authentication..."
gcloud auth configure-docker

# 2. Build Docker Image
echo "Building Docker image..."
# Using the root Dockerfile, targeting the api app
docker build \
  --platform linux/amd64 \
  -t $IMAGE_NAME .

# 3. Push Docker Image
echo "Pushing Docker image to Container Registry..."
docker push $IMAGE_NAME

# 4. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --timeout 300 \
  --set-env-vars MONGO_PROD="$MONGO_PROD" \
  --set-env-vars SECRET_TOKEN="$SECRET_TOKEN" \
  --set-env-vars GCS_BUCKET_NAME="$GCS_BUCKET_NAME"

echo "Deployment completed successfully!"
