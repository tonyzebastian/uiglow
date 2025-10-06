"use client"

import { useState, useEffect, useRef } from 'react'

export default function ImageLoader({
  src,
  alt = "",
  gridSize = 20,
  cellShape = "circle",
  cellGap = 2,
  cellColor = "#cbd5e1",
  blinkSpeed = 1000,
  transitionDuration = 800,
  fadeOutDuration = 600,
  loadingDelay = 1500,
  onLoad = () => {},
  className = "",
  width,
  height
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [gridCells, setGridCells] = useState([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const imageLoadedRef = useRef(false)
  const hasInitializedRef = useRef(false)

  // Initialize dimensions from image element or props
  useEffect(() => {
    if (!hasInitializedRef.current && imageRef.current) {
      // Try to get dimensions from the image element
      const img = imageRef.current
      if (img.complete && img.naturalWidth > 0) {
        // Image already loaded, use its dimensions
        const w = img.offsetWidth || parseInt(width) || img.naturalWidth
        const h = img.offsetHeight || parseInt(height) || img.naturalHeight
        setDimensions({ width: w, height: h })
        hasInitializedRef.current = true
      } else {
        // Use prop dimensions or default
        const w = parseInt(width) || 800
        const h = parseInt(height) || 600
        setDimensions({ width: w, height: h })
        hasInitializedRef.current = true
      }
    }
  }, [width, height])

  // Generate grid when dimensions are set
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const cellWithGap = gridSize + cellGap
    const cols = Math.ceil(dimensions.width / cellWithGap) + 1
    const rows = Math.ceil(dimensions.height / cellWithGap) + 1

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

    const processImage = () => {
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
    }

    // Apply loading delay if specified, otherwise load immediately
    if (loadingDelay > 0) {
      setTimeout(processImage, loadingDelay)
    } else {
      processImage()
    }
  }

  // Get animation style for each cell
  const getAnimationStyle = (cell) => {
    if (isLoading) {
      return {
        animation: `blink ${blinkSpeed}ms infinite`,
        animationDelay: `${cell.blinkDelay}ms`,
        backgroundColor: cellColor,
        width: gridSize,
        height: gridSize
      }
    }

    if (isTransitioning) {
      return {
        backgroundColor: cell.color,
        transition: `background-color ${transitionDuration}ms ease, width ${transitionDuration}ms ease, height ${transitionDuration}ms ease, left ${transitionDuration}ms ease, top ${transitionDuration}ms ease`,
        width: gridSize + cellGap,
        height: gridSize + cellGap,
        left: cell.x - (cellGap / 2),
        top: cell.y - (cellGap / 2)
      }
    }

    if (isFadingOut) {
      return {
        backgroundColor: cell.color,
        opacity: 0,
        transition: `opacity ${fadeOutDuration}ms ease`,
        transitionDelay: `${cell.fadeDelay}ms`,
        width: gridSize + cellGap,
        height: gridSize + cellGap,
        left: cell.x - (cellGap / 2),
        top: cell.y - (cellGap / 2)
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

      {/* Container with fixed aspect ratio */}
      <div
        className="relative overflow-hidden mx-auto"
        style={{
          width: width || '100%',
          height: height || 'auto',
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          backgroundColor: isLoading ? 'transparent' : 'transparent'
        }}
      >
        {/* Grid Overlay */}
        {gridCells.length > 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {gridCells.map(cell => (
              <div
                key={cell.id}
                className={cellShape === 'circle' ? 'rounded-full' : 'rounded'}
                style={{
                  position: 'absolute',
                  left: cell.x,
                  top: cell.y,
                  willChange: 'opacity, background-color, width, height, left, top',
                  ...getAnimationStyle(cell)
                }}
              />
            ))}
          </div>
        )}

        {/* Actual Image */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: isFadingOut ? 1 : 0,
            transition: 'opacity 300ms ease'
          }}
          onLoad={handleImageLoad}
        />
      </div>
    </div>
  )
}
