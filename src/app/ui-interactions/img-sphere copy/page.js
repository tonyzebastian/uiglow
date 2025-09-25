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
    src: "/ui/imgtiles/left.jpg",
    alt: "Image 6",
    title: "Artistic Expression",
    description: "Expressive artwork showcasing creative vision and artistic technique."
  },
  {
    src: "/ui/imgtiles/middle.jpg",
    alt: "Image 7",
    title: "Central Focus",
    description: "Centered composition with strong focal point and balanced elements."
  },
  {
    src: "/ui/imgtiles/right.jpg",
    alt: "Image 8",
    title: "Dynamic Composition",
    description: "Dynamic visual composition with movement and energy."
  },
  {
    src: "/slate/car_102.jpg",
    alt: "Image 9",
    title: "Automotive Design",
    description: "Sleek automotive design showcasing modern engineering and style."
  },
  {
    src: "/slate/car_116.jpg",
    alt: "Image 10",
    title: "Vehicle Excellence",
    description: "Premium vehicle showcasing luxury and performance design."
  }
]

// Generate more images by repeating the base set
const IMAGES = []
for (let i = 0; i < 50; i++) {
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
  sphereRadius: 220,           // Virtual sphere radius (increased for better spacing)
  dragSensitivity: 0.8,        // Mouse drag sensitivity (0.1 - 2.0)
  momentumDecay: 0.96,         // How fast momentum fades (0.8 - 0.99)
  maxRotationSpeed: 6,         // Maximum rotation speed (1 - 10)
  baseImageScale: 0.15,        // Base image size (reduced to minimize overlap)
  hoverScale: 1.3,             // Hover scale multiplier (1.0 - 2.0)
  perspective: 1000            // CSS perspective value (500 - 2000)
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