import Link from 'next/link';
import AppHeader from '@/components/AppHeader';

const experiences = [
  {
    title: 'Interactive Fish',
    href: '/experiences/fish'
  }
];

const explorations = [
  {
    title: 'JellyTags',
    href: '/ui-explorations/jellytags'
  },
  {
    title: 'Upvote',
    href: '/ui-explorations/upvote'
  },
  {
    title: 'Music Player',
    href: '/ui-explorations/music-player'
  },
  {
    title: 'Toolbar',
    href: '/ui-explorations/toolbar'
  },
  {
    title: 'Clock',
    href: '/ui-explorations/clock'
  },
  {
    title: 'Unlock',
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
        <div className="w-[700px] md:w-[700px] lg:w-[800px] xl:w-[900px] border-x border-slate-200 dark:border-slate-800 pt-16">
          <div className="px-6">
            <AppHeader maxWidth="700px" />

            <section className="relative w-full flex flex-col items-start justify-center overflow-hidden rounded-lg pt-8">
              <p className="text-base tracking-wider font-sans dark:text-slate-200 text-slate-900">
                A cozy corner of the web where I share my experiments with UI components, motion design, and creative ideas. Built with love, Figma, and a sprinkle of code magic.
              </p>
            </section>

            {/* Experiences Section */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Experiences</h2>
              <div className="flex flex-col gap-2">
                {experiences.map((item, index) => (
                  <Link 
                    key={index}
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* UI Explorations Section */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">UI Explorations</h2>
              <div className="flex flex-col gap-2">
                {explorations.map((item, index) => (
                  <Link 
                    key={index}
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    {item.title}
                  </Link>
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