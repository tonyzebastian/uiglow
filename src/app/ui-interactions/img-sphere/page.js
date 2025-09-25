import SphereImageGrid from './SphereImageGrid'

// ==========================================
// EASY CONFIGURATION - Edit these values to customize the component
// ==========================================

// Image data using project assets - duplicated to fill sphere better
const BASE_IMAGES = [
  {
    src: "/ui/imgstack/1.jpg",
    alt: "Image 1",
    title: "Mountain Landscape",
    description: "A beautiful landscape captured at golden hour with mountains in the background."
  },
  {
    src: "/ui/imgstack/2.jpg",
    alt: "Image 2",
    title: "Portrait Photography",
    description: "Stunning portrait photography showcasing natural lighting and composition."
  },
  {
    src: "/ui/imgstack/3.jpg",
    alt: "Image 3",
    title: "Urban Architecture",
    description: "Modern architectural design featuring clean lines and geometric patterns."
  },
  {
    src: "/ui/imgstack/4.jpg",
    alt: "Image 4",
    title: "Nature Scene",
    description: "Peaceful nature scene with vibrant colors and natural beauty."
  },
  {
    src: "/ui/imgstack/5.jpg",
    alt: "Image 5",
    title: "Abstract Art",
    description: "Creative abstract composition with bold colors and unique patterns."
  },
  {
    src: "/ui/imgstack/6.jpg",
    alt: "Image 1",
    title: "Mountain Landscape",
    description: "A beautiful landscape captured at golden hour with mountains in the background."
  },
  {
    src: "/ui/imgstack/7.jpg",
    alt: "Image 2",
    title: "Portrait Photography",
    description: "Stunning portrait photography showcasing natural lighting and composition."
  },
  {
    src: "/ui/imgstack/8.jpg",
    alt: "Image 3",
    title: "Urban Architecture",
    description: "Modern architectural design featuring clean lines and geometric patterns."
  },
  {
    src: "/ui/imgstack/9.jpg",
    alt: "Image 4",
    title: "Nature Scene",
    description: "Peaceful nature scene with vibrant colors and natural beauty."
  },
  {
    src: "/ui/imgstack/10.jpg",
    alt: "Image 5",
    title: "Abstract Art",
    description: "Creative abstract composition with bold colors and unique patterns."
  },
  {
    src: "/ui/imgstack/11.jpg",
    alt: "Image 5",
    title: "Abstract Art",
    description: "Creative abstract composition with bold colors and unique patterns."
  },
  {
    src: "/ui/imgstack/12.jpg",
    alt: "Image 5",
    title: "Abstract Art",
    description: "Creative abstract composition with bold colors and unique patterns."
  }
]

// Generate more images by repeating the base set
const IMAGES = []
for (let i = 0; i < 60; i++) {
  const baseIndex = i % BASE_IMAGES.length
  const baseImage = BASE_IMAGES[baseIndex]
  IMAGES.push({
    id: `img-${i + 1}`,
    ...baseImage,
    alt: `${baseImage.alt} (${Math.floor(i / BASE_IMAGES.length) + 1})`
  })
}

// Component configuration - easily adjustable
const CONFIG = {
  containerSize: 600,          // Container size in pixels
  sphereRadius: 200,           // Virtual sphere radius (increased for better spacing)
  dragSensitivity: 0.8,        // Mouse drag sensitivity (0.1 - 2.0)
  momentumDecay: 0.96,         // How fast momentum fades (0.8 - 0.99)
  maxRotationSpeed: 6,         // Maximum rotation speed (1 - 10)
  baseImageScale: 0.15,        // Base image size (reduced to minimize overlap)
  hoverScale: 1.3,             // Hover scale multiplier (1.0 - 2.0)
  perspective: 1000,           // CSS perspective value (500 - 2000)
  autoRotate: true,            // Enable/disable auto rotation
  autoRotateSpeed: 0.2         // Auto rotation speed (0.1 - 2.0, higher = faster)
}

export default function ImgSpherePage() {
  return (
    <main className="w-full p-6 flex justify-center items-center min-h-screen">
      <SphereImageGrid
        images={IMAGES}
        {...CONFIG}
      />
    </main>
  )
}