#!/bin/bash
# Script to run the MCP server locally for development
# Make sure you have the correct Python environment and dependencies installed
# and the GOOGLE_APPLICATION_CREDENTIALS environment variable set.

# Set your service account credentials (edit this path as needed)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account.json"

# (Optional) Activate your Python virtual environment
# source venv/bin/activate

# Run the MCP server (edit the command as needed for your setup)
# If you have a Python entry point:
# python mcp_server.py
# Or if you use Docker:
# docker build -t local-mcp .
# docker run -p 8080:8080 -e GOOGLE_APPLICATION_CREDENTIALS -v $GOOGLE_APPLICATION_CREDENTIALS:$GOOGLE_APPLICATION_CREDENTIALS local-mcp

echo "Starting MCP server..."
# Example: If your MCP server is a FastAPI app in utils/mcp_server.py
uvicorn utils.mcp_server:app --host 0.0.0.0 --port 8080 --reload 