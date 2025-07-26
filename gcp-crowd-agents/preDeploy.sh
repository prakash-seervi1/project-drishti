#!/bin/bash

# Usage: ./preDeploy.sh [all|redis|mysql]
MODE=${1:-all}

if [[ "$MODE" != "all" && "$MODE" != "redis" && "$MODE" != "mysql" ]]; then
  echo "Usage: $0 [all|redis|mysql]"
  exit 1
fi

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
  secretmanager.googleapis.com \
  sqladmin.googleapis.com

echo "Creating Artifact Registry repo..."
gcloud artifacts repositories create $ARTIFACT_REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repo for crowd agents" || echo "Repo may already exist."

# if [[ "$MODE" == "all" || "$MODE" == "redis" ]]; then
#   echo "Creating Redis (Memorystore) instance..."
#   gcloud redis instances create $VALKEY_INSTANCE \
#     --region=$REGION \
#     --zone=${REGION}-a \
#     --tier=basic \
#     --size=$VALKEY_SIZE \
#     --redis-version=$REDIS_VERSION \
#     --network=default || echo "Redis instance may already exist."

#   echo "Fetching Redis connection info..."
#   VALKEY_HOST=$(gcloud redis instances describe $VALKEY_INSTANCE --region=$REGION --format='value(host)')
#   VALKEY_PORT=$(gcloud redis instances describe $VALKEY_INSTANCE --region=$REGION --format='value(port)')

#   REDIS_SECRET_NAME=valkey-connection
#   SECRET_PAYLOAD=$(jq -n --arg host "$VALKEY_HOST" --arg port "$VALKEY_PORT" '{host: $host, port: $port}')

#   echo "Creating Secret Manager secret for Redis connection..."
#   echo -n "$SECRET_PAYLOAD" | \
#     gcloud secrets create $REDIS_SECRET_NAME --data-file=- || \
#     gcloud secrets versions add $REDIS_SECRET_NAME --data-file=-

#   echo "---------------------------------------------"
#   echo "Redis Host: $VALKEY_HOST"
#   echo "Redis Port: $VALKEY_PORT"
#   echo "Redis Secret Name: $REDIS_SECRET_NAME"
#   echo "Artifact Registry Repo: $ARTIFACT_REPO"
#   echo "GCP Project: $GCP_PROJECT"
#   echo "Region: $REGION"
#   echo "Gemini Model: $GEMINI_MODEL"
#   echo "Vertex Vision Model: $VERTEX_VISION_MODEL"
#   echo "GCS Bucket: $GCS_BUCKET_NAME"
#   echo "---------------------------------------------"
#   echo "You can now build and deploy your Docker image, and configure Cloud Run to use the Redis secret."
#   echo "For Cloud Run, you can mount the secret as an env var or file."
# fi

# if [[ "$MODE" == "all" || "$MODE" == "mysql" ]]; then
  echo "Enabling Cloud SQL Admin API..."
  gcloud services enable sqladmin.googleapis.com

  CLOUDSQL_INSTANCE=crowd-agents-mysql
  CLOUDSQL_DB=crowd_agents_db
  CLOUDSQL_USER=crowd_user
  CLOUDSQL_PASSWORD="$(openssl rand -base64 16)" # Generate a strong random password
  CLOUDSQL_SECRET_NAME=cloudsql-connection

  # Create Cloud SQL instance (MySQL)
#   echo "Creating Cloud SQL (MySQL) instance..."
#   gcloud sql instances create $CLOUDSQL_INSTANCE \
#     --database-version=MYSQL_8_0 \
#     --tier=db-f1-micro \
#     --region=$REGION || echo "Cloud SQL instance may already exist."

#   echo "Creating database..."
#   gcloud sql databases create $CLOUDSQL_DB --instance=$CLOUDSQL_INSTANCE || echo "Database may already exist."

#   echo "Creating user..."
#   gcloud sql users create $CLOUDSQL_USER --instance=$CLOUDSQL_INSTANCE --password=$CLOUDSQL_PASSWORD || echo "User may already exist."

#   echo "Fetching Cloud SQL connection info..."
#   CLOUDSQL_CONNECTION_NAME=$(gcloud sql instances describe $CLOUDSQL_INSTANCE --format='value(connectionName)')

#   # Store Cloud SQL credentials in Secret Manager
#   CLOUDSQL_SECRET_PAYLOAD=$(jq -n --arg user "$CLOUDSQL_USER" --arg password "$CLOUDSQL_PASSWORD" --arg db "$CLOUDSQL_DB" --arg connection "$CLOUDSQL_CONNECTION_NAME" '{user: $user, password: $password, db: $db, connection: $connection}')

#   echo "Creating Secret Manager secret for Cloud SQL connection..."
#   echo -n "$CLOUDSQL_SECRET_PAYLOAD" | \
#     gcloud secrets create $CLOUDSQL_SECRET_NAME --data-file=- || \
#     gcloud secrets versions add $CLOUDSQL_SECRET_NAME --data-file=-

#   echo "---------------------------------------------"
#   echo "Cloud SQL Instance: $CLOUDSQL_INSTANCE"
#   echo "Cloud SQL DB: $CLOUDSQL_DB"
#   echo "Cloud SQL User: $CLOUDSQL_USER"
#   echo "Cloud SQL Password: (stored in Secret Manager: $CLOUDSQL_SECRET_NAME)"
#   echo "Cloud SQL Connection Name: $CLOUDSQL_CONNECTION_NAME"
#   echo "Cloud SQL Secret Name: $CLOUDSQL_SECRET_NAME"
#   echo "---------------------------------------------"
#   echo "To connect from Cloud Run, mount the secret and construct the SQLAlchemy URL as:"
#   echo "mysql+pymysql://<user>:<password>@/cloudsql/$CLOUDSQL_CONNECTION_NAME/$CLOUDSQL_DB"
#   echo "(Replace <user> and <password> with values from the secret)"
# fi

# === CONFIGURE THESE VARIABLES ===
PROJECT_ID="project-drishti-mvp-31f1b"
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