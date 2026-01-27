import { Merriweather, Raleway } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DockNavigation from "@/components/DockNavigation";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  // Typically for headings you might only need a few weights
  weight: ["400", "700", "900"],
  display: 'swap',
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  // Full range of weights for body text
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export const metadata = {
  title: 'Play ✦ Tony',
  description: 'A visual product designer | Love to code | always tinkering with a side project',
  keywords: 'design, UI, animations, interactions, canvas, creative coding',
  author: 'Tony Sebastian',
  robots: 'index,follow',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-title': 'Play ✦ Tony',
  'apple-mobile-web-app-status-bar-style': 'black-translucent',
  alternates: {
    canonical: 'https://play.tonyzeb.com',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tonyzebastian',
    creator: '@tonyzebastian',
    title: 'Play ✦ Tony',
    description: 'A visual product designer | Love to code | always tinkering with a side project',
    image: 'https://play.tonyzeb.com/preview.png',
    imageAlt: 'Play ✦ Tony - UI Experiments & Interactions',
  },
  openGraph: {
    title: 'Play ✦ Tony',
    description: 'A visual product designer | Love to code | always tinkering with a side project',
    url: 'https://play.tonyzeb.com/',
    siteName: 'Play ✦ Tony',
    images: [{
      url: 'https://play.tonyzeb.com/preview.png',
      alt: 'Play ✦ Tony - UI Experiments & Interactions',
      width: 1200,
      height: 630,
    }],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${merriweather.variable} ${raleway.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Ensure light mode is set immediately (before React hydration)
              document.documentElement.classList.remove('dark');
            `,
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <DockNavigation />
      </body>
    </html>
  );
}
