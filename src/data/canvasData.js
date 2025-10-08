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

const createArrow = (id, direction, position, rotation = -20) => ({
  id: `${id}-arrow`,
  contentType: 'arrow',
  content: direction,
  title: 'Arrow',
  position,
  size: { width: 150, height: 50 },
  rotation,
  clickable: false,
  shadow: false,
  background: false,
  padding: 0,
});

// Canvas items with grouped layout
export const canvasItems = [
  // ==================== GROUP 1: EXPERIMENTS (Top Left) ====================
  createGroupTitle('experiments', 'Experiments', { x: 157, y: 145 }),
  createArrow('experiments', 'spec-left', { x: 150, y: 215 }),

  createImageCard('fish', {
    content: '/thumbnails/fish.gif',
    title: 'A School of Fish',
    position: { x: -120, y: 75 },
    size: { width: 280, height: 200 },
    rotation: -2,
    link: '/experiences/fish',
    hoverRotation: 2,
  }),

  createComponentCard('clock', 'Clock', {
    componentProps: { size: 180, timeZoneOffset: 0 },
    title: 'World Clock',
    position: { x: -95, y: 305 },
    size: { width: 220, height: 220 },
    rotation: -3,
    link: '/experiences/clock',
    backgroundColor: '#1e293b',
    hoverRotation: 3,
  }),

  createVideoCard('cars', {
    content: '/thumbnails/slate_config.mp4',
    title: 'Car Configuration',
    position: { x: 152, y: 296 },
    size: { width: 280, height: 200 },
    rotation: -1,
    link: '/experiences/slate-cars',
    hoverRotation: -2,
  }),

  // ==================== GROUP 2: TOOLS (Top Right) ====================
  createGroupTitle('tools', 'Tools', { x: 590, y: 321 }, 200),
  createArrow('tools', 'spec-right', { x: 700, y: 390 }, 20),

  createImageCard('mosaic', {
    content: '/thumbnails/mosaic.png',
    title: 'Image Mosaic',
    position: { x: 868, y: 280 },
    size: { width: 250, height: 180 },
    rotation: -2,
    link: '/tools/img-mosaic',
    hoverRotation: 3,
  }),

  createImageCard('writing', {
    content: '/thumbnails/mosaic.png',
    title: 'Draw Canvas',
    position: { x: 776, y: 490 },
    size: { width: 250, height: 180 },
    rotation: 5,
    link: '/tools/draw-canvas',
    hoverRotation: -3,
  }),


  // ==================== GROUP 3: INTERACTIONS (Bottom Left) ====================
  createGroupTitle('interactions', 'React Components', { x: 190, y: 630 }, 320),
  createArrow('interactions', 'down-left', { x: 168, y: 700 }),

  createVideoCard('img-stack', {
    content: '/thumbnails/image_stack.mp4',
    title: 'Image Stack',
    position: { x: -90, y: 677 },
    size: { width: 240, height: 170 },
    rotation: 5,
    link: '/ui-interactions/img-stack',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createImageCard('img-tiles', {
    content: '/thumbnails/mosaic.png',
    title: 'Image Tiles',
    position: { x: 173, y: 791 },
    size: { width: 240, height: 170 },
    rotation: 3,
    link: '/ui-interactions/img-tiles',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createVideoCard('img-light', {
    content: '/thumbnails/image_spotlight.mp4',
    title: 'Image Light',
    position: { x: -141, y: 888 },
    size: { width: 240, height: 170 },
    rotation: 3,
    link: '/ui-interactions/img-light',
    openInNewTab: false,
    hoverRotation: -3,
  }),

  createVideoCard('img-sphere', {
    content: '/thumbnails/image_sphere.mp4',
    title: 'Image Sphere',
    position: { x: 119, y: 982 },
    size: { width: 240, height: 170 },
    rotation: 2,
    link: '/ui-interactions/img-sphere',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createImageCard('img-loading', {
    content: '/thumbnails/mosaic.png',
    title: 'Image Loading',
    position: { x: -157, y: 1100 },
    size: { width: 240, height: 170 },
    rotation: -1,
    link: '/ui-interactions/img-loading',
    openInNewTab: false,
    hoverRotation: 2,
  }),

  createImageCard('chat-interface', {
    content: '/thumbnails/mosaic.png',
    title: 'Chat Interface',
    position: { x: -40, y: 1210 },
    size: { width: 240, height: 170 },
    rotation: 4,
    link: '/ui-interactions/chat-interface',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  // ==================== GROUP 4: SVG ANIMATIONS (Bottom Right) ====================
  createGroupTitle('svg', 'SVG Animations', { x: 537, y: 867 }, 380),
  createArrow('svg', 'down-right', { x: 775, y: 954 }),

  createImageCard('gradient', {
    content: '/thumbnails/mosaic.png', // TODO: Replace with actual coinflip thumbnail
    title: 'Gradient Hero',
    position: { x: 959, y: 862 },
    size: { width: 240, height: 170 },
    rotation: 1,
    link: '/svg-animations/coinflip',
    openInNewTab: false,
    hoverRotation: -2,
  }),

  createVideoCard('comet', {
    content: '/thumbnails/comet.mp4',
    title: 'Comet Hero',
    position: { x: 845, y: 1066 },
    size: { width: 240, height: 170 },
    rotation: 1,
    link: '/svg-animations/comethero',
    openInNewTab: false,
    hoverRotation: -2,
  }),
];
