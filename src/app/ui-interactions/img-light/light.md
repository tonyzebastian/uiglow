Interactive Image Spotlight Component - Technical Documentation
Overview
A React component that creates an interactive "flashlight" effect over images, revealing the underlying image through a circular spotlight that follows the mouse cursor and leaves a fading trail. Optimized using CSS masks for maximum performance.
Features

Mouse-following spotlight that reveals image content
Fading trail effect that follows mouse movement
Responsive design supporting both landscape and portrait images
GPU-accelerated animations using CSS transforms and masks
Configurable parameters for customization
Accessibility support with reduced motion preferences


Component Architecture
Core Structure
ImageSpotlight Component
├── Image Container (responsive wrapper)
├── Base Image (hidden beneath overlay)
├── Dark Overlay (with CSS mask)
├── Spotlight (primary reveal circle)
└── Trail Elements (fading circles)
State Management
javascript// Component State Structure
const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
const [isHovered, setIsHovered] = useState(false);
const [trailPoints, setTrailPoints] = useState([]);

// Trail Point Object Structure
const trailPoint = {
  id: uniqueId,
  x: xPosition,
  y: yPosition,
  opacity: 1.0,
  timestamp: Date.now()
};

Technical Implementation
CSS Mask Strategy
Primary Method: CSS mask-image with radial gradients

Overlay Element: Dark div covering entire image
Mask Property: mask-image: radial-gradient(circle at var(--mouse-x) var(--mouse-y), transparent 80px, black 120px)
Dynamic Updates: CSS custom properties updated via JavaScript

Performance Optimizations

GPU Acceleration: All positioning uses transform: translate3d()
CSS Variables: --mouse-x and --mouse-y for efficient property updates
Throttled Events: Mouse move events throttled to 16ms (60fps)
Trail Cleanup: Automatic removal of expired trail elements
Will-Change: Applied to animated elements for layer promotion


Component Props
Required Props
javascript// Basic props needed for the component
const ImageSpotlight = ({ src, alt, orientation }) => {
  // Component implementation
};

// Props explanation:
// src: string - Image source URL
// alt: string - Image alt text for accessibility
// orientation: 'landscape' | 'portrait' - Image orientation type
Optional Configuration Props
javascript// Default configuration object
const defaultConfig = {
  spotlightSize: 80,           // Spotlight radius in pixels
  overlayOpacity: 0.8,         // Dark overlay opacity (0-1)
  trailFadeDuration: 1000,     // Trail fade time in milliseconds
  maxTrailPoints: 8,           // Maximum number of trail points
  trailSpacing: 20,            // Minimum distance between trail points
  enableTrail: true,           // Enable/disable trail effect
  className: ''                // Additional CSS classes
};

Image Handling System
Responsive Container
css.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* Landscape Images */
.image-container.landscape {
  aspect-ratio: 16/9;
  max-width: 800px;
}

/* Portrait Images */
.image-container.portrait {
  aspect-ratio: 3/4;
  max-width: 600px;
}
Image Sizing Strategy

Object-fit: cover for consistent container filling
Dynamic Aspect Ratios: CSS aspect-ratio property based on orientation prop
Breakpoint Responsive: Different max-widths for mobile/desktop
Fallback Support: Height-based sizing for older browsers


Animation System
Spotlight Animation
css.spotlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, var(--overlay-opacity, 0.8));
  mask-image: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    transparent var(--inner-radius, 60px),
    black var(--outer-radius, 100px)
  );
  transition: mask-position 0.1s ease-out;
  will-change: mask-position;
}
Trail System
Trail Point Lifecycle:

Creation: New trail point created on mouse position change
Positioning: Absolute positioning with transform
Fading: CSS opacity transition over configured duration
Cleanup: Automatic removal after fade completion

Trail Implementation:
css.trail-point {
  position: absolute;
  width: var(--trail-size);
  height: var(--trail-size);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    transparent 0%,
    transparent 60%,
    rgba(255, 255, 255, 0.1) 80%,
    transparent 100%
  );
  transform: translate3d(var(--trail-x), var(--trail-y), 0);
  transition: opacity var(--fade-duration) ease-out;
  will-change: opacity;
  pointer-events: none;
}
Trail Optimization:

Maximum trail points limit to prevent memory bloat
Distance-based trail point creation (prevents overcrowding)
RequestAnimationFrame for smooth opacity updates


Event Handling
Mouse Tracking Implementation
javascript// Throttle utility function
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

// Mouse move handler
const handleMouseMove = useCallback(
  throttle((event) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Update CSS variables for spotlight position
    containerRef.current.style.setProperty('--mouse-x', `${x}%`);
    containerRef.current.style.setProperty('--mouse-y', `${y}%`);
    
    // Update state for trail creation
    setMousePosition({ x, y });
    createTrailPoint(x, y);
  }, 16), // 60fps throttling
  []
);
Coordinate System

