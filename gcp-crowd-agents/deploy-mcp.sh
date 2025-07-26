#!/bin/bash

# ===== Project-specific configuration =====
GCP_PROJECT=project-drishti-mvp-31f1b
REGION=us-central1
ARTIFACT_REPO=crowd-agents-repo
IMAGE_NAME=gcp-crowd-agents-mcp
MYSQL_SECRET_NAME=cloudsql-connection
VPC_CONNECTOR=crowd-agents-connector
SERVICE_ACCOUNT=268678901849-compute@developer.gserviceaccount.com
DOCKERFILE_NAME=Dockerfile.mcp

# ===== Fail on error =====
set -e

echo "🔧 Setting active project: $GCP_PROJECT"
gcloud config set project $GCP_PROJECT

echo "🐳 Building Docker image with $DOCKERFILE_NAME..."
docker build -f $DOCKERFILE_NAME -t $REGION-docker.pkg.dev/$GCP_PROJECT/$ARTIFACT_REPO/$IMAGE_NAME:latest .

echo "🔑 Authenticating Docker to Artifact Registry..."
gcloud auth configure-docker $REGION-docker.pkg.dev

echo "📦 Pushing Docker image to Artifact Registry..."
docker push $REGION-docker.pkg.dev/$GCP_PROJECT/$ARTIFACT_REPO/$IMAGE_NAME:latest

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $IMAGE_NAME \
  --image $REGION-docker.pkg.dev/$GCP_PROJECT/$ARTIFACT_REPO/$IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-secrets MYSQL_CONN=$MYSQL_SECRET_NAME:latest \
  --set-env-vars SIGNING_SERVICE_ACCOUNT=$SERVICE_ACCOUNT \
  --add-cloudsql-instances=$GCP_PROJECT:$REGION:crowd-agents-mysql \
  --set-env-vars INSTANCE_CONNECTION_NAME=$GCP_PROJECT:$REGION:crowd-agents-mysql \
  --vpc-connector $VPC_CONNECTOR \
  --vpc-egress all \
  --memory 1Gi \
  --timeout 300 \
  --service-account $SERVICE_ACCOUNT

echo "✅ Deployment complete!"
