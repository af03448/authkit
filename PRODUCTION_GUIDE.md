# Production Deployment Guide

This guide provides comprehensive instructions for deploying the AuthKit microservice to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Security Checklist](#security-checklist)
4. [Deployment Steps](#deployment-steps)
5. [Monitoring & Observability](#monitoring--observability)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ 
- Yarn or npm
- WorkOS account with production credentials
- SSL certificate for HTTPS
- Production domain configured

## Environment Configuration

1. Copy `.env.example` to `.env.production`:
   ```bash
   cp .env.example .env.production
   ```

2. Configure all required environment variables:

### Required Variables

```bash
# WorkOS Configuration
WORKOS_CLIENT_ID=client_XXXXXXXXXX
WORKOS_API_KEY=sk_prod_XXXXXXXXXX

# JWT Configuration - Generate a secure base64 key:
# openssl rand -base64 32
JWT_SECRET_KEY=your_base64_encoded_secret_key_here

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security Headers
SECURE_HEADERS_ENABLED=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Session Configuration
SESSION_COOKIE_NAME=authkit_session
SESSION_COOKIE_MAX_AGE=86400
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=lax
```

### Optional Variables

```bash
# SSO Configuration (if using SSO)
SSO_ENABLED_ORGANIZATION_ID=org_XXXXXXXXXX

# CORS Configuration (comma-separated origins)
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://app.your-domain.com

# Logging
LOG_LEVEL=info
```

## Security Checklist

Before deploying to production, ensure:

- [ ] All environment variables are properly set
- [ ] JWT_SECRET_KEY is a strong, randomly generated key
- [ ] HTTPS is enforced (SSL certificate installed)
- [ ] Security headers are enabled (`SECURE_HEADERS_ENABLED=true`)
- [ ] Rate limiting is configured appropriately
- [ ] WorkOS production API keys are used (not development keys)
- [ ] All callback URLs are registered in WorkOS dashboard
- [ ] Content Security Policy (CSP) is properly configured
- [ ] Dependencies are up to date (`yarn audit` shows no vulnerabilities)

## Deployment Steps

### 1. Install Dependencies

```bash
yarn install --production
```

### 2. Build the Application

```bash
yarn build
```

### 3. Run Database Migrations (if applicable)

If you're using a database for session storage:

```bash
yarn migrate:production
```

### 4. Start the Application

```bash
yarn start
```

For process management, use PM2:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "authkit" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Configure Nginx (recommended)

Example Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Observability

### Health Check

The application provides health check endpoints:

- `GET /api/health` - Basic health check
- `GET /api/metrics` - Detailed metrics (requires authentication)

### Logging

- Logs are written to console and files (in production)
- Error logs: `error.log`
- Combined logs: `combined.log`

### Monitoring Recommendations

1. **Uptime Monitoring**: Use services like Pingdom, UptimeRobot
2. **Application Monitoring**: Use services like New Relic, DataDog
3. **Error Tracking**: Use services like Sentry, Rollbar

### Key Metrics to Monitor

- Response times
- Error rates
- Authentication success/failure rates
- Rate limit hits
- Memory usage
- CPU usage

## Troubleshooting

### Common Issues

1. **"JWT_SECRET_KEY is not set" error**
   - Ensure the environment variable is set
   - Check that it's base64 encoded

2. **WorkOS authentication failures**
   - Verify API keys are correct
   - Check that callback URLs are registered in WorkOS
   - Ensure you're using production keys

3. **Rate limiting issues**
   - Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`
   - Consider implementing distributed rate limiting for multiple instances

4. **Session issues**
   - Verify cookie settings match your domain setup
   - Check `SESSION_COOKIE_SECURE` is true for HTTPS

### Debug Mode

For troubleshooting, you can temporarily enable debug logging:

```bash
LOG_LEVEL=debug NODE_ENV=production yarn start
```

⚠️ **Warning**: Only use debug mode temporarily as it may log sensitive information.

## Scaling Considerations

1. **Horizontal Scaling**: The application is stateless (except for in-memory rate limiting)
2. **Session Storage**: For multiple instances, consider using Redis for session storage
3. **Rate Limiting**: For multiple instances, implement distributed rate limiting with Redis
4. **Load Balancing**: Use a load balancer with sticky sessions if needed

## Security Updates

Regularly update dependencies:

```bash
# Check for vulnerabilities
yarn audit

# Update dependencies
yarn upgrade-interactive

# Update to latest security patches
yarn upgrade --latest
```

## Support

For WorkOS-specific issues: https://workos.com/support
For application issues: Check the logs and health endpoints first