Input: Native mouse coordinates (clientX, clientY)
Transform: Relative to image container bounds
Output: Percentage-based coordinates (0-100%)
CSS Variables: Applied as --mouse-x and --mouse-y


Trail Management System
Trail Point Creation
javascriptconst createTrailPoint = useCallback((x, y) => {
  // Check minimum distance from last trail point
  const lastPoint = trailPoints[trailPoints.length - 1];
  if (lastPoint) {
    const distance = Math.sqrt(
      Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
    );
    if (distance < config.trailSpacing) return;
  }
  
  const newTrailPoint = {
    id: `trail-${Date.now()}-${Math.random()}`,
    x,
    y,
    opacity: 1,
    timestamp: Date.now()
  };
  
  setTrailPoints(prev => [...prev.slice(-config.maxTrailPoints + 1), newTrailPoint]);
}, [trailPoints, config]);
Trail Cleanup
javascriptuseEffect(() => {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    setTrailPoints(prev => 
      prev.filter(point => 
        now - point.timestamp < config.trailFadeDuration
      )
    );
  }, 100); // Cleanup every 100ms
  
  return () => clearInterval(cleanupInterval);
}, [config.trailFadeDuration]);

Accessibility Features
Reduced Motion Support
css@media (prefers-reduced-motion: reduce) {
  .spotlight-overlay {
    transition: none;
  }
  
  .trail-point {
    opacity: 0 !important;
  }
  
  .image-container * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
Keyboard and Screen Reader Support
javascript// ARIA attributes for accessibility
const accessibilityProps = {
  role: "img",
  "aria-label": alt,
  "aria-describedby": "spotlight-instructions",
  tabIndex: 0
};

// Hidden instructions for screen readers
const instructions = (
  <div id="spotlight-instructions" className="sr-only">
    Interactive image with mouse spotlight effect. 
    Move your mouse over the image to reveal different areas.
  </div>
);

Browser Compatibility
Modern Browser Features

CSS Masks: Chrome 120+, Firefox 53+, Safari 15.4+
CSS Custom Properties: Universal support
Aspect-Ratio: Chrome 88+, Firefox 89+, Safari 15+

Fallback Strategy
css/* Feature detection and fallbacks */
@supports not (aspect-ratio: 1) {
  .image-container.landscape {
    height: 450px;
  }
  
  .image-container.portrait {
    height: 800px;
  }
}

@supports not (mask-image: radial-gradient(circle, black, black)) {
  .spotlight-overlay {
    background: linear-gradient(
      45deg,
      rgba(0,0,0,0.8) 0%,
      rgba(0,0,0,0.6) 50%,
      rgba(0,0,0,0.8) 100%
    );
  }
}

Performance Considerations
Optimization Techniques

Event Throttling: Limits mouse move handling to 60fps
Trail Culling: Removes invisible/expired trail points
GPU Layers: Promotes animated elements to composite layers
Memory Management: Automatic cleanup of trail point references
CSS Containment: Uses contain property to limit layout scope

Performance Monitoring
javascript// Performance tracking utilities
const trackPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'measure') {
        console.log(`${entry.name}: ${entry.duration}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure'] });
};

Usage Examples
Basic Implementation
javascriptimport ImageSpotlight from './ImageSpotlight';

function App() {
  return (
    <ImageSpotlight 
      src="/images/landscape-photo.jpg"
      alt="Beautiful mountain landscape"
      orientation="landscape"
    />
  );
}
Advanced Configuration
javascriptfunction Gallery() {
  const customConfig = {
    spotlightSize: 120,
    overlayOpacity: 0.9,
    trailFadeDuration: 1500,
    maxTrailPoints: 12,
    enableTrail: true
  };

  return (
    <div className="gallery">
      <ImageSpotlight 
        src="/images/portrait-photo.jpg"
        alt="Portrait photography"
        orientation="portrait"
        config={customConfig}
        className="featured-image"
      />
    </div>
  );
}
Multiple Images with Different Orientations
javascriptfunction ImageGrid() {
  const images = [
    { src: '/img1.jpg', alt: 'Landscape 1', orientation: 'landscape' },
    { src: '/img2.jpg', alt: 'Portrait 1', orientation: 'portrait' },
    { src: '/img3.jpg', alt: 'Landscape 2', orientation: 'landscape' }
  ];

  return (
    <div className="image-grid">
      {images.map((image, index) => (
        <ImageSpotlight 
          key={index}
          src={image.src}
          alt={image.alt}
          orientation={image.orientation}
        />
      ))}
    </div>
  );
}
This documentation provides a complete technical foundation for implementing the Interactive Image Spotlight component with full support for both landscape and portrait image orientations.