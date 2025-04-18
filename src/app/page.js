import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import GradientBlob from '@/components/backgrounds/GradientBlob';
import CustomCard from '@/components/CustomCard';
import { Fish, Tag, ThumbsUp, Music, Wrench, Clock, Unlock } from 'lucide-react';

const experienceCards = [
  {
    image: "/fish/fish1.png",
    heading: "Interactive Fish",
    description: "An interactive fish experience with realistic movement",
    href: '/experiences/fish'
  }
];

const explorationCards = [
  {
    icon: <Tag className="w-6 h-6" />,
    heading: "Jelly Tags",
    href: '/ui-explorations/jellytags'
  },
  {
    icon: <ThumbsUp className="w-6 h-6" />,
    heading: "Upvote",
    href: '/ui-explorations/upvote'
  },
  {
    icon: <Music className="w-6 h-6" />,
    heading: "Music Player",
    href: '/ui-explorations/music-player'
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    heading: "Toolbar",
    href: '/ui-explorations/toolbar'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    heading: "Clock",
    href: '/ui-explorations/clock'
  },
  {
    icon: <Unlock className="w-6 h-6" />,
    heading: "Unlock",
    href: '/ui-explorations/unlock'
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="min-h-screen flex">
        {/* Left Sidebar */}
        <div className="flex-1 relative">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-200 dark:from-slate-900 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-full h-full [background-image:linear-gradient(0deg,transparent_50%,var(--gradient-color)_50%),linear-gradient(90deg,transparent_50%,var(--gradient-color)_50%)] [background-size:4px_4px] pointer-events-none"></div>
        </div>

        {/* Main Content */}
        <div className="w-[700px] md:w-[700px] lg:w-[800px] xl:w-[900px] border-x border-slate-200 dark:border-slate-900 pt-16">
          <div className="px-12">
            <AppHeader maxWidth="700px" />
            <section className="relative w-full h-96 flex flex-col items-start justify-center rounded-lg pt-8">
              <GradientBlob>
                <div className='flex flex-col items-center max-w-lg'>
                  <p className="text-base tracking-wider font-sans dark:text-slate-200 text-slate-900 text-center">
                    A cozy corner of the web where I share my experiments with UI components, motion design, and creative ideas. Built with love, Figma, and a sprinkle of code magic.
                  </p>
                </div>
              </GradientBlob>
            </section>

            {/* Experiences Section */}
            <div className="mt-8">
              <h2 className="text-sm font-sans font-medium tracking-widest text-slate-500 dark:text-slate-500 mb-4">
                EXPERIENCES
              </h2>
              <div className="grid gap-4">
                {experienceCards.map((cardData, index) => (
                  <CustomCard
                    key={index}
                    variant="horizontal"
                    data={cardData}
                  />
                ))}
              </div>
            </div>

            {/* UI Explorations Section */}
            <div className="mt-8 mb-8">
              <h2 className="text-sm font-sans font-medium tracking-widest text-slate-500 dark:text-slate-500 mb-4">
                UI EXPLORATIONS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {explorationCards.map((cardData, index) => (
                  <CustomCard
                    key={index}
                    variant="vertical"
                    data={cardData}
                    className="h-full" // This ensures all cards in a row have the same height
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex-1 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-200 dark:from-slate-900 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-full [background-image:linear-gradient(0deg,transparent_50%,var(--gradient-color)_50%),linear-gradient(90deg,transparent_50%,var(--gradient-color)_50%)] [background-size:4px_4px] pointer-events-none"></div>
        </div>
      </div>
    </main>
  );
}