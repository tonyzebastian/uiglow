import MasonryGallery from '@/components/gallery/MasonryGallery';
import { galleryCards } from '@/data/galleryData';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-950">
      <MasonryGallery cards={galleryCards} />
    </main>
  );
}
