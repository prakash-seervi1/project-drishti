  #!/bin/bash

  # Hardcoded project-specific values (match preDeploy.sh)
  GCP_PROJECT=project-drishti-mvp-31f1b
  REGION=us-central1
  ARTIFACT_REPO=crowd-agents-repo
  IMAGE_NAME=gcp-crowd-agents
  REDIS_SECRET_NAME=valkey-connection
  VPC_CONNECTOR=crowd-agents-connector
  # === Service account for Cloud Run (must match preDeploy.sh) ===
  SERVICE_ACCOUNT=268678901849-compute@developer.gserviceaccount.com

  set -e

  echo "Setting project: $GCP_PROJECT"
  gcloud config set project $GCP_PROJECT

  echo "Building Docker image..."
  docker build -t $REGION-docker.pkg.dev/$GCP_PROJECT/$ARTIFACT_REPO/$IMAGE_NAME:latest .

  echo "Authenticating Docker to Artifact Registry..."
  gcloud auth configure-docker $REGION-docker.pkg.dev

  echo "Pushing Docker image to Artifact Registry..."
  docker push $REGION-docker.pkg.dev/$GCP_PROJECT/$ARTIFACT_REPO/$IMAGE_NAME:latest

  echo "Deploying to Cloud Run with Secret Manager integration and VPC connector..."
  gcloud run deploy $IMAGE_NAME \
    --image $REGION-docker.pkg.dev/$GCP_PROJECT/$ARTIFACT_REPO/$IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-secrets REDIS_CONN=$REDIS_SECRET_NAME:latest \
    --set-env-vars SIGNING_SERVICE_ACCOUNT=$SERVICE_ACCOUNT \
    --vpc-connector $VPC_CONNECTOR \
    --vpc-egress all \
    --memory 1Gi \
    --timeout 300 \
    --service-account $SERVICE_ACCOUNT


  echo "Deployment complete!" 