# 3D Spherical Image Grid Component - Complete Technical Documentation



## Component API

### Props Interface
```javascript
<SphereImageGrid 
  images={imageArray}
  containerSize={400}
  sphereRadius={200}
  dragSensitivity={0.5}
  momentumDecay={0.95}
  maxRotationSpeed={5}
  baseImageScale={0.12}
  hoverScale={1.2}
  perspective={1000}
/>
```

### Image Data Structure
```javascript
const imageArray = [
  {
    id: "unique-id-1",
    src: "/images/image1.jpg",
    alt: "Description for accessibility",
    title: "Image Title",
    description: "Detailed description for spotlight modal"
  },
  // ... 11 more images for total of 12
]
```

## Page Implementation (pages/index.js)

```javascript
import { useState } from 'react'
import SphereImageGrid from '../components/SphereImageGrid'

// Default image data - easily configurable
const DEFAULT_IMAGES = [
  {
    id: "img-1",
    src: "https://picsum.photos/400/400?random=1",
    alt: "Random image 1",
    title: "Landscape View",
    description: "A beautiful landscape captured at golden hour with mountains in the background."
  },
  {
    id: "img-2", 
    src: "https://picsum.photos/400/400?random=2",
    alt: "Random image 2",
    title: "Urban Architecture",
    description: "Modern architectural design featuring clean lines and geometric patterns."
  },
  // ... continue for 12 total images
]

// Configuration controls - easily adjustable
const DEFAULT_CONFIG = {
  containerSize: 400,
  sphereRadius: 200,
  dragSensitivity: 0.5,
  momentumDecay: 0.95,
  maxRotationSpeed: 5,
  baseImageScale: 0.12,
  hoverScale: 1.2,
  perspective: 1000
}

export default function HomePage() {
  const [images, setImages] = useState(DEFAULT_IMAGES)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [showControls, setShowControls] = useState(false)

  // Easy configuration updates
  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // Easy image management
  const updateImageUrl = (index, newUrl) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, src: newUrl } : img
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-8">3D Sphere Image Grid</h1>
      
      {/* Main Component */}
      <div className="mb-8">
        <SphereImageGrid 
          images={images}
          {...config}
        />
      </div>

      {/* Control Panel Toggle */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </button>

      {/* Configuration Controls */}
      {showControls && (
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4">Configuration Controls</h2>
          
          {/* Size Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Container Size</label>
              <input
                type="range"
                min="300"
                max="600"
                value={config.containerSize}
                onChange={(e) => updateConfig('containerSize', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.containerSize}px</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Drag Sensitivity</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={config.dragSensitivity}
                onChange={(e) => updateConfig('dragSensitivity', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.dragSensitivity}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Momentum Decay</label>
              <input
                type="range"
                min="0.8"
                max="0.99"
                step="0.01"
                value={config.momentumDecay}
                onChange={(e) => updateConfig('momentumDecay', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.momentumDecay}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Rotation Speed</label>
              <input
                type="range"
                min="1"
                max="10"
                value={config.maxRotationSpeed}
                onChange={(e) => updateConfig('maxRotationSpeed', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.maxRotationSpeed}</span>
            </div>
          </div>

          {/* Image URL Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Image URLs (Quick Edit)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {images.slice(0, 6).map((img, index) => (
                <div key={img.id} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12">#{index + 1}</span>
                  <input
                    type="text"
                    value={img.src}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    placeholder="Image URL"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setConfig(DEFAULT_CONFIG)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset to Default
            </button>
            <button
              onClick={() => updateConfig('containerSize', 600)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Large Size
            </button>
            <button
              onClick={() => updateConfig('dragSensitivity', 1.5)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              High Sensitivity
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Component Implementation (components/SphereImageGrid.js)

### Complete File Structure
```javascript
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================

const SPHERE_MATH = {
  degreesToRadians: (degrees) => degrees * (Math.PI / 180),
  radiansToDegrees: (radians) => radians * (180 / Math.PI),
  
  sphericalToCartesian: (radius, theta, phi) => ({
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  }),
  
  calculateDistance: (pos, center = { x: 0, y: 0, z: 0 }) => {
    const dx = pos.x - center.x
    const dy = pos.y - center.y  
    const dz = pos.z - center.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  },

  normalizeAngle: (angle) => {
    while (angle > 180) angle -= 360
    while (angle < -180) angle += 360
    return angle
  }
}

