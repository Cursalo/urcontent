# Content Weave Platform - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Content Weave platform to production environments. The platform supports multiple deployment strategies including Kubernetes, Docker Compose, and cloud-native services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Docker Compose Deployment](#docker-compose-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Database Setup](#database-setup)
7. [Security Configuration](#security-configuration)
8. [Monitoring Setup](#monitoring-setup)
9. [SSL/TLS Configuration](#ssltls-configuration)
10. [Performance Optimization](#performance-optimization)
11. [Backup and Recovery](#backup-and-recovery)
12. [Rollback Procedures](#rollback-procedures)
13. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **CPU**: Minimum 2 vCPUs, Recommended 4+ vCPUs
- **Memory**: Minimum 4GB RAM, Recommended 8GB+ RAM
- **Storage**: Minimum 20GB SSD, Recommended 50GB+ SSD
- **Network**: Stable internet connection with sufficient bandwidth

### Required Software
- **Docker**: 20.10.0 or later
- **Kubernetes**: 1.24.0 or later (for K8s deployment)
- **kubectl**: Latest version
- **Helm**: 3.8.0 or later (optional)
- **Git**: Latest version
- **Node.js**: 18.0.0 or later (for build process)

### Required Accounts & Services
- **Supabase Project**: Active project with PostgreSQL database
- **MercadoPago Account**: Business account with API credentials
- **Domain Name**: Registered domain with DNS control
- **SSL Certificate**: Valid SSL certificate for HTTPS
- **Container Registry**: Docker Hub, AWS ECR, or Google Container Registry

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/content-weave.git
cd content-weave
```

### 2. Environment Configuration
Create production environment files:

```bash
# Production environment
cp .env.example .env.production
```

#### Required Environment Variables

**Application Configuration:**
```bash
# App Settings
NODE_ENV=production
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
PORT=8080

# Supabase Configuration
VITE_SUPABASE_URL=https://xmtjzfnddkuxdertnriq.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MercadoPago Configuration (Client-side)
VITE_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key

# Domain Configuration  
VITE_APP_DOMAIN=https://contentweave.com
VITE_API_URL=https://api.contentweave.com
```

**Server-side Environment (Supabase Edge Functions):**
```bash
# MercadoPago Secrets (Server-side only)
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_CLIENT_SECRET=your_client_secret
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret

# Security Configuration
ALLOWED_ORIGINS=https://contentweave.com,https://www.contentweave.com
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
```

### 3. Build Application
```bash
# Install dependencies
npm ci --production

# Build for production
npm run build

# Verify build
ls -la dist/
```

## Kubernetes Deployment

### 1. Prepare Kubernetes Manifests

#### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: content-weave
  labels:
    name: content-weave
```

#### ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: content-weave-config
  namespace: content-weave
data:
  NODE_ENV: "production"
  PORT: "8080"
  VITE_SUPABASE_URL: "https://xmtjzfnddkuxdertnriq.supabase.co"
  VITE_APP_DOMAIN: "https://contentweave.com"
```

#### Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: content-weave-secrets
  namespace: content-weave
type: Opaque
data:
  VITE_SUPABASE_ANON_KEY: <base64_encoded_key>
  SUPABASE_SERVICE_ROLE_KEY: <base64_encoded_key>
  VITE_MERCADOPAGO_PUBLIC_KEY: <base64_encoded_key>
  JWT_SECRET: <base64_encoded_secret>
```

#### Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: content-weave
  namespace: content-weave
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: content-weave
  template:
    metadata:
      labels:
        app: content-weave
    spec:
      containers:
      - name: content-weave
        image: content-weave:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: content-weave-config
        - secretRef:
            name: content-weave-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply secrets (update with actual values first)
kubectl apply -f k8s/secrets.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get pods -n content-weave
kubectl get services -n content-weave
kubectl get ingress -n content-weave
```

### 3. Enable Auto-scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: content-weave-hpa
  namespace: content-weave
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: content-weave
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

```bash
# Apply HPA
kubectl apply -f k8s/hpa.yaml

# Verify auto-scaling
kubectl get hpa -n content-weave
```

## Docker Compose Deployment

### 1. Production Docker Compose File

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - redis
    networks:
      - content-weave

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
    depends_on:
      - app
    networks:
      - content-weave

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - content-weave

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped
    networks:
      - content-weave

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro
    restart: unless-stopped
    depends_on:
      - prometheus
    networks:
      - content-weave

volumes:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  content-weave:
    driver: bridge
```

### 2. Deploy with Docker Compose

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## Cloud Deployment

### AWS Deployment (ECS/Fargate)

#### 1. Build and Push to ECR
```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t content-weave .
docker tag content-weave:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/content-weave:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/content-weave:latest
```

#### 2. ECS Task Definition
```json
{
  "family": "content-weave",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "content-weave",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/content-weave:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "VITE_SUPABASE_ANON_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:content-weave/supabase-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/content-weave",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Google Cloud Platform (Cloud Run)

#### 1. Build and Push to Container Registry
```bash
# Configure gcloud
gcloud auth configure-docker

# Build and push
docker build -t gcr.io/<project-id>/content-weave .
docker push gcr.io/<project-id>/content-weave
```

#### 2. Deploy to Cloud Run
```bash
gcloud run deploy content-weave \
  --image gcr.io/<project-id>/content-weave \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-secrets VITE_SUPABASE_ANON_KEY=supabase-key:latest
```

## Database Setup

### 1. Supabase Production Setup

#### Database Migration
```sql
-- Run in Supabase SQL Editor
-- Create tables, indexes, RLS policies, functions
-- (Use the migration script from SETUP.md)

-- Verify critical indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';
```

#### Performance Optimization
```sql
-- Enable query plan caching
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Optimize connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW creator_performance_stats AS
SELECT 
    cp.id as creator_id,
    COUNT(c.id) as total_collaborations,
    AVG(r.rating) as average_rating,
    SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_collaborations
FROM creator_profiles cp
LEFT JOIN collaborations c ON cp.id = c.creator_id
LEFT JOIN reviews r ON c.id = r.collaboration_id
GROUP BY cp.id;

-- Refresh materialized views (setup cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY creator_performance_stats;
```

### 2. Database Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# backup.sh - Database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="content_weave"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/content_weave_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/content_weave_$DATE.sql

# Upload to cloud storage (AWS S3 example)
aws s3 cp $BACKUP_DIR/content_weave_$DATE.sql.gz s3://content-weave-backups/

# Keep only last 7 days of local backups
find $BACKUP_DIR -name "content_weave_*.sql.gz" -mtime +7 -delete

echo "Backup completed: content_weave_$DATE.sql.gz"
```

#### Setup Cron Job
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

## Security Configuration

### 1. SSL/TLS Setup

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d contentweave.com -d www.contentweave.com

# Verify auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Nginx SSL Configuration
```nginx
# nginx.prod.conf
server {
    listen 80;
    server_name contentweave.com www.contentweave.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name contentweave.com www.contentweave.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/contentweave.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/contentweave.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://xmtjzfnddkuxdertnriq.supabase.co wss://xmtjzfnddkuxdertnriq.supabase.co https://api.mercadopago.com;" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    location / {
        proxy_pass http://app:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    location /auth {
        proxy_pass http://app:8080;
        limit_req zone=auth burst=10 nodelay;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://app:8080;
    }
}
```

### 2. Environment Security

#### Secrets Management
```bash
# Use Kubernetes secrets
kubectl create secret generic content-weave-secrets \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY=your_key \
  --from-literal=MERCADOPAGO_ACCESS_TOKEN=your_token \
  --from-literal=JWT_SECRET=your_secret \
  -n content-weave

# Or use external secret management
# AWS Secrets Manager, HashiCorp Vault, etc.
```

#### Network Security
```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: content-weave-network-policy
  namespace: content-weave
spec:
  podSelector:
    matchLabels:
      app: content-weave
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443  # HTTPS
    - protocol: TCP
      port: 5432  # PostgreSQL
```

## Monitoring Setup

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'content-weave'
    static_configs:
      - targets: ['app:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 2. Grafana Dashboards

#### Application Dashboard
```json
{
  "dashboard": {
    "title": "Content Weave Application",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

### 3. Alerting Rules

```yaml
# alerts.yml
groups:
- name: content-weave
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: High response time
      description: "95th percentile response time is {{ $value }} seconds"

  - alert: DatabaseConnectionPool
    expr: db_connections_active / db_connections_max > 0.8
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: Database connection pool nearly exhausted

  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: Pod is crash looping
```

## Performance Optimization

### 1. CDN Configuration

#### CloudFlare Setup
```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    const cache = caches.default
    const cacheKey = new Request(url.toString(), request)
    
    let response = await cache.match(cacheKey)
    if (!response) {
      response = await fetch(request)
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=31536000')
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      })
      event.waitUntil(cache.put(cacheKey, response.clone()))
    }
    return response
  }
  
  return fetch(request)
}
```

### 2. Database Performance

#### Connection Pooling
```javascript
// supabase-pool.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
})

// Connection pooling configuration
export const pool = {
  max: 20,  // Maximum number of connections
  min: 2,   // Minimum number of connections
  acquire: 30000,  // Maximum time to get connection
  idle: 10000      // Maximum time connection can be idle
}
```

#### Query Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_collaborations_status_created 
  ON collaborations (status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_creator_profiles_specialties_gin 
  ON creator_profiles USING GIN (specialties);

CREATE INDEX CONCURRENTLY idx_reservations_user_date 
  ON reservations (user_id, scheduled_date);

-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM creator_profiles 
WHERE specialties @> ARRAY['beauty'] 
  AND instagram_followers >= 10000 
ORDER BY ur_score DESC 
LIMIT 20;
```

## Backup and Recovery

### 1. Automated Backup System

#### Database Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="content-weave-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Starting database backup..."
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://$S3_BUCKET/database/

# File system backup (if needed)
echo "Starting file system backup..."
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /app/uploads

# Upload files backup
aws s3 cp $BACKUP_DIR/files_backup_$DATE.tar.gz s3://$S3_BUCKET/files/

# Cleanup old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Cleanup old S3 backups
aws s3api list-objects-v2 --bucket $S3_BUCKET --prefix database/ \
  --query 'Contents[?LastModified<=`'$(date -d "$RETENTION_DAYS days ago" --iso-8601)'`].Key' \
  --output text | xargs -r -I {} aws s3 rm s3://$S3_BUCKET/{}

echo "Backup completed successfully"
```

### 2. Recovery Procedures

#### Database Recovery
```bash
#!/bin/bash
# scripts/restore.sh

# Download latest backup
aws s3 cp s3://content-weave-backups/database/db_backup_latest.sql.gz ./

# Decompress
gunzip db_backup_latest.sql.gz

# Create new database (if needed)
createdb content_weave_restored

# Restore database
psql content_weave_restored < db_backup_latest.sql

# Verify restoration
psql content_weave_restored -c "SELECT COUNT(*) FROM users;"

echo "Database restored successfully"
```

#### Application Recovery
```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "Usage: $0 <previous_version>"
    exit 1
fi

# Kubernetes rollback
kubectl rollout undo deployment/content-weave -n content-weave --to-revision=$PREVIOUS_VERSION

# Verify rollback
kubectl rollout status deployment/content-weave -n content-weave

# Update DNS if needed
# aws route53 change-resource-record-sets --hosted-zone-id Z123456789 --change-batch file://rollback-dns.json

echo "Rollback to version $PREVIOUS_VERSION completed"
```

## Rollback Procedures

### 1. Application Rollback

#### Kubernetes Rollback
```bash
# Check rollout history
kubectl rollout history deployment/content-weave -n content-weave

# Rollback to previous version
kubectl rollout undo deployment/content-weave -n content-weave

# Rollback to specific revision
kubectl rollout undo deployment/content-weave -n content-weave --to-revision=2

# Monitor rollback progress
kubectl rollout status deployment/content-weave -n content-weave
```

#### Docker Compose Rollback
```bash
# Tag current version as backup
docker tag content-weave:latest content-weave:backup

# Pull previous version
docker pull content-weave:v1.0.0
docker tag content-weave:v1.0.0 content-weave:latest

# Restart services
docker-compose -f docker-compose.prod.yml up -d app
```

### 2. Database Rollback

#### Schema Rollback
```sql
-- Create rollback script
-- rollback.sql

BEGIN;

-- Drop new columns/tables
ALTER TABLE creator_profiles DROP COLUMN IF EXISTS new_feature_column;
DROP TABLE IF EXISTS new_feature_table;

-- Restore old constraints
ALTER TABLE collaborations ADD CONSTRAINT old_constraint_name CHECK (condition);

-- Verify rollback
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'creator_profiles' AND column_name = 'new_feature_column';

COMMIT;
```

## Troubleshooting

### 1. Common Issues

#### Application Won't Start
```bash
# Check logs
kubectl logs -f deployment/content-weave -n content-weave

# Common issues:
# - Environment variables missing
# - Database connection failed
# - Port already in use
# - Insufficient resources

# Debug steps:
kubectl describe pod <pod-name> -n content-weave
kubectl get events -n content-weave --sort-by='.lastTimestamp'
```

#### Database Connection Issues
```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Check connection limits
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Verify RLS policies
psql $DATABASE_URL -c "SELECT * FROM pg_policies WHERE tablename = 'users';"
```

#### SSL Certificate Issues
```bash
# Check certificate status
openssl x509 -in /etc/letsencrypt/live/contentweave.com/fullchain.pem -text -noout

# Test SSL configuration
openssl s_client -connect contentweave.com:443 -servername contentweave.com

# Check certificate expiration
echo | openssl s_client -servername contentweave.com -connect contentweave.com:443 2>/dev/null | openssl x509 -noout -dates
```

### 2. Performance Issues

#### High Memory Usage
```bash
# Check memory usage
kubectl top pods -n content-weave

# Analyze memory leaks
kubectl exec -it <pod-name> -n content-weave -- top
kubectl exec -it <pod-name> -n content-weave -- cat /proc/meminfo
```

#### Database Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'creator_profiles';
```

### 3. Monitoring and Alerts

#### Health Check Endpoints
```javascript
// health.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION,
    uptime: process.uptime()
  })
})

app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await supabase.from('users').select('count').limit(1)
    
    res.status(200).json({
      status: 'ready',
      checks: {
        database: 'ok'
      }
    })
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    })
  }
})
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations completed
- [ ] Backup system verified
- [ ] Monitoring configured
- [ ] Security headers set
- [ ] CDN configured
- [ ] DNS records updated

### Deployment
- [ ] Application built successfully
- [ ] Container image pushed
- [ ] Kubernetes manifests applied
- [ ] Services healthy
- [ ] Ingress configured
- [ ] Auto-scaling enabled
- [ ] Monitoring active

### Post-deployment
- [ ] Health checks passing
- [ ] SSL certificate valid
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User authentication working
- [ ] Payment processing functional
- [ ] Backup system operational
- [ ] Alerts configured

## Support and Maintenance

### Regular Maintenance Tasks
- **Daily**: Check application health and error rates
- **Weekly**: Review performance metrics and optimization opportunities
- **Monthly**: Security updates and dependency maintenance
- **Quarterly**: Disaster recovery testing and backup verification

### Support Contacts
- **DevOps Team**: devops@contentweave.com
- **On-call Engineer**: +1-XXX-XXX-XXXX
- **Infrastructure Provider**: [Provider Support]
- **Security Team**: security@contentweave.com

---

**Content Weave Deployment Guide** - Ensuring reliable, secure, and scalable production deployments.