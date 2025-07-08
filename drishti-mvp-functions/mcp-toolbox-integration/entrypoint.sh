#!/bin/sh
set -e
echo "Starting toolbox on address 0.0.0.0 and port ${PORT:-8080}..."
exec toolbox serve --tools-file /app/drishti-tools.yaml --address 0.0.0.0 --port ${PORT:-8080}