import MosaicPhotoEffect from './MosaicPhotoEffect';
import AppHeader from "@/components/core/AppHeader";


export const metadata = {
  title: 'Image Mosaic ✦ Tony',
  description: 'Stunning photo mosaic effects with customizable grid patterns',
  keywords: 'design, canvas, creative coding, photo effect, mosaic, photoshop, effects',
  author: 'Tony Sebastian',
  robots: 'index,follow',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-title': 'Image Mosaic ✦ Tony',
  'apple-mobile-web-app-status-bar-style': 'black-translucent',
  alternates: {
    canonical: 'https://play.tonyzeb.com',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tonyzebastian',
    creator: '@tonyzebastian',
    title: 'Image Mosaic ✦ Tony',
    description: 'Stunning photo mosaic effects with customizable grid patterns',
    image: 'https://play.tonyzeb.com/mosaic_preview.jpg',
    imageAlt: 'Play ✦ Tony - UI Experiments & Interactions',
  },
  openGraph: {
    title: 'Image Mosaic ✦ Tony',
    description: 'Stunning photo mosaic effects with customizable grid patterns',
    url: 'https://play.tonyzeb.com/',
    siteName: 'Play ✦ Tony',
    images: [{
      url: 'https://play.tonyzeb.com/mosaic_preview.jpg',
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
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader title="Image Mosaic" />
      <MosaicPhotoEffect />
    </div>
  );
}
``