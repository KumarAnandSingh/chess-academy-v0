# Dockerfile for Studyify Chess Academy Frontend
# Multi-stage build for production optimization

# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set production environment variables
ENV VITE_API_URL=https://www.studyify.in/api
ENV VITE_GA_MEASUREMENT_ID=G-TG7J1D38B6
ENV VITE_GA_DEBUG_MODE=false
ENV VITE_ENABLE_ANALYTICS=true
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage  
FROM nginx:alpine as production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add labels for container metadata
LABEL maintainer="Studyify Team"
LABEL description="Studyify Chess Academy Frontend"
LABEL version="1.0.0"

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]