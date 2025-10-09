import CenteredPageLayout from '@/components/core/CenteredPageLayout';

// Shared image URLs
const STACK_IMAGES = [
  'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731403/1_d8uozd.jpg',
  'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/5_ionpyy.jpg',
  'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/4_zeoqje.jpg',
  'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg',
  'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/3_nfdtim.jpg'
];

// Generate sphere images
const generateSphereImages = () => {
  const BASE_IMAGES = [
    { src: STACK_IMAGES[0], alt: "Image 1", title: "Image 1", description: "Description" },
    { src: STACK_IMAGES[1], alt: "Image 2", title: "Image 2", description: "Description" },
    { src: STACK_IMAGES[2], alt: "Image 3", title: "Image 3", description: "Description" },
    { src: STACK_IMAGES[3], alt: "Image 4", title: "Image 4", description: "Description" },
    { src: STACK_IMAGES[4], alt: "Image 5", title: "Image 5", description: "Description" }
  ];

  const images = [];
  for (let i = 0; i < 60; i++) {
    const baseImage = BASE_IMAGES[i % BASE_IMAGES.length];
    images.push({ id: `img-${i + 1}`, ...baseImage });
  }
  return images;
};

// Chat configuration
const CHAT_CONFIG = {
  config: {
    leftPerson: {
      name: "Tony",
      avatar: "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/10_qujlpy.jpg"
    },
    rightPerson: {
      name: "Brendon",
      avatar: "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg"
    },
    messages: [
      { id: 1, sender: 'left', type: 'text', content: 'Hey! Did you see the latest project updates?', maxWidth: 'max-w-sm', loader: { enabled: true, delay: 1000, duration: 2000 } },
      { id: 2, sender: 'right', type: 'text', content: 'Not yet! What\'s new?', loader: { enabled: true, delay: 4000, duration: 1500 } },
      { id: 3, sender: 'left', type: 'text-with-links', content: 'We\'re on track to complete it by the end of the quarter.', maxWidth: 'max-w-md', links: [{ text: 'Substack' }, { text: 'Youtube' }], loader: { enabled: true, delay: 6000, duration: 1800 } },
      { id: 4, sender: 'left', type: 'image', content: 'https://res.cloudinary.com/dctgknnt7/image/upload/v1758636253/cld-sample.jpg', loader: { enabled: false, delay: 10500, duration: 2000 } },
      { id: 5, sender: 'right', type: 'text', content: 'These look great! Thanks for sharing.', loader: { enabled: true, delay: 8500, duration: 1200 } }
    ]
  },
  uiConfig: {
    containerWidth: 750,
    containerHeight: 500,
    backgroundColor: '#F5EBE0',
    autoRestart: true,
    restartDelay: 3000,
    loader: { dotColor: '#936639' },
    linkBubbles: { backgroundColor: '#F5EBE0', textColor: '#936639', iconColor: '#936639', borderColor: '#F5EBE0' },
    leftChat: { backgroundColor: '#FDF6EE', textColor: '#582F0E', borderColor: '#E3D5CA', showBorder: true, nameColor: '#936639' },
    rightChat: { backgroundColor: '#EDE0D4', textColor: '#582F0E', borderColor: '#d1d1d1', showBorder: false, nameColor: '#936639' }
  }
};

// Component configurations
export const componentConfigs = {
  'img-stack': {
    props: { images: STACK_IMAGES },
    wrapper: (Component, props) => (
      <CenteredPageLayout>
        <Component {...props} />
      </CenteredPageLayout>
    )
  },

  'img-tiles': {
    props: {
      leftImage: "/ui/imgtiles/left.jpg",
      middleImage: "/ui/imgtiles/middle.jpg",
      rightImage: "/ui/imgtiles/right.jpg"
    },
    wrapper: (Component, props) => (
      <CenteredPageLayout>
        <div className="-ml-12">
          <Component {...props} />
        </div>
      </CenteredPageLayout>
    )
  },

  'img-light': {
    render: (Component) => (
      <main className="w-full p-6">
        <div className="flex justify-center gap-2">
          {STACK_IMAGES.slice(0, 3).map((src, idx) => (
            <Component
              key={src}
              src={src}
              alt="Portrait image with spotlight effect"
              orientation="portrait"
              width={300}
              height={400}
            />
          ))}
        </div>
      </main>
    )
  },

  'img-sphere': {
    props: {
      images: generateSphereImages(),
      containerSize: 600,
      sphereRadius: 200,
      dragSensitivity: 0.8,
      momentumDecay: 0.96,
      maxRotationSpeed: 6,
      baseImageScale: 0.15,
      hoverScale: 1.3,
      perspective: 1000,
      autoRotate: true,
      autoRotateSpeed: 0.2
    },
    wrapper: (Component, props) => (
      <main className="w-full p-6 flex justify-center items-center min-h-screen">
        <Component {...props} />
      </main>
    )
  },

  'img-loading': {
    props: {
      src: STACK_IMAGES[1],
      alt: "Mountain landscape",
      width: "800px",
      height: "600px",
      gridSize: 15,
      cellGap: 15,
      cellShape: "square",
      cellColor: "#cbd5e1",
      blinkSpeed: 2000,
      transitionDuration: 300,
      fadeOutDuration: 400,
      loadingDelay: 1500,
      className: "rounded-lg overflow-hidden"
    },
    wrapper: (Component, props) => (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="rounded-lg p-2 border border-slate-200 dark:border-slate-900">
            <Component {...props} />
          </div>
        </div>
      </div>
    )
  },

  'chat-interface': {
    props: CHAT_CONFIG,
    wrapper: (Component, props) => (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Component {...props} />
      </div>
    )
  }
};
