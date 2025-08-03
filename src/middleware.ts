// This file is only used in conjunction with the authkit-nextjs library
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({ debug: process.env.NODE_ENV !== 'production' });

export const config = {
  matcher: [
    '/api/:path*',
    '/using-hosted-authkit/with-nextjs',
    '/using-your-own-ui/((?!public).*)',
  ],
};