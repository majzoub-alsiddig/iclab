import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['italic', 'normal'],
});

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL( process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'),
  title: {
    default: 'IC LAB',
    template: '%s | IC LAB'
  },
  description: 'A professional-grade digital logic simulator that replicates the experience of building circuits on a real breadboard. Place 7400-series ICs, LEDs, switches, and a clock generator, connect them with virtual wires, and watch real-time simulation. Features AI-powered challenge verification, cloud storage for circuits, community samples, and an intuitive interface for students, hobbyists, and engineers learning digital electronics.',
  
  icons: {
    icon: [
      { url: '/fav/favicon.ico' },                    
      { url: '/fav/favicon.svg', type: 'image/svg+xml' }, 
      { url: '/fav/favicon-96x96.png', type: 'image/png', sizes: '96x96' }, 
      { url: '/fav/web-app-manifest-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/fav/web-app-manifest-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/fav/apple-touch-icon.png', sizes: '180x180' }, 
    ],
  },
  manifest: '/fav/site.webmanifest',  
  
  appleWebApp: {
    title: 'IC LAB',
    capable: true,
    statusBarStyle: 'default',
  },
  
  keywords: [
    'digital logic simulator',
    'breadboard simulator',
    '7400 series IC',
    'logic gates',
    'circuit simulator',
    'digital electronics',
    'virtual breadboard',
    'logic circuit design',
    'flip flop simulator',
    'counter circuit',
    'educational electronics',
    'online logic simulator',
    'IC lab',
    'digital circuit builder'
  ],
  
  authors: [
    { name: 'Mohammed Saeed' },
    { name: 'Majzoub AL Siddig' }
  ],
  creator: 'IC LAB Team',
  publisher: 'IC LAB',
  
  openGraph: {
    title: 'IC LAB',
    description: 'Build, simulate, and verify digital logic circuits on a virtual breadboard. Perfect for learning electronics!',
    url: 'https://github.io/majzoub-alsiddig/iclab.io',
    siteName: 'IC LAB',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IC LAB Digital Logic Simulator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'IC LAB',
    description: 'Build, simulate, and verify digital logic circuits on a virtual breadboard.',
    images: ['/og-image.png'],
    creator: '@iclab',
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
  
  category: 'education',
};

import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/hooks/use-theme';
import Navbar from '@/components/Navbar';
import PWARegister from '@/components/PWARegister';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/fav/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/fav/favicon.svg" />
        <link rel="shortcut icon" href="/fav/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/fav/apple-touch-icon.png" />
        
        <link rel="manifest" href="/fav/site.webmanifest" />
        
        <meta name="apple-mobile-web-app-title" content="ICLAB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/fav/favicon-96x96.png" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IC LAB" />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <PWARegister />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}