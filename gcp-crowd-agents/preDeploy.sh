#!/bin/bash

# Hardcoded project-specific values
GCP_PROJECT=project-drishti-mvp-31f1b
REGION=us-central1
GEMINI_MODEL=gemini-2.5-pro
VERTEX_VISION_MODEL=image-to-text
GCS_BUCKET_NAME=project-drishti-central1-bucket
VALKEY_INSTANCE=crowd-agents-valkey
ARTIFACT_REPO=crowd-agents-repo
VALKEY_SIZE=1 # 1GB
# NOTE: As of June 2024, Memorystore supports only Redis, not Valkey. Use redis_7_2.
REDIS_VERSION=redis_7_2

set -e

echo "Setting project: $GCP_PROJECT"
gcloud config set project $GCP_PROJECT

echo "Enabling required APIs..."
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com

echo "Creating Artifact Registry repo..."
gcloud artifacts repositories create $ARTIFACT_REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repo for crowd agents" || echo "Repo may already exist."

echo "Creating Redis (Memorystore) instance..."
gcloud redis instances create $VALKEY_INSTANCE \
  --region=$REGION \
  --zone=${REGION}-a \
  --tier=basic \
  --size=$VALKEY_SIZE \
  --redis-version=$REDIS_VERSION \
  --network=default || echo "Redis instance may already exist."

echo "Fetching Redis connection info..."
VALKEY_HOST=$(gcloud redis instances describe $VALKEY_INSTANCE --region=$REGION --format='value(host)')
VALKEY_PORT=$(gcloud redis instances describe $VALKEY_INSTANCE --region=$REGION --format='value(port)')

REDIS_SECRET_NAME=valkey-connection
SECRET_PAYLOAD=$(jq -n --arg host "$VALKEY_HOST" --arg port "$VALKEY_PORT" '{host: $host, port: $port}')

echo "Creating Secret Manager secret for Redis connection..."
echo -n "$SECRET_PAYLOAD" | \
  gcloud secrets create $REDIS_SECRET_NAME --data-file=- || \
  gcloud secrets versions add $REDIS_SECRET_NAME --data-file=-

echo "---------------------------------------------"
echo "Redis Host: $VALKEY_HOST"
echo "Redis Port: $VALKEY_PORT"
echo "Redis Secret Name: $REDIS_SECRET_NAME"
echo "Artifact Registry Repo: $ARTIFACT_REPO"
echo "GCP Project: $GCP_PROJECT"
echo "Region: $REGION"
echo "Gemini Model: $GEMINI_MODEL"
echo "Vertex Vision Model: $VERTEX_VISION_MODEL"
echo "GCS Bucket: $GCS_BUCKET_NAME"
echo "---------------------------------------------"
echo "You can now build and deploy your Docker image, and configure Cloud Run to use the Redis secret."
echo "For Cloud Run, you can mount the secret as an env var or file." 

# === CONFIGURE THESE VARIABLES ===
PROJECT_ID="your-gcp-project-id"
SERVICE_ACCOUNT="268678901849-compute@developer.gserviceaccount.com"

# Enable IAM Credentials API
echo "Enabling IAM Credentials API..."
gcloud services enable iamcredentials.googleapis.com --project $PROJECT_ID

# Grant Service Account Token Creator role to the service account on itself
echo "Granting Token Creator role to $SERVICE_ACCOUNT on itself..."
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project $PROJECT_ID

echo "Pre-deploy IAM setup complete." 