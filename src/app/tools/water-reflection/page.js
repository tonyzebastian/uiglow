import AppHeader from '@/components/core/AppHeader';
import WaterReflectionStudio from './WaterReflectionStudio';

export const metadata = {
  title: 'Water Reflection Studio ✦ Tony',
  description: 'Turn photographs into static, grainy water-reflection illustrations.',
};

export default function WaterReflectionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader title="Water Reflection" />
      <WaterReflectionStudio />
    </main>
  );
}
