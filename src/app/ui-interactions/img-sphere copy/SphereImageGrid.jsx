'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'

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
  const [rotation, setRotation] = useState({ x: 15, y: 15, z: 0 })
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

    // Better distribution using golden ratio spiral for front hemisphere
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians

    for (let i = 0; i < imageCount; i++) {
      // Distribute around Y axis (horizontal rotation) with golden ratio
      const theta = (goldenAngle * i * 180) / Math.PI % 360

      // Distribute vertically with more spacing, focusing on front hemisphere
      const rings = Math.ceil(Math.sqrt(imageCount))
      const ringIndex = Math.floor(i / Math.ceil(imageCount / rings))

      // Map to front-focused angles (30 to 150 degrees, with 90 being front center)
      const phi = 30 + (ringIndex / (rings - 1)) * 120

      // Add some variation within rings to prevent perfect alignment
      const variation = ((i % 7) - 3) * 5 // ±15 degree variation
      const finalPhi = Math.max(30, Math.min(150, phi + variation))

      positions.push({
        theta: theta,
        phi: finalPhi,
        radius: actualSphereRadius
      })
    }

    return positions
  }, [images.length, actualSphereRadius])

  const calculateWorldPositions = useCallback(() => {
    return imagePositions.map((pos, index) => {
      // Apply current rotation to base position
      const rotatedTheta = pos.theta + rotation.y
      const rotatedPhi = pos.phi + rotation.x

      // Convert to cartesian coordinates
      const worldPos = SPHERE_MATH.sphericalToCartesian(
        pos.radius,
        SPHERE_MATH.degreesToRadians(rotatedTheta),
        SPHERE_MATH.degreesToRadians(rotatedPhi)
      )

      // Only show images on the front hemisphere (positive Z)
      const isVisible = worldPos.z > -50 // Small buffer to prevent popping

      // Calculate distance from center for scaling
      const distanceFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.y * worldPos.y)
      const maxDistance = actualSphereRadius
      const distanceRatio = Math.min(distanceFromCenter / maxDistance, 1)

      // Scale based on distance from center (closer to edge = smaller)
      const centerScale = Math.max(0.3, 1 - distanceRatio * 0.7)

      // Also consider Z-depth for additional scaling
      const depthScale = (worldPos.z + actualSphereRadius) / (2 * actualSphereRadius)
      const scale = centerScale * Math.max(0.5, 0.7 + depthScale * 0.3)

      return {
        ...worldPos,
        scale,
        zIndex: Math.round(1000 + worldPos.z),
        isVisible
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

  // Calculate world positions once per render
  const worldPositions = calculateWorldPositions()

  const renderImageNode = useCallback((image, index) => {
    const position = worldPositions[index]

    if (!position || !position.isVisible) return null

    const imageSize = baseImageSize * position.scale

    return (
      <motion.div
        key={image.id}
        className="absolute cursor-pointer select-none"
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          left: `${containerSize/2 + position.x}px`,
          top: `${containerSize/2 + position.y}px`,
          transform: `translate(-50%, -50%)`,
          zIndex: position.zIndex,
          opacity: position.scale > 0.4 ? 1 : position.scale / 0.4, // Fade out smaller images
        }}
        whileHover={{
          scale: Math.min(1.2, 1.2 / position.scale), // Adjust hover scale based on current scale
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        onClick={() => setSelectedImage(image)}
        variants={ANIMATION_CONFIG.stagger.item}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={`${Math.round(imageSize)}px`}
            className="object-cover"
            draggable={false}
            priority={index < 3}
          />
        </div>
      </motion.div>
    )
  }, [worldPositions, baseImageSize, containerSize])

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
                  priority
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
        <div className="relative w-full h-full">
          {images.map((image, index) => renderImageNode(image, index))}
        </div>
      </motion.div>

      {renderSpotlightModal()}
    </>
  )
}

export default SphereImageGrid