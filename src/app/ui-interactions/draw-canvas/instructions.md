# Technical Documentation: Drawing Canvas Component

## Overview
A minimal React drawing canvas component for Next.js that allows freehand drawing over an optional background image. The only visible UI controls are icon buttons for Clear and Save that appear on hover as an overlay.

## File Structure
```
/app
  /draw-canvas
    page.js              (Server component - no 'use client')
    DrawingCanvas.jsx    (Client component with all interactivity)
```

## Component 1: DrawingCanvas.jsx

### Location
`/app/draw-canvas/DrawingCanvas.jsx`

**IMPORTANT:** This must be a Client Component (includes 'use client' directive)

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 1200 | Canvas width in pixels |
| `height` | number | 800 | Canvas height in pixels |
| `backgroundImage` | string or null | null | URL or data URL of background image |
| `strokeColor` | string | '#000000' | Color of the drawing pen |
| `strokeWidth` | number | 2 | Width of the pen stroke in pixels |
| `padding` | number | 40 | Padding around the background image in pixels |

### Component Structure

```javascript
'use client';  // MUST be at the top of DrawingCanvas.jsx

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';

const DrawingCanvas = forwardRef(({ 
  width = 1200, 
  height = 800, 
  backgroundImage = null,
  strokeColor = '#000000',
  strokeWidth = 2,
  padding = 40
}, ref) => {
  // All implementation here
});

export default DrawingCanvas;
```

### Exposed Methods (via ref)
- `clearCanvas()` - Clears all drawings and redraws background image if exists
- `saveCanvas()` - Downloads the canvas as PNG file
- `getCanvasDataURL()` - Returns canvas as data URL string

### Implementation Details

#### State Management
```javascript
const [isDrawing, setIsDrawing] = useState(false);
const [backgroundImageData, setBackgroundImageData] = useState(null);
const [isHovering, setIsHovering] = useState(false);
const canvasRef = useRef(null);
const containerRef = useRef(null);
```

#### Background Image Handling
1. When `backgroundImage` prop changes, load the image
2. Calculate scaled dimensions to fit within canvas bounds (minus padding)
3. Center the image on canvas
4. Store image data (img object, x, y, width, height) in state
5. Draw image on canvas using `ctx.drawImage()`

**Scaling Logic:**
```javascript
const maxWidth = canvas.width - (padding * 2);
const maxHeight = canvas.height - (padding * 2);
const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
const imgWidth = img.width * scale;
const imgHeight = img.height * scale;
const x = (canvas.width - imgWidth) / 2;
const y = (canvas.height - imgHeight) / 2;
```

#### Dotted Pattern Background (No Image)
When no background image is provided, draw a dotted grid pattern:
```javascript
ctx.fillStyle = '#d1d5db'; // gray-300
const spacing = 20;
for (let x = 0; x < canvas.width; x += spacing) {
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.fillRect(x, y, 2, 2);
  }
}
```

#### Canvas Initialization (useEffect)
- Set canvas width and height
- Get 2D context
- Set default line styles:
  - `ctx.strokeStyle = strokeColor`
  - `ctx.lineWidth = strokeWidth`
  - `ctx.lineCap = 'round'`
  - `ctx.lineJoin = 'round'`
- Draw dotted pattern or background image

#### Mouse Event Handlers

**onMouseDown:**
```javascript
- Get canvas bounding rect
- Calculate mouse position relative to canvas (e.clientX - rect.left)
- Begin new path: ctx.beginPath()
- Move to position: ctx.moveTo(x, y)
- Set isDrawing to true
```

**onMouseMove:**
```javascript
- Check if isDrawing is false, return early
- Calculate current mouse position
- Draw line to position: ctx.lineTo(x, y)
- Stroke the path: ctx.stroke()
```

**onMouseUp and onMouseLeave:**
```javascript
- Set isDrawing to false
```

#### Hover Detection
Track mouse enter/leave on the container element:
```javascript
onMouseEnter={() => setIsHovering(true)}
onMouseLeave={() => setIsHovering(false)}
```

#### Clear Canvas Method
```javascript
const handleClear = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (backgroundImageData) {
    ctx.drawImage(
      backgroundImageData.img,
      backgroundImageData.x,
      backgroundImageData.y,
      backgroundImageData.width,
      backgroundImageData.height
    );
  } else {
    drawDottedPattern();
  }
};
```

#### Save Canvas Method
```javascript
const handleSave = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `drawing-${Date.now()}.png`;
  link.href = dataURL;
  link.click();
};
```

#### useImperativeHandle Setup
Expose methods to parent component via ref:
```javascript
useImperativeHandle(ref, () => ({
  clearCanvas: handleClear,
  saveCanvas: handleSave,
  getCanvasDataURL: () => canvasRef.current?.toDataURL('image/png')
}));
```

### Icon Buttons Implementation

