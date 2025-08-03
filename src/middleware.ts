// This file is only used in conjunction with the authkit-nextjs library
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({ debug: process.env.NODE_ENV !== 'production' });

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/metrics',
  ],
};