// src/app/page.js
import AppHeader from '@/components/AppHeader';
import GradientBlob from '@/components/backgrounds/GradientBlob';
import InteractiveTitle from '@/components/InteractiveTitle';
import BreathingTextComp from '@/components/effects/BreathingText';

const experienceCards = [
  {
    image: "/thumbnails/fish.gif",
    heading: "A School of Fish",
    description: "An interactive school of fish with realistic movements.",
    href: '/experiences/fish',
    newTab: true,
  },
  {
    image: "/thumbnails/clock.gif",
    heading: "World Clock",
    description: "A visual represenation of all timezones",
    href: '/experiences/clock',
    newTab: true,
  },
];

const explorationCards = [
  { heading: "Jelly Tags",     href: '/ui-explorations/jellytags',    image: "/thumbnails/jellytags.png",   newTab: false },
  { heading: "Upvote",         href: '/ui-explorations/upvote',       image: "/thumbnails/upvote.png",   newTab: false },
  { heading: "Music Player",   href: '/ui-explorations/music-player', image: "/thumbnails/music.png",   newTab: false  },
  { heading: "Toolbar",        href: '/ui-explorations/toolbar',      image: "/thumbnails/toolbar.png",   newTab: false },
  { heading: "Unlock",         href: '/ui-explorations/unlock',       image: "/thumbnails/jellytags.png",   newTab: false },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="min-h-screen flex">
        {/* Left Sidebar */}
        <div className="flex-1 relative">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-200 dark:from-slate-900 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-full h-full [background-image:linear-gradient(0deg,transparent_50%,var(--gradient-color)_50%),linear-gradient(90deg,transparent_50%,var(--gradient-color)_50%)] [background-size:4px_4px] pointer-events-none" />
        </div>

        {/* Main Content */}
        <div className="w-[700px] md:w-[700px] lg:w-[800px] xl:w-[900px] border-x border-slate-200 dark:border-slate-900 pt-16">
          <div className="px-12">
            <AppHeader maxWidth="700px" />

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

            {/* Experiences Section */}
            <div className="mt-4">
              <h2 className="text-xs font-sans font-medium tracking-widest text-slate-500 dark:text-slate-500 mb-4">
                EXPERIENCES
              </h2>
              <div className="grid gap-8">
                {experienceCards.map((cardData, index) => (
                  <div key={index}>
                    <InteractiveTitle
                      heading={cardData.heading}
                      href={cardData.href}
                      image={cardData.image}
                      newTab={cardData.newTab}
                    />
                    <p className="pt-1 text-sm font-sans font-normal tracking-widest text-slate-800 dark:text-slate-300">
                      {cardData.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* UI Explorations Section */}
            <div className="mt-16 mb-8">
              <h2 className="text-xs font-sans font-medium tracking-widest text-slate-500 dark:text-slate-500 mb-4">
                UI EXPLORATIONS
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {explorationCards.map((cardData, index) => (
                  <div key={index}>
                    <InteractiveTitle
                      heading={cardData.heading}
                      href={cardData.href}
                      image={cardData.image}
                      newTab={cardData.newTab}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex-1 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-200 dark:from-slate-900 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full [background-image:linear-gradient(0deg,transparent_50%,var(--gradient-color)_50%),linear-gradient(90deg,transparent_50%,var(--gradient-color)_50%)] [background-size:4px_4px] pointer-events-none" />
        </div>
      </div>
    </main>
  );
}