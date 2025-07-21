#!/bin/bash

# Hardcoded project-specific values (match preDeploy.sh)
GCP_PROJECT=project-drishti-mvp-31f1b
REGION=us-central1
VALKEY_INSTANCE=crowd-agents-valkey
ARTIFACT_REPO=crowd-agents-repo
REDIS_SECRET_NAME=valkey-connection

set -e

echo "Setting project: $GCP_PROJECT"
gcloud config set project $GCP_PROJECT

echo "Deleting Valkey (Memorystore) instance..."
gcloud redis instances delete $VALKEY_INSTANCE --region=$REGION --quiet || echo "Valkey instance may already be deleted."

echo "Deleting Artifact Registry repo..."
gcloud artifacts repositories delete $ARTIFACT_REPO --location=$REGION --quiet || echo "Repo may already be deleted."

echo "Deleting Secret Manager secret..."
gcloud secrets delete $REDIS_SECRET_NAME --quiet || echo "Secret may already be deleted."

echo "Teardown complete." 