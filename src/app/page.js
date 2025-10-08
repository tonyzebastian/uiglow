import AppHeader from '@/components/core/AppHeader';
import DraggableCanvas from '@/components/canvas/DraggableCanvas';
import { canvasItems } from '@/data/canvasData';

export default function HomePage() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Floating Header */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
        <AppHeader variant="primary" />
      </div>

      {/* Draggable Canvas */}
      <DraggableCanvas items={canvasItems} />
    </main>
  );
}
