import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skiddle Monorepo | Next.js App',
  description: 'Next.js application integrated with @skiddle/sdk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
