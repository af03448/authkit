import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import BackLink from './back-link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AuthKit - WorkOS Authentication',
  description: 'Production-ready authentication microservice powered by WorkOS',
};

if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  import('@/lib/startup').then(({ validateStartup, setupGracefulShutdown }) => {
    validateStartup().catch((error) => {
      console.error('Startup validation failed:', error);
      process.exit(1);
    });
    setupGracefulShutdown();
  });
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackLink />
        {children}
      </body>
    </html>
  );
}
