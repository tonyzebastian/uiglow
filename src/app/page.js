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
    <main className="w-full p-6 rounded">
      <section className="w-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
          <h1 className="text-4xl tracking-wide font-heading">Hey there, meet UIglow</h1>
          <p className="text-l tracking-wider mt-4 text-center font-sans px-8">A cozy corner of the web where I share my experiments with UI components, motion design, and creative ideas. <br /> Built with love, Figma, and a sprinkle of code magic.</p>
      </section>
    </main>
  );
}