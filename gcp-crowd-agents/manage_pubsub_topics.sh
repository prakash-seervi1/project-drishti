#!/bin/bash

# Set your GCP project ID
PROJECT_ID="project-drishti-mvp-31f1b"

# List of topics to manage
TOPICS=(
  "media-uploads"
  "incident-events"
  "zone-updates"
  "responder-commands"
  "alerts"
  "ai-analysis"
  "crowd-analytics"
  "tts-requests"
  "emergency-contacts"
  "system-logs"
)

create_topics() {
  for topic in "${TOPICS[@]}"; do
    echo "Creating topic: $topic"
    gcloud pubsub topics create "$topic" --project="$PROJECT_ID" || echo "Topic $topic may already exist."
  done
}

delete_topics() {
  for topic in "${TOPICS[@]}"; do
    echo "Deleting topic: $topic"
    gcloud pubsub topics delete "$topic" --project="$PROJECT_ID" || echo "Topic $topic may not exist."
  done
}

case "$1" in
  create)
    create_topics
    ;;
  cleanup|delete)
    delete_topics
    ;;
  *)
    echo "Usage: $0 {create|cleanup}"
    ;;
esac 