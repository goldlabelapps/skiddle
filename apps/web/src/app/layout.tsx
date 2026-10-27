import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Ping } from '@goldlabelapps/notify';
import { AppShell } from '../components/AppShell';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0b0f19',
};

export const metadata: Metadata = {
  title: 'Skiddle Promo',
  description: 'Next.js application integrated with @skiddle/sdk',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48 32x32 16x16' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Skiddle Promo',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Ping
          apiKey="pk_live_skiddle"
          endpoint="https://private.goldlabel.pro/api/notify/ping"
          intervalMs={5000}
          metadata={{
            app: 'skiddle',
            appVersion: '0.3.0',
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

