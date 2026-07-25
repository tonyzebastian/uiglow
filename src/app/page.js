import MasonryGallery from '@/features/gallery/MasonryGallery';
import { galleryCards } from '@/features/gallery/galleryData';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-950">
      <MasonryGallery cards={galleryCards} />
    </main>
  );
}
