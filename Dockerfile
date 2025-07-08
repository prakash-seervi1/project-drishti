# ---------- 1. Build Stage ----------
    FROM node:18-alpine AS builder
    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy the source code
    COPY . .
    
    # Build the Vite project
    RUN npm run build
    
    # ---------- 2. Production Stage ----------
    FROM nginx:alpine
    
    # Set the PORT env variable to match Cloud Run
    ENV PORT=8080
    
    # Remove default nginx config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Copy custom nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy the built app from builder stage
    COPY --from=builder /app/dist /usr/share/nginx/html
    