Use lucide-react icons for the buttons:
- **Clear button:** Trash2 icon
- **Save button:** Download icon

Import icons:
```javascript
import { Trash2, Download } from 'lucide-react';
```

### JSX Structure
```jsx
<div 
  ref={containerRef}
  className="relative inline-block"
  onMouseEnter={() => setIsHovering(true)}
  onMouseLeave={() => setIsHovering(false)}
>
  <canvas
    ref={canvasRef}
    onMouseDown={startDrawing}
    onMouseMove={draw}
    onMouseUp={stopDrawing}
    className="border border-gray-300 cursor-crosshair"
    style={{ display: 'block' }}
  />
  
  {/* Overlay Controls - Only visible on hover */}
  <div 
    className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-200 ${
      isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
    <button
      onClick={handleClear}
      className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200"
      title="Clear canvas"
    >
      <Trash2 size={20} />
    </button>
    <button
      onClick={handleSave}
      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      title="Save drawing"
    >
      <Download size={20} />
    </button>
  </div>
</div>
```

#### Overlay Icon Buttons Styling Details
- **Position:** Absolute, top-right corner (top-4 right-4)
- **Visibility:** Controlled by isHovering state
- **Transition:** Smooth opacity transition (duration-200)
- **Pointer Events:** Disabled when hidden (pointer-events-none)
- **Button Size:** Square buttons with p-2 padding
- **Icon Size:** 20px (size={20})
- **Buttons:**
  - Clear: White background with Trash2 icon, gray text
  - Save: Blue background with Download icon, white text
  - Both have shadow-lg for elevation
  - Both have rounded-lg corners
  - Title attribute for tooltips on hover

---

## Component 2: page.js

### Location
`/app/draw-canvas/page.js`

**IMPORTANT:** This is a Server Component (NO 'use client' directive)

### Purpose
Server-rendered page that passes configuration as props to the DrawingCanvas client component. All settings are controlled through props - no state management needed in page.js.

### Server Component Structure

```javascript
// NO 'use client' directive - this is a Server Component
import DrawingCanvas from './DrawingCanvas';

export default function DrawingPage() {
  // Configuration - these are just JavaScript values, not state
  const canvasWidth = 1200;
  const canvasHeight = 800;
  const strokeColor = '#000000';
  const strokeWidth = 2;
  const padding = 40;
  const backgroundImage = null; // or '/images/background.jpg'
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <DrawingCanvas
        width={canvasWidth}
        height={canvasHeight}
        backgroundImage={backgroundImage}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        padding={padding}
      />
    </div>
  );
}
```

### Key Points for Server Component

1. **NO 'use client' directive** - page.js is a Server Component by default
2. **NO hooks** - No useState, useRef, useEffect in page.js
3. **NO event handlers** - All interactivity is in DrawingCanvas.jsx
4. **Simple configuration** - Just define constants and pass as props
5. **Static values** - Configuration values are determined at build/render time

### Configuration Examples

**Example 1: Basic setup**
```javascript
export default function DrawingPage() {
  const canvasWidth = 1200;
  const canvasHeight = 800;
  const strokeColor = '#000000';
  const strokeWidth = 2;
  const padding = 40;
  const backgroundImage = null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <DrawingCanvas
        width={canvasWidth}
        height={canvasHeight}
        backgroundImage={backgroundImage}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        padding={padding}
      />
    </div>
  );
}
```

**Example 2: With background image**
```javascript
export default function DrawingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <DrawingCanvas
        width={1600}
        height={1000}
        backgroundImage="/images/blueprint.jpg"
        strokeColor="#ff0000"
        strokeWidth={3}
        padding={50}
      />
    </div>
  );
}
```

**Example 3: Inline props (most concise)**
```javascript
export default function DrawingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <DrawingCanvas
        width={1200}
        height={800}
        strokeColor="#000000"
        strokeWidth={2}
        padding={40}
      />
    </div>
  );
}
```

### How to Configure Settings

All configuration is done by changing the prop values passed to DrawingCanvas:

**To change canvas size:**
```javascript
<DrawingCanvas
  width={1600}  // Change width
  height={900}  // Change height
  ...
/>
```

**To change drawing style:**
```javascript
<DrawingCanvas
  strokeColor="#ff0000"  // Red pen
  strokeWidth={5}        // Thicker pen
  ...
/>
```

**To change image padding:**
```javascript
<DrawingCanvas
  padding={60}  // More padding around image
  ...
/>
```

**To load a background image:**
```javascript
<DrawingCanvas
  backgroundImage="/images/my-image.jpg"
  // or
  backgroundImage="https://example.com/image.jpg"
  ...
/>
```

---

## Technical Requirements

### Dependencies
- React (from Next.js)
- lucide-react (for icons) - **MUST BE INSTALLED**
  ```bash
  npm install lucide-react
  ```
- Uses native HTML5 Canvas API

