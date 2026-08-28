import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Procurly | B2B Vehicle Parts Procurement & Freight by Autohub',
  description:
    'Streamlined vehicle parts sourcing, quotation, and global logistics portal for NZ automotive dealers and trade repairers.',
  keywords: [
    'Automotive parts New Zealand',
    'B2B parts sourcing',
    'Autohub parts procurement',
    'Trade vehicle parts NZ',
    'OEM parts logistics',
    'Air freight automotive parts NZ',
  ],
  authors: [{ name: 'Autohub Logistics New Zealand' }],
  openGraph: {
    title: 'Procurly | B2B Vehicle Parts Procurement & Freight by Autohub',
    description:
      'Eliminate fragmented supplier messaging. One platform to request, quote, clear, and deliver vehicle parts door-to-door across New Zealand.',
    url: 'https://procurly.autohub.co.nz',
    siteName: 'Procurly by Autohub',
    locale: 'en_NZ',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Procurly by Autohub Global Logistics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Procurly | B2B Vehicle Parts Procurement & Freight by Autohub',
    description:
      'Precision B2B automotive parts sourcing and global logistics platform for New Zealand trade.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-brand-canvas text-brand-text-primary antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
