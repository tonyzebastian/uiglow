# Image Loader Component - Technical Documentation

## Overview
A React component that displays an animated grid loading state which transitions into the loaded image by sampling colors from the underlying image before fading away.

## Component Structure

### Main Component: `ImageLoader`

```jsx
<ImageLoader 
  src="image-url.jpg"
  alt="Description"
  gridSize={20}
  cellShape="circle"
  blinkSpeed={1000}
  transitionDuration={800}
  fadeOutDuration={600}
  onLoad={() => {}}
  className=""
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | Image source URL |
| `alt` | string | "" | Image alt text |
| `gridSize` | number | 20 | Size of each grid cell in pixels |
| `cellShape` | string | "circle" | Shape of cells: "circle" or "square" |
| `blinkSpeed` | number | 1000 | Average interval for blink animation (ms) |
| `transitionDuration` | number | 800 | Duration of color sampling transition (ms) |
| `fadeOutDuration` | number | 600 | Duration of final fade out (ms) |
| `onLoad` | function | () => {} | Callback when image is loaded |
| `className` | string | "" | Additional CSS classes for container |

## Implementation Phases

### Phase 1: Grid Generation & Blinking Animation

**State Management:**
- `isLoading` - boolean to track loading state
- `isTransitioning` - boolean for color sampling phase
- `isFadingOut` - boolean for final fade
- `gridCells` - array of cell objects with positions and blink timing

**Grid Cell Object:**
```javascript
{
  id: uniqueId,
  x: xPosition,
  y: yPosition,
  blinkDelay: randomDelay,
  color: null // initially null, populated during transition
}
```

**Blinking Logic:**
- Each cell gets a random delay offset (0 to `blinkSpeed`)
- Use CSS animation with `animation-delay` for staggered effect
- Animation should be `opacity` based (0.2 to 1.0 range)

**Grid Calculation:**
```javascript
// Calculate number of columns and rows
const cols = Math.ceil(containerWidth / gridSize)
const rows = Math.ceil(containerHeight / gridSize)

// Generate cells
const cells = []
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    cells.push({
      id: `${row}-${col}`,
      x: col * gridSize,
      y: row * gridSize,
      blinkDelay: Math.random() * blinkSpeed,
      color: null
    })
  }
}
```

### Phase 2: Image Loading & Color Sampling

**Canvas-based Color Sampling:**

1. Create an off-screen canvas element
2. Draw the loaded image onto canvas
3. For each grid cell, sample the pixel data from its area
4. Calculate average color for that region

**Color Sampling Function:**
```javascript
function sampleColorFromRegion(canvas, x, y, width, height) {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(x, y, width, height)
  const data = imageData.data
  
  let r = 0, g = 0, b = 0, count = 0
  
  // Sample every nth pixel for performance (e.g., every 4 pixels)
  for (let i = 0; i < data.length; i += 16) { // 16 = 4 pixels * 4 channels
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count++
  }
  
  return `rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`
}
```

**Image Load Handler:**
```javascript
function handleImageLoad(img) {
  // Create off-screen canvas
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  
  // Sample colors for each grid cell
  const updatedCells = gridCells.map(cell => ({
    ...cell,
    color: sampleColorFromRegion(
      canvas, 
      cell.x, 
      cell.y, 
      gridSize, 
      gridSize
    )
  }))
  
  setGridCells(updatedCells)
  setIsLoading(false)
  setIsTransitioning(true)
  
  // After transition, start fade out
  setTimeout(() => {
    setIsTransitioning(false)
    setIsFadingOut(true)
  }, transitionDuration)
}
```

### Phase 3: Transition Animations

**CSS Transitions Required:**

1. **Blink Animation (loading state):**
```css
@keyframes blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
```

2. **Color Transition:**
- Smooth transition from gray/white to sampled color
- Use CSS `transition: background-color {transitionDuration}ms ease`

3. **Random Fade Out:**
- Each cell gets random delay for fade out
- Opacity transition from 1 to 0

**Animation States:**
```javascript
// Loading state
style = {
  animation: `blink ${blinkSpeed}ms infinite`,
  animationDelay: `${cell.blinkDelay}ms`,
  backgroundColor: '#gray'
}

// Transitioning state
style = {
  backgroundColor: cell.color,
  transition: `background-color ${transitionDuration}ms ease`
}

// Fading out state
style = {
  backgroundColor: cell.color,
  opacity: 0,
  transition: `opacity ${fadeOutDuration}ms ease`,
  transitionDelay: `${Math.random() * fadeOutDuration}ms`
}
```

## Component Layout Structure

```jsx
<div className="relative" style={{ width, height }}>
  {/* Grid Overlay */}
  <div className="absolute inset-0 z-10">
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
          ...getAnimationStyle(cell)
        }}
      />
    ))}
  </div>
  
  {/* Actual Image */}
  <img
    src={src}
    alt={alt}
    className="w-full h-full object-cover"
    style={{ opacity: isFadingOut ? 1 : 0 }}
    onLoad={handleImageLoad}
  />
</div>
```

## Performance Considerations

1. **Grid Density:** Large images with small grid sizes create many DOM elements
   - Consider virtualization for very dense grids
   - Limit maximum number of cells (e.g., 2500 cells max)

2. **Color Sampling Optimization:**
   - Don't sample every pixel, sample every nth pixel
   - Use web workers for large images
   - Cache canvas operations

3. **Animation Performance:**
   - Use `will-change: opacity, background-color` for cells during animation
   - Use CSS transforms instead of position changes where possible
   - Consider using `requestAnimationFrame` for complex animations

4. **Memory Management:**
   - Dispose canvas element after color sampling
   - Clean up event listeners on unmount

## Usage Example

```jsx
import ImageLoader from './components/ImageLoader'

function MyComponent() {
  return (
    <ImageLoader
      src="/path/to/large-image.jpg"
      alt="Beautiful landscape"
      gridSize={25}
      cellShape="square"
      blinkSpeed={800}
      transitionDuration={600}
      fadeOutDuration={500}
      onLoad={() => console.log('Image loaded!')}
      className="max-w-2xl mx-auto"
    />
  )
}
```

## Edge Cases to Handle

1. **Image load failure:** Show error state or fallback
2. **Very small images:** Ensure minimum grid cell count
3. **Aspect ratio preservation:** Maintain image proportions
4. **Responsive sizing:** Recalculate grid on resize (with debouncing)
5. **Multiple instances:** Ensure animations don't interfere with each other

## Browser Compatibility

- Canvas API: All modern browsers
- CSS animations: All modern browsers
- Consider adding prefixes for older browsers if needed
- Test on mobile devices for performance

## Future Enhancements

1. Add different grid patterns (hexagonal, random scatter)
2. Support for video loading states
3. Different color sampling algorithms (dominant color, gradient mapping)
4. Configurable fade-out patterns (wave, spiral, center-out)
5. Lazy loading integration
6. SSR considerations for Next.js