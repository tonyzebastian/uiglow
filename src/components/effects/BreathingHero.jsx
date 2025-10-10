import GradientBlob from '@/components/backgrounds/GradientBlob';
import LogoMotion from '@/components/logo-motion/Logo';

export default function BreathingHero() {
  return (
    <section className="relative w-full h-96 flex flex-col items-start justify-center rounded-lg pt-8">
      <GradientBlob>
        <div className="flex flex-col items-center max-w-lg gap-4">
          <LogoMotion/>
          <div className='flex flex-col items-center'>
            <h1 className='font-heading text-2xl text-orange-950 font-bold dark:text-orange-200 tracking-wider'>Motion, Pixels, & Play</h1>
            <p className="mt-2 text-base font-light leading-relaxed tracking-wider font-sans dark:text-slate-300 text-slate-900 text-center">
            My playground to explore all types of ideas ranging from motion design, experiences, react components and random animations. A Space for Motion, Pixels, and Play. Built with love and a sprinkle of code magic.
            </p>
          </div>
        </div>
      </GradientBlob>
    </section>
  );
}
