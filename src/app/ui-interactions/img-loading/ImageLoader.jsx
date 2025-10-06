"use client"

import { useState, useEffect, useRef } from 'react'

export default function ImageLoader({
  src,
  alt = "",
  gridSize = 20,
  cellShape = "circle",
  cellGap = 2,
  blinkSpeed = 1000,
  transitionDuration = 800,
  fadeOutDuration = 600,
  onLoad = () => {},
  className = ""
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [gridCells, setGridCells] = useState([])
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const imageLoadedRef = useRef(false)

  // Initialize grid immediately with estimated dimensions
  useEffect(() => {
    const cellWithGap = gridSize + cellGap
    const cols = Math.ceil(dimensions.width / cellWithGap)
    const rows = Math.ceil(dimensions.height / cellWithGap)

    const cells = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          id: `${row}-${col}`,
          x: col * cellWithGap,
          y: row * cellWithGap,
          blinkDelay: Math.random() * blinkSpeed,
          fadeDelay: Math.random() * fadeOutDuration,
          color: null
        })
      }
    }

    setGridCells(cells)
  }, [dimensions.width, dimensions.height, gridSize, cellGap, blinkSpeed, fadeOutDuration])

  // Sample color from a region of the canvas
  const sampleColorFromRegion = (canvas, x, y, width, height) => {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(x, y, width, height)
    const data = imageData.data

    let r = 0, g = 0, b = 0, count = 0

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count++
    }

    return `rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`
  }

  // Handle image load
  const handleImageLoad = (e) => {
    if (imageLoadedRef.current) return
    imageLoadedRef.current = true

    const img = e.target

    // Wait a bit to show the loading animation
    setTimeout(() => {
      // Set dimensions based on actual rendered image size
      const width = img.offsetWidth
      const height = img.offsetHeight
      setDimensions({ width, height })

      // Wait for grid to update with new dimensions
      setTimeout(() => {
        // Create off-screen canvas for color sampling
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        // Calculate scale factors
        const scaleX = img.naturalWidth / width
        const scaleY = img.naturalHeight / height

        // Sample colors for each grid cell
        setGridCells(prevCells => prevCells.map(cell => ({
          ...cell,
          color: sampleColorFromRegion(
            canvas,
            Math.floor(cell.x * scaleX),
            Math.floor(cell.y * scaleY),
            Math.floor(gridSize * scaleX),
            Math.floor(gridSize * scaleY)
          )
        })))

        setIsLoading(false)
        setIsTransitioning(true)

        // After transition, start fade out
        setTimeout(() => {
          setIsTransitioning(false)
          setIsFadingOut(true)
        }, transitionDuration)

        onLoad()
      }, 50)
    }, 1500) // Show loading animation for 1.5 seconds
  }

  // Get animation style for each cell
  const getAnimationStyle = (cell) => {
    if (isLoading) {
      return {
        animation: `blink ${blinkSpeed}ms infinite`,
        animationDelay: `${cell.blinkDelay}ms`,
        backgroundColor: '#cbd5e1'
      }
    }

    if (isTransitioning) {
      return {
        backgroundColor: cell.color,
        transition: `background-color ${transitionDuration}ms ease`
      }
    }

    if (isFadingOut) {
      return {
        backgroundColor: cell.color,
        opacity: 0,
        transition: `opacity ${fadeOutDuration}ms ease`,
        transitionDelay: `${cell.fadeDelay}ms`
      }
    }

    return {}
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Grid Overlay */}
      {gridCells.length > 0 && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {gridCells.map(cell => (
            <div
              key={cell.id}
              className={cellShape === 'circle' ? 'rounded-full' : 'rounded'}
              style={{
                position: 'absolute',
                left: cell.x,
                top: cell.y,
                width: gridSize,
                height: gridSize,
                willChange: 'opacity, background-color',
                ...getAnimationStyle(cell)
              }}
            />
          ))}
        </div>
      )}

      {/* Actual Image - hidden while loading */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        className="w-full h-auto object-cover"
        style={{
          opacity: isFadingOut ? 1 : 0,
          transition: 'opacity 300ms ease',
          visibility: isLoading ? 'hidden' : 'visible'
        }}
        onLoad={handleImageLoad}
      />

      {/* Placeholder for layout while loading */}
      {isLoading && (
        <div
          className="w-full bg-slate-900"
          style={{
            paddingBottom: `${(dimensions.height / dimensions.width) * 100}%`
          }}
        />
      )}
    </div>
  )
}
