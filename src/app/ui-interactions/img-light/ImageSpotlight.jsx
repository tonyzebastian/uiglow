'use client'
import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';

// Throttle utility function
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

export default function ImageSpotlight({
  src,
  alt,
  orientation = 'landscape',
  width,
  height,
  config = {}
}) {
  // Default configuration
  const defaultConfig = {
    spotlightSize: 80,
    overlayOpacity: 0.6,
    className: ''
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Component state
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef(null);

  // Mouse move handler
  const handleMouseMove = useCallback(
    throttle((event) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      // Update CSS variables for spotlight position
      containerRef.current.style.setProperty('--mouse-x', `${x}%`);
      containerRef.current.style.setProperty('--mouse-y', `${y}%`);
    }, 16), // 60fps throttling
    []
  );

  // Mouse enter handler
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Container classes and inline styles
  const getContainerDimensions = () => {
    // Use provided width/height or fall back to defaults based on orientation
    if (width && height) {
      return {
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%'
      };
    }

    // Default dimensions if no width/height provided
    if (orientation === 'landscape') {
      return {
        width: '800px',
        height: '450px', // 16:9 ratio
        maxWidth: '100%'
      };
    } else {
      return {
        width: '450px',
        height: '600px', // 3:4 ratio
        maxWidth: '100%'
      };
    }
  };

  const containerClasses = `
    relative overflow-hidden cursor-none rounded-lg shadow-md border
    ${finalConfig.className}
  `.trim();

  return (
    <div className="flex items-center justify-center">
      <div
        ref={containerRef}
        className={containerClasses}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label={alt}
        aria-describedby="spotlight-instructions"
        tabIndex={0}
        style={{
          ...getContainerDimensions(),
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          '--spotlight-size': `${finalConfig.spotlightSize}px`,
          '--overlay-opacity': finalConfig.overlayOpacity
        }}
      >
        {/* Hidden instructions for screen readers */}
        <div id="spotlight-instructions" className="sr-only">
          Interactive image with mouse spotlight effect.
          Move your mouse over the image to reveal different areas.
        </div>

        {/* Blurred Base Image - Always visible */}
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover w-full h-full"
          sizes={orientation === 'landscape' ? "(max-width: 768px) 100vw, 800px" : "(max-width: 768px) 100vw, 600px"}
          draggable={false}
          priority
          style={{ filter: 'blur(5px)' }}
        />

        {/* Sharp Image - Only visible through spotlight */}
        <Image
          src={src}
          alt=""
          fill
          className="object-cover w-full h-full"
          sizes={orientation === 'landscape' ? "(max-width: 768px) 100vw, 800px" : "(max-width: 768px) 100vw, 600px"}
          draggable={false}
          style={{
            maskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              black ${finalConfig.spotlightSize * 0.4}px,
              transparent ${finalConfig.spotlightSize * 1.6}px
            )`,
            WebkitMaskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              black ${finalConfig.spotlightSize * 0.4}px,
              transparent ${finalConfig.spotlightSize * 1.6}px
            )`,
            zIndex: 2
          }}
        />

        {/* Main Dark Overlay with Current Spotlight Position */}
        <div
          className="absolute inset-0 bg-black will-change-[mask-position] transition-all duration-100 ease-out"
          style={{
            opacity: finalConfig.overlayOpacity,
            maskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              transparent ${finalConfig.spotlightSize * 0.4}px,
              black ${finalConfig.spotlightSize * 1.6}px
            )`,
            WebkitMaskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              transparent ${finalConfig.spotlightSize * 0.4}px,
              black ${finalConfig.spotlightSize * 1.6}px
            )`,
            zIndex: 10
          }}
        />

      </div>
    </div>
  );
}