const ANIMATION_CONFIG = {
  hover: {
    scale: 1.2,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  modal: {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    content: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
      transition: { type: "spring", stiffness: 300 }
    }
  },
  stagger: {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    },
    item: {
      hidden: { opacity: 0, scale: 0 },
      show: { 
        opacity: 1, 
        scale: 1,
        transition: { type: "spring", stiffness: 300 }
      }
    }
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

const SphereImageGrid = ({
  images = [],
  containerSize = 400,
  sphereRadius = 200,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseImageScale = 0.12,
  hoverScale = 1.2,
  perspective = 1000
}) => {

  // ==========================================
  // STATE & REFS
  // ==========================================
  
  const [isMounted, setIsMounted] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePositions, setImagePositions] = useState([])

  const containerRef = useRef(null)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const animationFrame = useRef(null)

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  
  const actualSphereRadius = sphereRadius || containerSize * 0.5
  const baseImageSize = containerSize * baseImageScale

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  
  const generateSpherePositions = useCallback(() => {
    const positions = []
    const imageCount = images.length
    
    // Distribute images evenly on sphere using golden ratio
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    
    for (let i = 0; i < imageCount; i++) {
      const theta = 2 * Math.PI * i / goldenRatio
      const phi = Math.acos(1 - 2 * (i + 0.5) / imageCount)
      
      positions.push({
        theta: SPHERE_MATH.radiansToDegrees(theta),
        phi: SPHERE_MATH.radiansToDegrees(phi),
        radius: actualSphereRadius
      })
    }
    
    return positions
  }, [images.length, actualSphereRadius])

  const calculateWorldPositions = useCallback(() => {
    return imagePositions.map(pos => {
      // Apply current rotation to base position
      const rotatedTheta = pos.theta + rotation.y
      const rotatedPhi = pos.phi + rotation.x
      
      // Convert to cartesian coordinates
      const worldPos = SPHERE_MATH.sphericalToCartesian(
        pos.radius,
        SPHERE_MATH.degreesToRadians(rotatedTheta),
        SPHERE_MATH.degreesToRadians(rotatedPhi)
      )
      
      // Calculate distance from center for scaling
      const distance = SPHERE_MATH.calculateDistance(worldPos)
      const normalizedDistance = distance / actualSphereRadius
      const scale = Math.max(0.4, 1 - (normalizedDistance * 0.6))
      
      return {
        ...worldPos,
        scale,
        zIndex: Math.round(1000 + worldPos.z)
      }
    })
  }, [imagePositions, rotation, actualSphereRadius])

  const clampRotationSpeed = useCallback((speed) => {
    return Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, speed))
  }, [maxRotationSpeed])

  // ==========================================
  // PHYSICS & MOMENTUM
  // ==========================================
  
  const updateMomentum = useCallback(() => {
    if (isDragging) return

    setVelocity(prev => {
      const newVelocity = {
        x: prev.x * momentumDecay,
        y: prev.y * momentumDecay
      }
      
      // Stop animation if velocity is too low
      if (Math.abs(newVelocity.x) < 0.01 && Math.abs(newVelocity.y) < 0.01) {
        return { x: 0, y: 0 }
      }
      
      return newVelocity
    })
    
    setRotation(prev => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(velocity.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(velocity.y)),
      z: prev.z
    }))
  }, [isDragging, momentumDecay, velocity, clampRotationSpeed])

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    setVelocity({ x: 0, y: 0 })
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - lastMousePos.current.x
    const deltaY = e.clientY - lastMousePos.current.y
    
    const rotationDelta = {
      x: -deltaY * dragSensitivity,
      y: deltaX * dragSensitivity
    }
    
    setRotation(prev => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
      z: prev.z
    }))
    
    // Update velocity for momentum
    setVelocity({
      x: clampRotationSpeed(rotationDelta.x),
      y: clampRotationSpeed(rotationDelta.y)
    })
    
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }, [isDragging, dragSensitivity, clampRotationSpeed])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    setVelocity({ x: 0, y: 0 })
    lastMousePos.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - lastMousePos.current.x
    const deltaY = touch.clientY - lastMousePos.current.y
    
    const rotationDelta = {
      x: -deltaY * dragSensitivity,
      y: deltaX * dragSensitivity
    }
    
    setRotation(prev => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
      z: prev.z
    }))
    
    setVelocity({
      x: clampRotationSpeed(rotationDelta.x),
      y: clampRotationSpeed(rotationDelta.y)
    })
    
    lastMousePos.current = { x: touch.clientX, y: touch.clientY }
  }, [isDragging, dragSensitivity, clampRotationSpeed])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ==========================================
  // EFFECTS & LIFECYCLE
  // ==========================================
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setImagePositions(generateSpherePositions())
  }, [generateSpherePositions])

  useEffect(() => {
    const animate = () => {
      updateMomentum()
      animationFrame.current = requestAnimationFrame(animate)
    }
    
    if (isMounted) {
      animationFrame.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [isMounted, updateMomentum])

  useEffect(() => {
    if (!isMounted) return

    const container = containerRef.current
    if (!container) return

    // Mouse events
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseUp)
    
    // Touch events
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseUp)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMounted, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  
  const renderImageNode = useCallback((image, index) => {
    const worldPositions = calculateWorldPositions()
    const position = worldPositions[index]
    
    if (!position) return null

    const imageSize = baseImageSize * position.scale
    
    return (
      <motion.div
        key={image.id}
        className="absolute cursor-pointer select-none"
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px) translate(-50%, -50%)`,
          zIndex: position.zIndex,
          left: '50%',
          top: '50%',
        }}
        whileHover={ANIMATION_CONFIG.hover}
        onClick={() => setSelectedImage(image)}
        variants={ANIMATION_CONFIG.stagger.item}
      >
        <div className="w-full h-full rounded-full overflow-hidden shadow-lg">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={`${Math.round(imageSize)}px`}
            className="object-cover"
            draggable={false}
          />
        </div>
      </motion.div>
    )
  }, [calculateWorldPositions, baseImageSize])

  const renderSpotlightModal = () => {
    return (
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
            {...ANIMATION_CONFIG.modal.backdrop}
          >
            <motion.div
              className="bg-white rounded-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              {...ANIMATION_CONFIG.modal.content}
            >
              <div className="relative aspect-square">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full text-white flex items-center justify-center hover:bg-opacity-70 transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-gray-600">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // ==========================================
  // EARLY RETURNS
  // ==========================================
  
  if (!isMounted) {
    return (
      <div 
        className="bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!images.length) {
    return (
      <div 
        className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-gray-400 text-center">
          <p>No images provided</p>
          <p className="text-sm">Add images to the images prop</p>
        </div>
      </div>
    )
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  
  return (
    <>
      <motion.div
        ref={containerRef}
        className="relative select-none cursor-grab active:cursor-grabbing"
        style={{
          width: containerSize,
          height: containerSize,
          perspective: `${perspective}px`
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        variants={ANIMATION_CONFIG.stagger.container}
        initial="hidden"
        animate="show"
      >
        <div 
          className="relative w-full h-full"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
          }}
        >
          {images.map((image, index) => renderImageNode(image, index))}
        </div>
      </motion.div>
      
      {renderSpotlightModal()}
    </>
  )
}

export default SphereImageGrid
```


## Configuration Variables Reference

### Essential Props
- `images`: Array of image objects (required)
- `containerSize`: Container dimensions in pixels (default: 400)
- `sphereRadius`: Virtual sphere radius (default: 200)

### Physics Controls
- `dragSensitivity`: Mouse movement multiplier (default: 0.5)
- `momentumDecay`: Velocity decay rate (default: 0.95)
- `maxRotationSpeed`: Max rotation speed in degrees (default: 5)

### Visual Controls
- `baseImageScale`: Base image size ratio (default: 0.12)
- `hoverScale`: Hover scale multiplier (default: 1.2)
- `perspective`: CSS perspective value (default: 1000)