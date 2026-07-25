import { RevealField } from "./RevealField";

export default function VisionReveal({ className }) {
  return (
    <section aria-label="Vision" className={`relative overflow-hidden bg-white ${className ?? ""}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.05]"
        style={{
          backgroundImage: "url(/vision-reveal/noise.png)",
          backgroundSize: "220px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] px-4 py-1 lg:px-0 lg:py-2">
        <RevealField className="h-[380px] lg:h-[560px]">
          <div className="px-6">
            <h2 className="whitespace-nowrap font-serif text-2xl font-bold tracking-tight text-[#4b1f3f] sm:text-3xl lg:text-5xl">
              The Sundial difference
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] text-lg text-slate-800/80">
              An agentic analytics platform built for both trust and speed. It works with your existing stack and LLM tools, and we set it up for you so you can focus on what matters.
            </p>
          </div>
        </RevealField>
      </div>
    </section>
  );
}
