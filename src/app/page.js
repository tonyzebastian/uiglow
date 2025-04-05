import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { Tag, ThumbsUp, Music, Tool, Clock } from 'react-feather';

const explorations = [
  {
    title: 'JellyTags',
    description: 'Playful and interactive tag components with jelly-like animations',
    href: '/ui-explorations/jellytags',
    icon: <Tag className="w-8 h-8 text-blue-500" />
  },
  {
    title: 'Upvote',
    description: 'Animated upvote button with particle effects',
    href: '/ui-explorations/upvote',
    icon: <ThumbsUp className="w-8 h-8 text-green-500" />
  },
  {
    title: 'Music Player',
    description: 'Minimal music player with smooth transitions',
    href: '/ui-explorations/music-player',
    icon: <Music className="w-8 h-8 text-purple-500" />
  },
  {
    title: 'Toolbar',
    description: 'Expandable toolbar with dynamic content',
    href: '/ui-explorations/toolbar',
    icon: <Tool className="w-8 h-8 text-orange-500" />
  },
  {
    title: 'Clock',
    description: 'Analog clock with smooth hand movements',
    href: '/ui-explorations/clock',
    icon: <Clock className="w-8 h-8 text-red-500" />
  }
];


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
    <main className="flex flex-col w-full max-w-[600px] mx-auto">
      <AppHeader />

      <section className="relative w-full  flex flex-col items-start justify-center overflow-hidden rounded-lg pt-8">
        <p className="text-base tracking-wider font-sans dark:text-slate-200 text-slate-900">
          A cozy corner of the web where I share my experiments with UI components, motion design, and creative ideas. Built with love, Figma, and a sprinkle of code magic.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-4">
        {explorations.map((item, index) => (
          <Link 
            key={index}
            href={item.href}
            className="group flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

    </main>
  );
}