### Component Architecture
- **page.js:** Server Component (no client-side JavaScript)
  - No 'use client' directive
  - No hooks or state
  - Just passes configuration props
  
- **DrawingCanvas.jsx:** Client Component (interactive)
  - Has 'use client' directive
  - Contains all hooks, state, and event handlers
  - Handles all canvas interactions

### Browser Compatibility
- Modern browsers with Canvas API support
- No polyfills needed

### Performance Considerations
1. Server Component reduces client-side JavaScript bundle
2. Only DrawingCanvas.jsx is sent to client
3. Canvas re-initialization happens when width/height/backgroundImage changes
4. Drawing uses `lineTo()` for smooth strokes
5. Background image is redrawn only when clearing canvas
6. Overlay controls use CSS transitions for smooth hover effect
7. pointer-events-none prevents hidden overlay from interfering with drawing

### Known Limitations
1. No undo/redo functionality
2. Single drawing layer only
3. No touch device support (mouse/trackpad only)
4. No drawing smoothing/interpolation beyond basic lineCap/lineJoin
5. All configuration must be done in code (no UI controls)
6. Configuration is static (requires code change to update)

---

## Implementation Checklist

### DrawingCanvas.jsx (Client Component)
- [ ] Add 'use client' at the very top
- [ ] Install lucide-react: `npm install lucide-react`
- [ ] Import Trash2 and Download icons from lucide-react
- [ ] Create component with forwardRef
- [ ] Accept all props with defaults
- [ ] Set up canvas ref, container ref, and state
- [ ] Add isHovering state for overlay visibility
- [ ] Implement canvas initialization useEffect
- [ ] Implement background image loading useEffect
- [ ] Implement dotted pattern drawing function
- [ ] Implement mouse event handlers (down, move, up, leave)
- [ ] Implement hover detection (mouseEnter, mouseLeave on container)
- [ ] Implement handleClear method
- [ ] Implement handleSave method
- [ ] Expose methods via useImperativeHandle
- [ ] Create overlay controls div with icon buttons
- [ ] Style icon buttons with proper sizes and hover states
- [ ] Add transition effects to overlay
- [ ] Add title attributes for tooltips
- [ ] Test overlay show/hide on hover

### page.js (Server Component)
- [ ] Do NOT add 'use client' directive
- [ ] Import DrawingCanvas component
- [ ] Define configuration constants (no useState)
- [ ] Create minimal centered layout
- [ ] Render DrawingCanvas with all props
- [ ] Verify no hooks are used
- [ ] Verify no event handlers in page.js
- [ ] Test canvas rendering
- [ ] Test icon buttons (clear/save)
- [ ] Verify configuration changes in code affect canvas

---

## Expected Behavior

1. **On Load:** 
   - Server renders page with configuration
   - Client hydrates DrawingCanvas component
   - Canvas shows dotted pattern background
   - No visible UI controls except canvas
   - Overlay buttons are hidden

2. **Hover Canvas:** 
   - Icon buttons (Trash and Download) fade in at top-right
   - Tooltips show on button hover

3. **Leave Canvas:** 
   - Icon buttons fade out

4. **Drawing:** 
   - Click and drag creates smooth pen strokes
   - Overlay remains visible during drawing
   - Cursor shows as crosshair

5. **Clear (Trash icon):** 
   - All drawings removed
   - Background (image or dots) restored

6. **Save (Download icon):** 
   - Downloads PNG with entire canvas content
   - Filename includes timestamp

7. **Configuration Changes (in code):**
   - Change props in page.js → Rebuild/refresh to see changes
   - All configuration is static at build time

---

## Why This Architecture?

### Benefits of Server Component for page.js:
1. **Smaller JavaScript bundle** - Configuration code doesn't ship to client
2. **Better performance** - Less client-side JavaScript to parse/execute
3. **SEO friendly** - Page renders on server
4. **Simpler code** - No need for state management in page.js
5. **Next.js best practices** - Use Server Components by default

### Client Component only where needed:
- DrawingCanvas.jsx needs 'use client' because it uses:
  - useState for drawing state
  - useRef for canvas reference
  - useEffect for initialization
  - Event handlers (onClick, onMouseMove, etc.)
  - Browser APIs (canvas, FileReader, etc.)

---

## Complete File Templates

### DrawingCanvas.jsx
```javascript
'use client';

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';

const DrawingCanvas = forwardRef(({ 
  width = 1200, 
  height = 800, 
  backgroundImage = null,
  strokeColor = '#000000',
  strokeWidth = 2,
  padding = 40
}, ref) => {
  // ... full implementation
});

export default DrawingCanvas;
```

### page.js
```javascript
// NO 'use client' - Server Component
import DrawingCanvas from './DrawingCanvas';

export default function DrawingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <DrawingCanvas
        width={1200}
        height={800}
        strokeColor="#000000"
        strokeWidth={2}
        padding={40}
      />
    </div>
  );
}
```