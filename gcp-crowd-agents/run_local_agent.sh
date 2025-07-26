#!/bin/bash
# Script to run the gcp-crowd-agents FastAPI app locally for development
# Make sure you have the correct Python environment and dependencies installed
# and the GOOGLE_APPLICATION_CREDENTIALS environment variable set.

# Set your service account credentials (edit this path as needed)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account.json"

# (Optional) Activate your Python virtual environment
# source venv/bin/activate

# (Optional) Ensure MCP server is running (edit port if needed)
# You can run ./run_local_mcp.sh in another terminal

# Run the FastAPI app (main.py)
echo "Starting gcp-crowd-agents FastAPI app..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload 