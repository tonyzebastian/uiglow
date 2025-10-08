import GradientBlob from '@/components/backgrounds/GradientBlob';
import BreathingTextComp from '@/components/effects/BreathingText';

export const metadata = {
  title: "Breathing Hero - UiGlow",
  description: "Animated hero section with breathing text effect and gradient blob background.",
};

export default function BreathingHeroPage() {
  return (
    <section className="relative w-full h-96 flex flex-col items-start justify-center rounded-lg pt-8">
      <GradientBlob>
        <div className="flex flex-col items-center max-w-lg">
          <BreathingTextComp/>
          <p className="mt-2 text-base font-light leading-relaxed tracking-wider font-sans dark:text-slate-300 text-slate-900 text-center">
            Built with love and a sprinkle of code magic.
          </p>
        </div>
      </GradientBlob>
    </section>
  );
}