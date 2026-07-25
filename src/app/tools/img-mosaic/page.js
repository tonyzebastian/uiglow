import ImageLabStudio from '@/features/image-lab/ImageLabStudio';
import AppHeader from '@/components/shared/AppHeader';

export const metadata = {
  title: 'Mosaic Image Lab ✦ Tony',
  description: 'A composable image editor for mosaic, dither, and water-reflection treatments.',
  keywords: 'design, canvas, creative coding, photo effect, mosaic, dither, water reflection',
  author: 'Tony Sebastian',
  robots: 'index,follow',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-title': 'Mosaic Image Lab ✦ Tony',
  'apple-mobile-web-app-status-bar-style': 'black-translucent',
  alternates: {
    canonical: 'https://play.tonyzeb.com',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tonyzebastian',
    creator: '@tonyzebastian',
    title: 'Mosaic Image Lab ✦ Tony',
    description: 'Compose mosaic, dither, and water-reflection treatments in one image editor.',
    image: 'https://play.tonyzeb.com/thumbnails/mosaic_preview.jpg',
    imageAlt: 'Play ✦ Tony - UI Experiments & Interactions',
  },
  openGraph: {
    title: 'Mosaic Image Lab ✦ Tony',
    description: 'Compose mosaic, dither, and water-reflection treatments in one image editor.',
    url: 'https://play.tonyzeb.com/',
    siteName: 'Play ✦ Tony',
    images: [{
      url: 'https://play.tonyzeb.com/thumbnails/mosaic_preview.jpg',
      alt: 'Play ✦ Tony - UI Experiments & Interactions',
      width: 1200,
      height: 630,
    }],
    locale: 'en_US',
    type: 'website',
  },
};


export default function ImgMosaicPage() {
  return (
    <main className="h-dvh overflow-hidden bg-background text-foreground">
      <AppHeader title="Mosaic Image Lab" />
      <ImageLabStudio />
    </main>
  );
}
