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
      transition: { ease: "easeOut", duration: 0.3 }
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
        transition: { ease: "easeOut", duration: 0.4 }
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
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.3
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

    // Use Fibonacci sphere distribution for even coverage
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const angleIncrement = 2 * Math.PI / goldenRatio

    for (let i = 0; i < imageCount; i++) {
      // Fibonacci sphere distribution
      const t = i / imageCount
      const inclination = Math.acos(1 - 2 * t)
      const azimuth = angleIncrement * i

      // Convert to degrees and focus on front hemisphere
      let phi = inclination * (180 / Math.PI)
      let theta = (azimuth * (180 / Math.PI)) % 360

      // Better pole coverage - reach poles but avoid extreme mathematical issues
      const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35 // Moderate boost toward poles
      if (phi < 90) {
        phi = Math.max(5, phi - poleBonus) // Reach closer to top pole (15° minimum)
      } else {
        phi = Math.min(175, phi + poleBonus) // Reach closer to bottom pole (165° maximum)
      }

      // Map to fuller vertical range - covers poles but avoids extremes
      phi = 15 + (phi / 180) * 150 // Map to 15-165 degrees for pole coverage with stability

      // Add slight randomization to prevent perfect patterns
      const randomOffset = (Math.random() - 0.) * 20
      theta = (theta + randomOffset) % 360
      phi = Math.max(0, Math.min(180, phi + (Math.random() - 0.5) * 10))

      positions.push({
        theta: theta,
        phi: phi,
        radius: actualSphereRadius
      })
    }

    return positions
  }, [images.length, actualSphereRadius])

  const calculateWorldPositions = useCallback(() => {
    const positions = imagePositions.map((pos, index) => {
      // Apply rotation using proper 3D rotation matrices
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta)
      const phiRad = SPHERE_MATH.degreesToRadians(pos.phi)
      const rotXRad = SPHERE_MATH.degreesToRadians(rotation.x)
      const rotYRad = SPHERE_MATH.degreesToRadians(rotation.y)

      // Initial position on sphere
      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad)
      let y = pos.radius * Math.cos(phiRad)
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad)

      // Apply Y-axis rotation (horizontal drag)
      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad)
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad)
      x = x1
      z = z1

      // Apply X-axis rotation (vertical drag)
      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad)
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad)
      y = y2
      z = z2

      const worldPos = { x, y, z }

      // Calculate visibility with smooth fade zones
      const fadeZoneStart = -10  // Start fading out
      const fadeZoneEnd = -30    // Completely hidden
      const isVisible = worldPos.z > fadeZoneEnd

      // Calculate fade opacity based on Z position
      let fadeOpacity = 1
      if (worldPos.z <= fadeZoneStart) {
        // Linear fade from 1 to 0 as Z goes from fadeZoneStart to fadeZoneEnd
        fadeOpacity = Math.max(0, (worldPos.z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd))
      }

      // Check if this image originated from a pole position
      const isPoleImage = pos.phi < 30 || pos.phi > 150 // Images from extreme angles

      // Calculate distance from center for scaling (in 2D screen space)
      const distanceFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.y * worldPos.y)
      const maxDistance = actualSphereRadius
      const distanceRatio = Math.min(distanceFromCenter / maxDistance, 1)

      // Scale based on distance from center - be more forgiving for pole images
      const distancePenalty = isPoleImage ? 0.4 : 0.7 // Less penalty for pole images
      const centerScale = Math.max(0.3, 1 - distanceRatio * distancePenalty)

      // Also consider Z-depth for additional scaling
      const depthScale = (worldPos.z + actualSphereRadius) / (2 * actualSphereRadius)
      const scale = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3)

      return {
        ...worldPos,
        scale,
        zIndex: Math.round(1000 + worldPos.z),
        isVisible,
        fadeOpacity,
        originalIndex: index
      }
    })

    // Apply collision detection to prevent overlaps
    const adjustedPositions = [...positions]

    for (let i = 0; i < adjustedPositions.length; i++) {
      const pos = adjustedPositions[i]
      if (!pos.isVisible) continue

      let adjustedScale = pos.scale
      const imageSize = baseImageSize * adjustedScale

      // Check for overlaps with other visible images
      for (let j = 0; j < adjustedPositions.length; j++) {
        if (i === j) continue

        const other = adjustedPositions[j]
        if (!other.isVisible) continue

        const otherSize = baseImageSize * other.scale

        // Calculate 2D distance between images on screen
        const dx = pos.x - other.x
        const dy = pos.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Minimum distance to prevent overlap (with more generous padding)
        const minDistance = (imageSize + otherSize) / 2 + 25

        if (distance < minDistance && distance > 0) {
          // More aggressive scale reduction to prevent overlap
          const overlap = minDistance - distance
          const reductionFactor = Math.max(0.4, 1 - (overlap / minDistance) * 0.6)
          adjustedScale = Math.min(adjustedScale, adjustedScale * reductionFactor)
        }
      }

      adjustedPositions[i] = {
        ...pos,
        scale: Math.max(0.25, adjustedScale) // Ensure minimum scale
      }
    }

    return adjustedPositions
  }, [imagePositions, rotation, actualSphereRadius, baseImageSize])

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

      // Stop animation if velocity is too low and auto-rotate is off
      if (!autoRotate && Math.abs(newVelocity.x) < 0.01 && Math.abs(newVelocity.y) < 0.01) {
        return { x: 0, y: 0 }
      }

      return newVelocity
    })

    setRotation(prev => {
      let newY = prev.y

      // Add auto-rotation to Y axis (horizontal rotation)
      if (autoRotate) {
        newY += autoRotateSpeed
      }

      // Add momentum-based rotation
      newY += clampRotationSpeed(velocity.y)

      return {
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(velocity.x)),
        y: SPHERE_MATH.normalizeAngle(newY),
        z: prev.z
      }
    })
  }, [isDragging, momentumDecay, velocity, clampRotationSpeed, autoRotate, autoRotateSpeed])

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
          opacity: position.fadeOpacity,
          transform: `translate(-50%, -50%)`,
          zIndex: position.zIndex
        }}
        whileHover={{
          scale: Math.min(1.2, 1.2 / position.scale), // Adjust hover scale based on current scale
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        onClick={() => setSelectedImage(image)}
        variants={ANIMATION_CONFIG.stagger.item}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg border-2 border-white/20">
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

        <div className="relative w-full h-full" style={{ zIndex: 10 }}>
          {images.map((image, index) => renderImageNode(image, index))}
        </div>
      </motion.div>

      {renderSpotlightModal()}
    </>
  )
}

export default SphereImageGrid