# Simplified Production AuthKit - Quick Start Guide

## 🎉 Your Production-Ready Authentication Routes

Your AuthKit now has clean, professional URLs:

### Authentication Flow
- **Home Page**: `/` - Landing page with sign-in button
- **Sign In**: `/auth/signin` - Redirects to WorkOS hosted UI
- **Callback**: `/auth/callback` - Handles OAuth return and creates session
- **Sign Out**: `/auth/signout` - Clears session and redirects
- **Dashboard**: `/dashboard` - Protected user dashboard
- **Error Page**: `/auth/error` - Handles authentication errors

### API Endpoints
- **Health Check**: `/api/health` - System health status
- **Metrics**: `/api/metrics` - Performance metrics (requires authentication)

## 🚀 Quick Setup (5 minutes)

### 1. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env.local

# Generate a secure JWT secret
openssl rand -base64 32
```

Edit `.env.local`:
```bash
# WorkOS Configuration
WORKOS_CLIENT_ID=client_XXXXXXXXXX
WORKOS_API_KEY=sk_XXXXXXXXXX

# JWT Configuration (use the generated secret above)
JWT_SECRET_KEY=your_base64_encoded_secret_key_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. WorkOS Dashboard Setup
1. Go to your [WorkOS Dashboard](https://dashboard.workos.com)
2. Navigate to **Redirects**
3. Add these callback URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### 3. Start the Application
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and click "Sign In" to test!

## 🌐 Production Deployment

### Environment Variables for Production
```bash
# WorkOS Configuration (use production keys)
WORKOS_CLIENT_ID=client_prod_XXXXXXXXXX
WORKOS_API_KEY=sk_prod_XXXXXXXXXX

# JWT Configuration
JWT_SECRET_KEY=your_base64_encoded_secret_key_here

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security (all enabled by default)
SECURE_HEADERS_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Build and Deploy
```bash
npm run build
npm run start:production
```

### Health Check
```bash
curl https://your-domain.com/api/health
```

## 🔐 Security Features Included

✅ **JWT Session Management** - Secure, stateless sessions  
✅ **Rate Limiting** - Prevents abuse and brute force attacks  
✅ **Security Headers** - HSTS, CSP, X-Frame-Options, etc.  
✅ **Input Validation** - All inputs sanitized and validated  
✅ **Error Handling** - Production-safe error messages  
✅ **Logging** - Comprehensive audit trail  
✅ **Environment Validation** - Startup checks for configuration  
✅ **Health Monitoring** - Built-in health check endpoints  

## 📋 User Journey

1. **User visits** `/` (homepage)
2. **Clicks "Sign In"** → redirected to `/auth/signin`
3. **Redirected to WorkOS** hosted authentication UI
4. **After authentication** → returned to `/auth/callback`
5. **Session created** → redirected to `/dashboard`
6. **Protected content** accessible with valid session
7. **Sign out** → `/auth/signout` → session cleared

## 🛠️ Customization

### Change Default Redirect
Edit `src/app/auth/signin/route.ts`:
```typescript
const returnPathname = request.nextUrl.searchParams.get('returnTo') || '/your-page';
```

### Custom Dashboard
Edit `src/app/dashboard/page.tsx` to match your application needs.

### Add Protected Routes
Add new paths to `src/middleware.ts`:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',  // Add your protected routes here
    '/api/metrics',
  ],
};
```

## 🚨 Important Notes

- Only register `/auth/callback` in WorkOS dashboard
- The middleware only protects `/dashboard` and `/api/metrics` by default
- All authentication flows through the clean `/auth/*` routes
- The codebase is now clean with no unused example routes

Your authentication microservice is now production-ready with clean URLs! 🎉