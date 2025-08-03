import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AuthKit - WorkOS Authentication',
  description: 'Production-ready authentication microservice powered by WorkOS',
};

// Only run startup validation at runtime, not during build
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
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
        {children}
      </body>
    </html>
  );
}
