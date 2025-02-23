import GradientNoise from '@/components/GradientNoise';
import Clock from '@/app/ui-explorations/clock/Clock';
import JellyTags from '@/app/ui-explorations/jellytags/JellyTagsSingle';
import Upvote from '@/app/ui-explorations/upvote/upvote';
import AppHeader from '@/components/AppHeader';
import AppSidebar from "@/components/AppSidebar";

export const metadata = {
  title: 'UIGlow',
  description: 'A visual product designer | Love to code | always tinkering with a side project',
  keywords: 'design, art, cinematography, photography, travel',

  twitter: {
    card: 'summary_large_image',
    site: '@tonyzebastian',
    creator: '@tonyzebastian',
    title: 'Tony Sebastian ✦ designer',
    description: 'A visual product designer | Love to code | always tinkering with a side project',
    image: 'https://tonyzeb.design/public/preview.png',
  },
  og: {
    title: 'Tony Sebastian ✦ designer',
    description: 'A visual product designer | Love to code | always tinkering with a side project',
    url: 'https://tonyzeb.design/',
    image: 'https://tonyzeb.design/public/preview.png',
    locale: 'en_EN',
  },
}


export default function HomePage() {

  return (
    <main className="flex flex-col w-full max-w-[1600px] mx-auto">

      <AppHeader />

      <div className="flex flex-row w-full">

        <AppSidebar />

        <div className='p-6'>
          <section className="relative w-full min-h-[400px] flex flex-col items-center justify-center overflow-hidden rounded-lg">
            <GradientNoise />
            <h1 className="relative z-10 text-4xl tracking-wide font-heading">
              Hey there, meet UIglow
            </h1>
            <p className="relative z-10 text-l tracking-wider mt-4 text-center font-sans px-8">
              A cozy corner of the web where I share my experiments with UI components, motion design, and creative ideas. <br /> Built with love, Figma, and a sprinkle of code magic.
            </p>
          </section>

          {/* New Grid Section */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mt-8 w-full">

            <div className="flex flex-col items-center p-6 rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all">
              <Clock size={150} />
            </div>

            <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all">
              <Upvote />
            </div>

            <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all">
              <JellyTags />
            </div>
          </section>

        </div>

      </div>

    </main>
  );
}