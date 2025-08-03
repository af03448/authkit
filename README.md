# AuthKit - Production-Ready Authentication

<p align="center">
    <img src="https://github.com/workos/authkit/assets/896475/9fa7a91e-f5a8-4922-96fb-20a7b478d075" width="72" />
    <h1 align="center">AuthKit</h1>
    <p align="center">Production-ready authentication microservice powered by WorkOS</p>    
    <p align="center"><a href="https://workos.com/docs/user-management">Explore the docs ↗</a></strong></p>    
</p>

## 🚀 Quick Start

This is a production-ready authentication microservice with clean, professional URLs and enterprise-grade security features.

### Authentication Flow

- **`/`** - Landing page with sign-in
- **`/auth/signin`** - Redirects to WorkOS hosted UI
- **`/auth/callback`** - Handles OAuth return and creates session
- **`/auth/signout`** - Clears session and signs out
- **`/dashboard`** - Protected user dashboard

### API Endpoints

- **`/api/health`** - System health check
- **`/api/metrics`** - Performance metrics (requires authentication)

## 🔧 Setup

### 1. Prerequisites

- Node.js 18+
- [WorkOS account](https://dashboard.workos.com/signup)

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Generate JWT secret
openssl rand -base64 32
```

Edit `.env.local` with your WorkOS credentials:

```bash
WORKOS_CLIENT_ID=client_XXXXXXXXXX
WORKOS_API_KEY=sk_XXXXXXXXXX
JWT_SECRET_KEY=your_base64_encoded_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. WorkOS Dashboard Setup

1. Navigate to **Redirects** in your [WorkOS dashboard](https://dashboard.workos.com)
2. Add callback URL: `http://localhost:3000/auth/callback`

### 4. Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and click "Sign In" to test authentication!

## 🌐 Production Deployment

### Environment Variables

```bash
# Use production WorkOS credentials
WORKOS_CLIENT_ID=client_prod_XXXXXXXXXX
WORKOS_API_KEY=sk_prod_XXXXXXXXXX
JWT_SECRET_KEY=your_base64_encoded_secret_key_here

# Production configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
SECURE_HEADERS_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Deploy

```bash
npm run build
npm run start:production
```

### Register Production Callback

In WorkOS dashboard, add: `https://your-domain.com/auth/callback`

## 🔐 Security Features

✅ **JWT Session Management** - Secure, stateless sessions  
✅ **Rate Limiting** - Prevents abuse and brute force attacks  
✅ **Security Headers** - HSTS, CSP, X-Frame-Options protection  
✅ **Input Validation** - All inputs sanitized and validated  
✅ **Error Handling** - Production-safe error messages  
✅ **Audit Logging** - Comprehensive authentication logs  
✅ **Environment Validation** - Startup configuration checks  
✅ **Health Monitoring** - Built-in health check endpoints  

## 📊 Monitoring

- **Health Check**: `GET /api/health` - System status
- **Metrics**: `GET /api/metrics` - Performance data (authenticated)
- **Logs**: Structured logging with Winston
- **Error Tracking**: Comprehensive error handling

## 🛠️ Customization

### Add Protected Routes

Edit `src/middleware.ts`:

```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',        // Add your protected routes
    '/api/metrics',
  ],
};
```

### Custom Branding

- Edit `src/app/page.tsx` for landing page
- Edit `src/app/dashboard/page.tsx` for dashboard
- All styled with Tailwind CSS

## 📚 Documentation

- **`SIMPLIFIED_PRODUCTION_GUIDE.md`** - Quick setup guide
- **`PRODUCTION_GUIDE.md`** - Comprehensive deployment guide
- **`CLEAN_PRODUCTION_SUMMARY.md`** - Feature overview

## 🎯 Architecture

Built with:
- **Next.js 14** - React framework with App Router
- **WorkOS** - Enterprise authentication platform
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Winston** - Production logging
- **Zod** - Runtime validation

## 🚨 Support

- **WorkOS Issues**: [WorkOS Support](https://workos.com/support)
- **Application Issues**: Check logs and health endpoints

---

🎉 **Your authentication microservice is production-ready!**