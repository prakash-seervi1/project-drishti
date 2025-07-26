FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Create /cloudsql folder for Unix socket & allow mount
RUN mkdir -p /cloudsql
VOLUME /cloudsql

# Install system dependencies
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port for FastAPI
EXPOSE 8080

# Start FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]