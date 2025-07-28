# Multi-stage Docker build for Content Weave
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Set build environment
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_MERCADOPAGO_PUBLIC_KEY
ARG VITE_APP_URL
ARG VITE_APP_NAME

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_MERCADOPAGO_PUBLIC_KEY=$VITE_MERCADOPAGO_PUBLIC_KEY
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install Node.js for health checks
RUN apk add --no-cache nodejs npm

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy health check script
COPY healthcheck.js /usr/local/bin/healthcheck.js
RUN chmod +x /usr/local/bin/healthcheck.js

# Create log directories with proper permissions
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown -R appuser:appgroup /var/log/nginx /var/cache/nginx /var/run && \
    chmod -R 755 /var/log/nginx

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node /usr/local/bin/healthcheck.js

# Start nginx
CMD ["nginx", "-g", "daemon off;"]