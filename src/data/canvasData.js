// Factory functions for creating canvas items with sensible defaults
const createCard = (id, overrides) => ({
  id,
  clickable: true,
  shadow: true,
  background: true,
  padding: 4,
  rotation: 0,
  hoverRotation: 0,
  openInNewTab: true,
  ...overrides,
});

const createImageCard = (id, opts) => createCard(id, {
  contentType: 'image',
  ...opts,
});

const createVideoCard = (id, opts) => createCard(id, {
  contentType: 'video',
  ...opts,
});

const createComponentCard = (id, component, opts) => createCard(id, {
  contentType: 'component',
  component,
  ...opts,
});

const createGroupTitle = (id, title, position, width = 280) => ({
  id: `${id}-title`,
  contentType: 'group-title',
  content: title,
  title,
  position,
  size: { width, height: 70 },
  rotation: 0,
  clickable: false,
  shadow: false,
  background: false,
  padding: 0,
});

const createArrow = (id, direction, position, rotation = -20, size = { width: 150, height: 50 }) => ({
  id: `${id}-arrow`,
  contentType: 'arrow',
  content: direction,
  title: 'Arrow',
  position,
  size,
  rotation,
  clickable: false,
  shadow: false,
  background: false,
  padding: 0,
});

// Canvas items with grouped layout
export const canvasItems = [
  // ==================== HERO: BREATHING HERO (Center) ====================
  createComponentCard('breathing-hero', 'BreathingHero', {
    title: 'Welcome to UiGlow',
    position: { x: 200, y: 200 },
    size: { width: 600, height: 384 },
    rotation: 0,
    clickable: false,
    shadow: false,
    background: false,
    padding: 0,
    hoverRotation: 0,
  }),

  // ==================== GROUP 1: EXPERIMENTS (Top Left) ====================
  createGroupTitle('experiments', 'Experiments', { x: 12, y: 22 }),
  createArrow('experiments', 'spec-left', { x: -19, y: 86 }),

  createImageCard('fish', {
    content: '/thumbnails/fish.gif',
    title: 'A School of Fish',
    position: { x: -304, y: -56 },
    size: { width: 280, height: 200 },
    rotation: -2,
    link: '/experiences/fish',
    openInNewTab: false,
    hoverRotation: 2,
  }),

  createComponentCard('clock', 'Clock', {
    componentProps: { size: 180, timeZoneOffset: 0 },
    title: 'World Clock',
    position: { x: -364, y: 170 },
    size: { width: 220, height: 220 },
    rotation: -3,
    link: '/experiences/clock',
    backgroundColor: '#006045',
    openInNewTab: false,
    hoverRotation: 3,
  }),

  createVideoCard('cars', {
    content: '/thumbnails/slate_config.mp4',
    title: 'Car Configuration',
    position: { x: -113, y: 164 },
    size: { width: 280, height: 200 },
    rotation: -1,
    link: '/experiences/slate-cars',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  // ==================== GROUP 2: TOOLS (Top Right) ====================
  createGroupTitle('tools', 'Tools', { x: 838, y: 137 }, 200),
  createArrow('tools', 'spec-right', { x: 918, y: 207 }, 20),

  createImageCard('mosaic', {
    content: '/thumbnails/mosaic.jpg',
    title: 'Image Mosaic',
    position: { x: 1053, y: 81 },
    size: { width: 250, height: 180 },
    rotation: -2,
    link: '/tools/img-mosaic',
    openInNewTab: false,
    hoverRotation: 3,
  }),

  createImageCard('writing', {
    content: '/thumbnails/mosaic.png',
    title: 'Draw Canvas',
    position: { x: 989, y: 287 },
    size: { width: 250, height: 180 },
    rotation: 5,
    link: '/tools/draw-canvas',
    hoverRotation: -3,
  }),


  // ==================== GROUP 3: INTERACTIONS (Bottom Left) ====================
  createGroupTitle('interactions', 'React Components', { x: -1, y: 547 }, 320),
  createArrow('interactions', 'spec3-right', { x: 3, y: 603 }, -35, { width: 90, height: 60 }),
  createVideoCard('img-stack', {
    content: '/thumbnails/image_stack.mp4',
    title: 'Image Stack',
    position: { x: -251, y: 555 },
    size: { width: 240, height: 170 },
    rotation: 5,
    link: '/ui-interactions/img-stack',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createVideoCard('img-tiles', {
    content: '/thumbnails/imgtile.mp4',
    title: 'Image Tiles',
    position: { x: 7, y: 675 },
    size: { width: 240, height: 170 },
    rotation: 3,
    link: '/ui-interactions/img-tiles',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createVideoCard('img-light', {
    content: '/thumbnails/image_spotlight.mp4',
    title: 'Image Light',
    position: { x: -269, y: 750 },
    size: { width: 240, height: 170 },
    rotation: 3,
    link: '/ui-interactions/img-light',
    openInNewTab: false,
    hoverRotation: -3,
  }),

  createVideoCard('img-sphere', {
    content: '/thumbnails/image_sphere.mp4',
    title: 'Image Sphere',
    position: { x: -7, y: 878 },
    size: { width: 240, height: 170 },
    rotation: 2,
    link: '/ui-interactions/img-sphere',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createVideoCard('img-loading', {
    content: '/thumbnails/img-loading.mp4',
    title: 'Image Loading',
    position: { x: -289, y: 941 },
    size: { width: 240, height: 170 },
    rotation: -1,
    link: '/ui-interactions/img-loading',
    openInNewTab: false,
    hoverRotation: 2,
  }),

  createVideoCard('chat-interface', {
    content: '/thumbnails/chat.mp4',
    title: 'Chat Interface',
    position: { x: -23, y: 1082 },
    size: { width: 240, height: 170 },
    rotation: 4,
    link: '/ui-interactions/chat-interface',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createComponentCard('particle-logo', 'ParticleLogoReveal', {
    title: 'Particle Logo Reveal',
    position: { x: 263, y: 750 },
    size: { width: 240, height: 170 },
    rotation: -3,
    link: '/ui-interactions/particle-logo',
    backgroundColor: '#ffffff',
    openInNewTab: false,
    hoverRotation: 2,
  }),

  // ==================== GROUP 4: SVG ANIMATIONS (Bottom Right) ====================
  createGroupTitle('svg', 'Untitled', { x: 506, y: 632 }, 380),
  createArrow('svg', 'spec3-left', { x: 688, y: 712 }, 35, { width: 90, height: 60 }),

  createComponentCard('coinflip', 'CoinFlip', {
    title: 'Coin Flip',
    position: { x: 653, y: 852 },
    size: { width: 240, height: 170 },
    rotation: 1,
    link: '/svg-animations/coinflip',
    backgroundColor: '#f8fafc',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createVideoCard('comet', {
    content: '/thumbnails/comet.mp4',
    title: 'Comet Hero',
    position: { x: 821, y: 666 },
    size: { width: 240, height: 170 },
    rotation: 1,
    link: '/svg-animations/comethero',
    openInNewTab: false,
    hoverRotation: -2,
  }),
];
