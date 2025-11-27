import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Iron Pets',
    default: 'Iron Pets - Premium Pet Products',
  },
  description: 'Premium pet products for your beloved companions. Quality food, toys, and accessories.',
  keywords: ['pet store', 'pet food', 'pet toys', 'pet accessories', 'premium pet products'],
  authors: [{ name: 'Iron Pets Team' }],
  creator: 'Iron Pets',
  publisher: 'Iron Pets',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Iron Pets',
    title: 'Iron Pets - Premium Pet Products',
    description: 'Premium pet products for your beloved companions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Iron Pets',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iron Pets - Premium Pet Products',
    description: 'Premium pet products for your beloved companions.',
    images: ['/og-image.png'],
    creator: '@ironpets',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
