# 1️⃣ Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the full source code and build
COPY . .
RUN npm run build

# 2️⃣ Production Stage - NGINX Server
FROM nginx:alpine
# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Add your custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html
