import AppHeader from '@/components/shared/AppHeader';
import ImageLabStudio from '@/features/image-lab/ImageLabStudio';

export const metadata = {
  title: 'Mosaic Image Lab ✦ Tony',
  description: 'Compose mosaic, dither, and water-reflection image treatments.',
};

export default function WaterReflectionPage() {
  return (
    <main className="h-dvh overflow-hidden bg-background text-foreground">
      <AppHeader title="Mosaic Image Lab" />
      <ImageLabStudio />
    </main>
  );
}
