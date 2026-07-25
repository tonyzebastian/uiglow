import VisionScene from '@/features/vision-scene/VisionScene';

export default function VisionScenePage() {
  return (
    <main className="min-h-full bg-white px-5 py-8 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl flex-col justify-center">
        <div className="h-[440px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:h-[560px]">
          <VisionScene />
        </div>
      </section>
    </main>
  );
}
