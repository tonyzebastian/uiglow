# Mosaic Photo Effect Component - Technical Documentation

## Overview
A React component that transforms uploaded images into a mosaic/pixelated tile effect with configurable tile size, automatic border generation, grain texture overlay, and PNG export capability.

## Component Structure

```
MosaicPhotoEffect/
├── MosaicPhotoEffect.jsx    # Main component
└── README.md                  # This documentation
```

## Algorithm & Implementation Details

### 1. Image Processing Pipeline

```
Image Upload → Canvas Drawing → Grid Sampling → Mosaic Generation → Texture Overlay → Export
```

#### Step 1: Image Loading
- Use FileReader API to read uploaded image file
- Create an Image object and load the data URL
- Wait for image.onload before processing

#### Step 2: Canvas Setup
- Create two canvases:
  - `sourceCanvas`: holds the original image for color sampling
  - `mosaicCanvas`: renders the final mosaic effect
- Set canvas dimensions to match image dimensions

#### Step 3: Grid Sampling & Color Extraction

For each tile in the grid:

```javascript
// Pseudocode
tileSize = userSelectedSize (e.g., 10, 20, 30 pixels)

for (y = 0; y < imageHeight; y += tileSize) {
  for (x = 0; x < imageWidth; x += tileSize) {
    // Get pixel data for this tile
    pixelData = ctx.getImageData(x, y, tileSize, tileSize)
    
    // Calculate average color
    avgColor = calculateAverageColor(pixelData)
    
    // Draw tile with this color
    drawTile(x, y, tileSize, avgColor)
  }
}
```

#### Step 4: Average Color Calculation

```javascript
function calculateAverageColor(imageData) {
  let r = 0, g = 0, b = 0, a = 0
  const pixels = imageData.data
  const pixelCount = pixels.length / 4
  
  for (let i = 0; i < pixels.length; i += 4) {
    r += pixels[i]     // Red
    g += pixels[i + 1] // Green
    b += pixels[i + 2] // Blue
    a += pixels[i + 3] // Alpha
  }
  
  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount),
    a: Math.round(a / pixelCount)
  }
}
```

#### Step 5: Tile Drawing with Borders

Each tile consists of:
1. **Fill**: Main tile color (averaged from source)
2. **Border**: Darker version of the fill color

```javascript
function drawTile(ctx, x, y, size, color) {
  // Draw main tile
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a/255})`
  ctx.fillRect(x, y, size, size)
  
  // Draw border (darker version)
  const borderColor = darkenColor(color, 0.3) // 30% darker
  ctx.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a/255})`
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, size, size)
}

function darkenColor(color, factor) {
  return {
    r: Math.round(color.r * (1 - factor)),
    g: Math.round(color.g * (1 - factor)),
    b: Math.round(color.b * (1 - factor)),
    a: color.a
  }
}
```

#### Step 6: Grain Texture Overlay

- Position a grain texture PNG absolutely over the canvas
- Use CSS `mix-blend-mode` or canvas `globalCompositeOperation`
- Recommended: `mix-blend-mode: overlay` or `multiply`

```css
.grain-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0.3; /* Adjust for subtlety */
}
```

#### Step 7: PNG Export

```javascript
function exportAsPNG() {
  // If using separate grain overlay, need to composite
  const exportCanvas = document.createElement('canvas')
  const exportCtx = exportCanvas.getContext('2d')
  
  exportCanvas.width = mosaicCanvas.width
  exportCanvas.height = mosaicCanvas.height
  
  // Draw mosaic
  exportCtx.drawImage(mosaicCanvas, 0, 0)
  
  // Draw grain texture on top
  exportCtx.globalCompositeOperation = 'overlay'
  exportCtx.globalAlpha = 0.3
  exportCtx.drawImage(grainImage, 0, 0, exportCanvas.width, exportCanvas.height)
  
  // Export
  const dataURL = exportCanvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = 'mosaic-photo.png'
  link.href = dataURL
  link.click()
}
```

## Component Props & State

### Props
```javascript
{
  grainTextureUrl: string // URL to grain texture PNG (optional)
}
```

### State
```javascript
{
  uploadedImage: File | null,
  imageDataURL: string | null,
  tileSize: number,          // Default: 20
  isProcessing: boolean,
  mosaicDataURL: string | null
}
```

## User Interface Elements

1. **File Upload Input**
   - Accept: `image/*`
   - Trigger processing on file selection

2. **Tile Size Slider**
   - Range: 5-50 pixels
   - Default: 20
   - Live update (with debouncing for performance)

3. **Preview Area**
   - Display the mosaic canvas
   - Overlay grain texture

4. **Export Button**
   - Downloads current mosaic as PNG
   - Includes grain texture in export

## Performance Considerations

### Optimization Strategies

1. **Debounce Tile Size Changes**
   ```javascript
   // Wait 300ms after user stops adjusting before reprocessing
   const debouncedRegenerate = useMemo(
     () => debounce(regenerateMosaic, 300),
     []
   )
   ```

2. **Web Worker for Processing** (Optional Enhancement)
   - Offload color sampling to Web Worker
   - Prevents UI blocking on large images

3. **Image Size Limits**
   - Consider downscaling very large images (>2000px)
   - Maintain aspect ratio

4. **Canvas Memory Management**
   - Clear canvases when component unmounts
   - Reset context transforms

## Example Usage

```javascript
import MosaicPhotoEffect from './MosaicPhotoEffect'

function App() {
  return (
    <MosaicPhotoEffect 
      grainTextureUrl="/textures/grain.png"
    />
  )
}
```

## Technical Requirements

- React 16.8+ (hooks support)
- Modern browser with Canvas API support
- No external image processing libraries needed

## File Structure for Implementation

```javascript
// MosaicPhotoEffect.jsx
import { useState, useRef, useEffect } from 'react'

export default function MosaicPhotoEffect({ grainTextureUrl }) {
  // State management
  const [image, setImage] = useState(null)
  const [tileSize, setTileSize] = useState(20)
  
  // Refs for canvases
  const sourceCanvasRef = useRef(null)
  const mosaicCanvasRef = useRef(null)
  const grainImageRef = useRef(null)
  
  // Core functions
  const handleImageUpload = (e) => { /* ... */ }
  const processImage = () => { /* ... */ }
  const generateMosaic = () => { /* ... */ }
  const exportMosaic = () => { /* ... */ }
  
  return (
    <div className="mosaic-container">
      {/* UI elements */}
    </div>
  )
}
```

## Edge Cases to Handle

1. **Non-square dimensions**: Handle tiles at edges that don't fit perfectly
2. **Small images**: Minimum tile size relative to image size
3. **Transparent images**: Preserve alpha channel
4. **Large files**: Loading states and error handling
5. **Browser compatibility**: Check canvas.toBlob support


## Future Enhancement Ideas

1. Color palette quantization (limited color mode)
2. Custom border width control
3. Multiple export sizes
4. Tile shape options (circles, hexagons)
5. Animation: tile-by-tile reveal
6. Comparison slider (original vs mosaic)

---

**Ready for Claude Code implementation!** This documentation provides all the technical details needed to build the component.