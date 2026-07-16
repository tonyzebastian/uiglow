'use client';

import DraggableCanvas from '@/components/canvas/DraggableCanvas';
import { canvasItems } from '@/data/canvasData';

export default function HomePage() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <section className="flex h-full flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-50 md:hidden">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
          UiGlow
        </p>
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight">
          This canvas is best viewed on a larger screen.
        </h1>
        <p className="mt-4 max-w-sm text-base leading-7 text-slate-300">
          Please visit UiGlow on a tablet or desktop to explore the interactive canvas.
        </p>
      </section>
      <div className="hidden h-full md:block">
        <DraggableCanvas items={canvasItems} />
      </div>
    </main>
  );
}
