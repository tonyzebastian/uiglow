'use client';

import { useRef, useEffect } from 'react';
import AppHeader from '@/components/core/AppHeader';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse SVG string and extract all path elements
 */
function extractPathsFromSVG(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const paths = doc.querySelectorAll('path');
  return Array.from(paths);
}

/**
 * Sample points evenly along an SVG path
 */
function samplePointsFromPath(pathElement, numPoints) {
  const points = [];
  const pathLength = pathElement.getTotalLength();

  for (let i = 0; i < numPoints; i++) {
    const distance = (i / (numPoints - 1)) * pathLength;
    const point = pathElement.getPointAtLength(distance);
    points.push({ x: point.x, y: point.y });
  }

  return points;
}

/**
 * Calculate bounding box for an array of points
 */
function getPathBounds(points) {
  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  points.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Scale and center points to fit within canvas dimensions
 */
function scaleAndCenterPoints(points, canvasWidth, canvasHeight, padding = 0.2) {
  if (points.length === 0) return [];

  const bounds = getPathBounds(points);

  // Calculate available space with padding
  const availableWidth = canvasWidth * (1 - padding * 2);
  const availableHeight = canvasHeight * (1 - padding * 2);

  // Calculate scale to fit (maintaining aspect ratio)
  const scaleX = availableWidth / bounds.width;
  const scaleY = availableHeight / bounds.height;
  const scale = Math.min(scaleX, scaleY);

  // Calculate offsets to center
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;
  const offsetX = (canvasWidth - scaledWidth) / 2 - bounds.minX * scale;
  const offsetY = (canvasHeight - scaledHeight) / 2 - bounds.minY * scale;

  // Transform all points
  return points.map(point => ({
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY
  }));
}

// ==================== PARTICLE CLASS ====================

class Particle {
  constructor(canvasWidth, canvasHeight, isLogoParticle = false, targetPosition = null) {
    // Random starting position
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;

    // Random initial velocity
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;

    // Logo particle properties
    this.isLogoParticle = isLogoParticle;
    this.target = targetPosition; // {x, y} or null

    // Canvas bounds
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Update particle with random wandering movement
   */
  updateRandom(speed) {
    // Add small random changes to velocity
    this.vx += (Math.random() - 0.5) * 0.1 * speed;
    this.vy += (Math.random() - 0.5) * 0.1 * speed;

    // Limit max speed
    const maxSpeed = 2 * speed;
    const currentSpeed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    if (this.x < 0) this.x = this.canvasWidth;
    if (this.x > this.canvasWidth) this.x = 0;
    if (this.y < 0) this.y = this.canvasHeight;
    if (this.y > this.canvasHeight) this.y = 0;
  }

  /**
   * Update particle with spring physics toward target
   */
  updateTowardsTarget(attractionStrength, damping) {
    if (!this.target) return;

    // Calculate distance to target
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;

    // Apply force proportional to distance (spring physics)
    this.vx += dx * attractionStrength;
    this.vy += dy * attractionStrength;

    // Apply damping for smoothness
    this.vx *= damping;
    this.vy *= damping;

    // Update position
    this.x += this.vx;
    this.y += this.vy;
  }

  /**
   * Draw particle on canvas
   */
  draw(ctx, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ==================== COMPONENT ====================

// UIGlow lightning bolt logo (icon variant)
const defaultLogoSVG = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.4645 23C13.2545 23 13.0473 22.9807 12.8465 22.9441C11.5014 22.6993 10.1444 21.6026 10.1444 19.7056V13.8429H4.2955C2.3966 13.8438 1.29998 12.4859 1.05517 11.1399C0.810358 9.79479 1.35867 8.13886 3.1347 7.46952L18.1664 1.24101C19.517 0.732131 20.9602 1.04296 21.9587 2.04238C22.959 3.04181 23.2699 4.48409 22.7711 5.80626L16.5086 20.8957C15.9484 22.382 14.6638 23 13.4645 23Z" />
  </svg>
`;

export function ParticleLogoReveal({
  svgCode = defaultLogoSVG,
  width = 240,
  height = 170,
  particleCount = 250,
  logoParticleCount = 50,
  particleSize = 1.8,
  particleColor = '#334155',
  speed = 0.5,
  attractionStrength = 0.08,
  damping = 0.85
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const isHoveredRef = useRef(false);

  // Initialize particles on mount
  useEffect(() => {
    if (!svgCode) return;

    try {
      // Extract paths from SVG
      const paths = extractPathsFromSVG(svgCode);
      if (paths.length === 0) {
        console.warn('No paths found in SVG');
        return;
      }

      // Sample points from all paths
      const pointsPerPath = Math.ceil(logoParticleCount / paths.length);
      let allPoints = [];
      paths.forEach(path => {
        const points = samplePointsFromPath(path, pointsPerPath);
        allPoints = allPoints.concat(points);
      });

      // Trim to exact count needed
      allPoints = allPoints.slice(0, logoParticleCount);

      // Scale and center points to canvas
      const scaledPoints = scaleAndCenterPoints(allPoints, width, height, 0.2);

      // Create logo particles with target positions
      const logoParticles = scaledPoints.map(point =>
        new Particle(width, height, true, point)
      );

      // Create ambient particles (no targets)
      const ambientCount = particleCount - logoParticleCount;
      const ambientParticles = Array.from({ length: ambientCount }, () =>
        new Particle(width, height, false, null)
      );

      // Combine and store
      particlesRef.current = [...logoParticles, ...ambientParticles];
    } catch (error) {
      console.error('Error initializing particles:', error);
    }
  }, [svgCode, width, height, particleCount, logoParticleCount]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw each particle
      particlesRef.current.forEach(particle => {
        if (isHoveredRef.current && particle.isLogoParticle) {
          particle.updateTowardsTarget(attractionStrength, damping);
        } else {
          particle.updateRandom(speed);
        }
        particle.draw(ctx, particleSize, particleColor);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, particleSize, particleColor, speed, attractionStrength, damping]);

  // Event handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer rounded-lg"
    />
  );
}

// ==================== PAGE ====================

// UIGlow lightning bolt logo (icon variant)
const uiglowLogoSVG = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.4645 23C13.2545 23 13.0473 22.9807 12.8465 22.9441C11.5014 22.6993 10.1444 21.6026 10.1444 19.7056V13.8429H4.2955C2.3966 13.8438 1.29998 12.4859 1.05517 11.1399C0.810358 9.79479 1.35867 8.13886 3.1347 7.46952L18.1664 1.24101C19.517 0.732131 20.9602 1.04296 21.9587 2.04238C22.959 3.04181 23.2699 4.48409 22.7711 5.80626L16.5086 20.8957C15.9484 22.382 14.6638 23 13.4645 23Z" />
  </svg>
`;

export default function ParticleLogoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader variant="secondary" title="Particle Logo Reveal" />

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 inline-block">
            <ParticleLogoReveal
              svgCode={uiglowLogoSVG}
              width={600}
              height={400}
              particleCount={400}
              logoParticleCount={80}
              particleSize={2.5}
              particleColor="#334155"
              speed={0.5}
              attractionStrength={0.08}
              damping={0.85}
            />
          </div>
          <p className="mt-6 text-slate-600 text-lg">
            Hover over the canvas to reveal the logo
          </p>
        </div>
      </main>
    </div>
  );
}
