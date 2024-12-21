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
          <h1 className="text-6xl font-heading">Hero Section</h1>
          <p className="text-xl mt-4">Your hero content goes here</p>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </section>
    </main>
  );
}