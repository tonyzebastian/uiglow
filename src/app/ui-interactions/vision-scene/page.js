import VisionScene from '@/components/vision-scene/VisionScene';

export default function VisionScenePage() {
  return (
    <main className="min-h-full bg-[#fafaf9] px-5 py-8 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl flex-col justify-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-violet-700">UI exploration</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">Vision Scene</h1>
        <p className="mt-3 max-w-xl text-slate-600">A generative field rises into a pair of mountains before resolving into a calm orbit around the UiGlow mark.</p>
        <div className="mt-8 h-[440px] overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50 shadow-sm sm:h-[560px]">
          <VisionScene />
        </div>
      </section>
    </main>
  );
}
