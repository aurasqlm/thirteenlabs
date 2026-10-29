import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';

export const metadata: Metadata = {
  metadataBase: new URL('https://thirteenlabs.bond'),
  title: {
    default: 'ThirteenLabs | Free High-Quality Voice Generator & 60+ TTS Aggregator by aurasqlm',
    template: '%s | ThirteenLabs',
  },
  description:
    'ThirteenLabs is a 100% free, open-source AI voice generator by aurasqlm. Aggregates 60+ free voice engines (Edge-TTS, Chrome, Kokoro) with no API keys, 1,000+ vocal emotion tags, and lossless export.',
  keywords: [
    'ThirteenLabs',
    'thirteenlabs.bond',
    'free elevenlabs alternative',
    'open source voice generator',
    'aurasqlm',
    'free tts without api key',
    'edge tts online',
    'ai voice generator with emotions',
    'wav mp3 voice generator',
    'kokoro tts',
  ],
  authors: [{ name: 'aurasqlm', url: 'https://github.com/aurasqlm' }],
  creator: 'aurasqlm',
  publisher: 'aurasqlm',
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
  openGraph: {
    title: 'ThirteenLabs - Free Voice Generator & 60+ TTS Aggregator',
    description: '100% free open-source speech synthesis by aurasqlm with 1,000+ vocal emotion extensions.',
    url: 'https://thirteenlabs.bond',
    siteName: 'ThirteenLabs',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThirteenLabs | Free AI Voice Generator by aurasqlm',
    description: 'High-quality free speech synthesis aggregating 60+ neural providers with zero API key.',
    creator: '@aurasqlm',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ThirteenLabs',
    url: 'https://thirteenlabs.bond',
    description: 'Open-source high-fidelity voice generator and 60+ TTS aggregator with zero API key requirements.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'aurasqlm',
      url: 'https://github.com/aurasqlm',
    },
    codeRepository: 'https://github.com/aurasqlm/thirteenlabs',
  };

  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="canonical" href="https://thirteenlabs.bond" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="h-full min-h-screen bg-studio-canvas font-sans text-studio-obsidian antialiased selection:bg-studio-obsidian selection:text-studio-white"
        suppressHydrationWarning
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
