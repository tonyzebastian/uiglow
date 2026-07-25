// The gallery deliberately keeps content and interaction separate from layout.
// `size` supplies a stable preview aspect ratio and is also used to balance the
// masonry columns before cards are painted.
const createGalleryCard = (id, overrides) => ({
  id,
  interactive: true,
  openInNewTab: false,
  ...overrides,
});

const imageCard = (id, options) => createGalleryCard(id, {
  contentType: 'image',
  ...options,
});

const videoCard = (id, options) => createGalleryCard(id, {
  contentType: 'video',
  ...options,
});

const componentCard = (id, component, options) => createGalleryCard(id, {
  contentType: 'component',
  component,
  ...options,
});

export const galleryCards = [
  imageCard('fish', {
    content: '/thumbnails/fish.gif',
    title: 'A School of Fish',
    size: { width: 280, height: 200 },
    link: '/experiences/fish',
  }),
  videoCard('vision-reveal', {
    content: '/thumbnails/vision_reveal.mp4',
    title: 'Vision Reveal',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/vision-reveal',
  }),
  componentCard('clock', 'Clock', {
    componentProps: { size: 180, timeZoneOffset: 0 },
    title: 'World Clock',
    size: { width: 220, height: 220 },
    link: '/experiences/clock',
    backgroundColor: '#006045',
  }),
  videoCard('cars', {
    content: '/thumbnails/slate_config.mp4',
    title: 'Car Configuration',
    size: { width: 280, height: 200 },
    link: '/experiences/slate-cars',
  }),

  imageCard('mosaic', {
    content: '/thumbnails/mosaic.jpg',
    title: 'Image Mosaic',
    size: { width: 250, height: 180 },
    link: '/tools/img-mosaic',
  }),
  videoCard('writing', {
    content: '/thumbnails/drawing%20canvas.mp4',
    title: 'Draw Canvas',
    size: { width: 250, height: 180 },
    link: '/tools/draw-canvas',
    openInNewTab: true,
  }),
  imageCard('water-reflection', {
    content: '/thumbnails/water_reflection_thumbnail.png',
    title: 'Water Reflection',
    size: { width: 210, height: 210 },
    objectPosition: 'center top',
    link: '/tools/water-reflection',
  }),

  videoCard('img-stack', {
    content: '/thumbnails/image_stack.mp4',
    title: 'Image Stack',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/img-stack',
  }),
  videoCard('img-tiles', {
    content: '/thumbnails/imgtile.mp4',
    title: 'Image Tiles',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/img-tiles',
  }),
  videoCard('img-light', {
    content: '/thumbnails/image_spotlight.mp4',
    title: 'Image Light',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/img-light',
  }),
  videoCard('img-sphere', {
    content: '/thumbnails/image_sphere.mp4',
    title: 'Image Sphere',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/img-sphere',
  }),
  videoCard('img-loading', {
    content: '/thumbnails/img-loading.mp4',
    title: 'Image Loading',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/img-loading',
  }),
  videoCard('chat-interface', {
    content: '/thumbnails/chat.mp4',
    title: 'Chat Interface',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/chat-interface',
  }),
  componentCard('vision-scene', 'VisionScene', {
    title: 'Vision Scene',
    size: { width: 240, height: 170 },
    link: '/ui-interactions/vision-scene',
    backgroundColor: '#faf5ff',
  }),
  componentCard('coinflip', 'CoinFlip', {
    title: 'Coin Flip',
    size: { width: 240, height: 170 },
    link: '/svg-animations/coinflip',
    backgroundColor: '#f8fafc',
  }),
  videoCard('comet', {
    content: '/thumbnails/comet.mp4',
    title: 'Comet Hero',
    size: { width: 240, height: 170 },
    link: '/svg-animations/comethero',
  }),
];
