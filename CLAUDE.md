# UiGlow - Project Context

UiGlow is a modern Next.js-based UI component showcase and experimentation platform, featuring interactive animations, UI component demonstrations, and visual experiences.

## Project Overview

**Name**: UiGlow
**Version**: 0.1.0
**Type**: Next.js 15 React Application
**Purpose**: Showcase and experiment with modern UI components, animations, and interactive experiences

## Technology Stack

### Core Framework
- **Next.js 15.1.2** - React framework with App Router
- **React 18** - UI library
- **TypeScript/JavaScript** - Mixed usage (primarily JavaScript)

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Shadcn/ui** - Component library (New York style)
- **CSS Variables** - Custom properties for theming
- **Dark Mode Support** - Class-based dark mode implementation

### UI Component Libraries
- **Radix UI** - Headless UI components
  - Dialog, Label, Popover, Separator, Slot, Tabs, Tooltip
- **Lucide React** - Icon library
- **React Icons** - Additional icon sets
- **React Feather** - Feather icons

### Animation & Effects
- **Motion 12.22.0** - Animation library (successor to Framer Motion)
- **Custom CSS animations** - Hand-crafted animations

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler (enabled in dev mode)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout with font configuration
│   ├── page.js                   # Home page with draggable canvas
│   ├── globals.css               # Global styles and CSS variables
│   ├── experiences/              # Interactive experiences
│   │   ├── clock/                # World clock experience
│   │   ├── fish/                 # School of fish simulation
│   │   └── slate-cars/           # Car configuration demo
│   ├── svg-animations/           # SVG-based animations
│   │   ├── coinflip/             # Coin flip animation
│   │   ├── comethero/            # Comet hero animation
│   │   └── unlock/               # Lock/unlock animation
│   ├── ui-interactions/          # UI component demonstrations
│   │   ├── img-stack/            # Image stack interaction
│   │   ├── img-tiles/            # Image tiles interaction
│   │   ├── img-light/            # Image spotlight interaction
│   │   ├── img-sphere/           # Image sphere interaction
│   │   ├── img-loading/          # Image loading interaction
│   │   └── chat-interface/       # Chat interface component
│   └── tools/                    # Standalone tools (no shared layout/nav)
│       ├── layout.js             # Passthrough layout
│       ├── page.js               # Tools landing page
│       ├── draw-canvas/          # Drawing canvas tool
│       └── img-mosaic/           # Image mosaic tool
├── components/                   # Reusable components
│   ├── core/                     # Core application components
│   │   ├── AppHeader.js          # Application header with primary/secondary variants
│   │   ├── ExperienceCard.jsx    # Card component for experiences
│   │   ├── PageLayout.jsx        # Page layout wrapper
│   │   └── SidebarNav.jsx        # Navigation sidebar
│   ├── canvas/                   # Canvas system components
│   │   ├── DraggableCanvas.jsx   # Main canvas with pan/zoom
│   │   ├── DraggableItem.jsx     # Individual draggable items
│   │   ├── CardContent.jsx       # Content renderer (image/video/component)
│   │   └── arrows/               # Hand-drawn arrow components
│   │       └── CurvedArrow.jsx   # SVG arrows for visual grouping
│   ├── ui/                       # Shadcn/ui components
│   ├── backgrounds/              # Background components
│   │   └── GradientBlob.jsx      # Animated gradient blob
│   ├── effects/                  # Visual effects
│   │   └── BreathingText.jsx     # Breathing text animation
│   └── previews/                 # Preview components
│       └── ClockPreview.jsx      # Clock preview component
├── data/                         # Data and configuration
│   └── canvasData.js             # Canvas items configuration
├── fancy/                        # Experimental components
│   └── components/
│       └── text/                 # Text-related components
├── hooks/                        # Custom React hooks
└── lib/                          # Utility libraries
```

## Design System

### Typography
- **Primary Font**: Raleway (300-700 weights) - Body text
- **Heading Font**: Bitter (500-700 weights) - Headings
- **Font Loading**: Next.js font optimization with `display: 'swap'`

### Color Palette
- **Base Colors**: Slate color palette
- **Theme Support**: Light and dark modes via CSS variables
- **Custom Colors**: Clock themes, gradient colors, blob colors
- **Semantic Colors**: Following Shadcn/ui conventions

### Layout Patterns
- **Draggable Canvas**: Free-form infinite canvas with pan and drag
- **Responsive Scaling**: Canvas scales between 60%-120% based on viewport (1440px base)
- **Visual Grouping**: Hand-drawn arrows and spatial organization
- **Three-column layout**: Left sidebar + main content + right sidebar (for sub-pages)
- **Grid systems**: 2-column grids for cards
- **Responsive design**: Mobile-first approach
- **Fixed width content**: 700-900px main content area

## Key Features

### 1. Home Page - Draggable Canvas System
Interactive free-form canvas showcasing all projects:
- **Pan and Drag**: Click-drag canvas to navigate, mouse wheel to scroll
- **Draggable Items**: Each project card can be repositioned
- **Visual Grouping**: 4 organized groups with hand-drawn arrows
  - Experiments (top left): Fish, Clock, Cars
  - Tools (top right): Mosaic, Draw Canvas
  - Interactions (bottom left): 6 image interaction demos
  - SVG Animations (bottom right): Coin flip, Unlock, Comet
- **Responsive Canvas**: Scales from 60%-120% based on viewport width
- **Hover Effects**: Configurable tilt rotation and title overlays
- **Mixed Content**: Supports images, videos (autoplay), and live components
- **Custom Styling**: Per-item backgrounds, padding, shadows, and rotation

### 2. Experiences Section
Interactive demos and experiments:
- **Fish School**: Animated school of fish simulation
- **World Clock**: Live clock with timezone support
- **Car Configuration**: Interactive 3D car customizer

### 3. UI Interactions Section
Image manipulation and interaction demos:
- **Image Stack**: Layered image stacking interaction
- **Image Tiles**: Tile-based image arrangements
- **Image Light**: Spotlight effect on images
- **Image Sphere**: Spherical image projection
- **Image Loading**: Creative loading animations
- **Chat Interface**: Modern chat UI component

### 4. SVG Animations Section
Vector-based animations:
- **Coin Flip**: Animated coin flip mechanics
- **Comet Hero**: Comet hero section animation
- **Unlock**: Lock/unlock transition effects

### 5. Tools Section
Standalone utility tools accessed directly via links:
- **Drawing Canvas**: Interactive canvas for drawing and image manipulation
- **Image Mosaic**: Create photo mosaic effects
- **No Navigation**: Each tool has its own header with specific tool name
- **Direct Access**: Tools are accessed via direct links, not through sidebar navigation

### 6. Component Architecture
- **Reusable components**: Modular design
- **Props-based configuration**: Flexible component API
- **Mixed rendering**: Image, video, and component previews
- **Canvas data system**: Centralized configuration for all canvas items
- **Dynamic component loading**: Next.js dynamic imports for performance

## Development Guidelines

### File Naming Conventions
- **Pages**: `page.js` (App Router convention)
- **Components**: PascalCase (e.g., `ExperienceCard.jsx`, `CoinFlip.jsx`)
- **Directories**: kebab-case (e.g., `slate-cars`, `ui-interactions`)
- **Config files**: kebab-case (e.g., `navigation-config.js`)
- **Extensions**: Primarily `.jsx` for components, `.js` for configs and pages

### Component Patterns
- **"use client"** directives for interactive components
- **Compound components**: Complex UI patterns
- **Render props**: Flexible component composition
- **Custom hooks**: Reusable logic extraction

### Styling Approach
- **Utility-first**: Tailwind CSS classes
- **Component variants**: Using `class-variance-authority`
- **CSS variables**: Theme-aware properties
- **Responsive design**: Mobile-first breakpoints

## Build & Development

### Scripts
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checking

### Configuration Files
- **next.config.mjs**: Next.js configuration (minimal)
- **tailwind.config.mjs**: Tailwind with custom theme
- **components.json**: Shadcn/ui configuration
- **jsconfig.json**: Path aliases configuration

## Asset Management
- **Public directory**: Static assets organized by feature
- **Image formats**: GIF thumbnails, JPG images
- **Path aliases**: `@/` prefix for clean imports

## Naming Standards

### Standardized Naming Convention
The codebase follows these naming standards:

**Directories:**
- Use kebab-case: `ui-interactions`, `slate-cars`, `svg-animations`
- Feature-based organization

**Components:**
- Use PascalCase: `CoinFlip.jsx`, `ExperienceCard.jsx`, `DownloadButton.jsx`
- Match the component's export name

**Configuration Files:**
- Use kebab-case: `navigation-config.js`, `next.config.mjs`
- Descriptive naming with purpose suffix

**Page Files:**
- Always `page.js` (Next.js App Router convention)
- Layout files: `layout.js`

## Notable Patterns

### 1. AppHeader Component
Flexible header component with two variants:
- **Primary Variant**: Rounded pill header for home page
  - Fixed positioning at top center
  - Minimal design with logo, avatar, GitHub link, theme toggle
  - White/dark background with shadow and border
- **Secondary Variant**: Full-width header for sub-pages
  - Full-width with bottom border
  - Logo + breadcrumb-style title (e.g., "/ Drawing Canvas")
  - Same controls as primary variant
  - Used in tools section with tool-specific names

### 2. Draggable Canvas System
Free-form infinite canvas with configurable items:
- **Canvas Configuration** (`src/data/canvasData.js`): Single source of truth for all canvas items
- **Item Properties**:
  - `contentType`: 'image', 'video', 'component', 'text', 'group-title', 'arrow'
  - `position`: { x, y } coordinates on canvas
  - `size`: { width, height } in pixels
  - `rotation`: Base rotation in degrees
  - `hoverRotation`: Additional rotation on hover
  - `clickable`: Enable click-to-navigate
  - `link`: Navigation URL
  - `openInNewTab`: Open in new tab flag
  - `shadow`: Drop shadow effect
  - `background`: Show background
  - `backgroundColor`: Custom background color (hex)
  - `padding`: Internal padding in pixels
- **Interactions**: Pan canvas, drag items, mouse wheel scroll, hover effects
- **Boundaries**: Simple 10000px boundary for performance

### 2. Content Rendering System
Unified content renderer supporting multiple types:
- **Images**: Next.js Image component with lazy loading
- **Videos**: Autoplay, muted, looping, no controls
- **Components**: Dynamic imports with `suppressHydrationWarning` for time-based components
- **Text**: Centered text with pre-line whitespace
- **Group Titles**: Section headers
- **Arrows**: Hand-drawn SVG arrows for visual flow

### 3. Theme System
Comprehensive CSS variable system supporting light/dark modes:
- **Arrow Colors**: Light grey (slate-300) in light mode, darker grey (slate-700) in dark mode
- **Background Colors**: White/slate-800 with custom color override support
- **Shadow System**: Configurable drop shadows for depth

### 4. Animation Integration
Seamless integration of Motion library:
- **Hover States**: Scale and rotation transforms
- **Drag States**: Scale and z-index changes
- **Title Overlays**: Smooth gradient fade-in with text
- **Spring Physics**: Natural feeling animations with configurable stiffness and damping

## Getting Started for New Contributors

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **View components**: Navigate to `/ui-interactions` or `/svg-animations`
4. **Add new experience**: Create in appropriate directory with navigation config
5. **Follow naming conventions**: Match existing patterns
6. **Use existing components**: Leverage the component library
7. **Test responsive design**: Ensure mobile compatibility

## AI Agent Context

When working with this codebase:
- **Component library**: Shadcn/ui with Radix primitives
- **Animation library**: Motion (not Framer Motion)
- **Styling**: Tailwind with CSS variables
- **Icons**: Primarily Lucide React
- **Structure**: App Router with organized feature directories
- **Patterns**: Draggable canvas, experience cards, navigation configs, component previews

### Canvas System Details
- **Main Canvas**: `src/components/canvas/DraggableCanvas.jsx` - Handles pan, zoom, boundaries, responsive scaling
- **Canvas Items**: `src/components/canvas/DraggableItem.jsx` - Individual draggable items with hover effects
- **Content Renderer**: `src/components/canvas/CardContent.jsx` - Renders different content types
- **Data Configuration**: `src/data/canvasData.js` - All canvas items with positions and properties
- **Canvas Size**: 10000px boundary, centers viewport on items at 500x400
- **Responsive Scaling**: 60%-120% scale based on viewport width (1440px base)
- **Drag Threshold**: 3px to differentiate click from drag
- **Video Support**: Autoplay, muted, looping, no controls
- **Hover Effects**: Title overlay with smooth gradient, configurable rotation

### Adding New Canvas Items
1. Add item to `src/data/canvasData.js` in appropriate group
2. Configure position, size, rotation, hover effects
3. Add thumbnail to `public/thumbnails/` directory
4. Set contentType: 'image' (GIF/PNG), 'video' (MP4), or 'component'
5. For components, add to componentMap in `CardContent.jsx`

### Clock Component Specifics
- Uses `suppressHydrationWarning` to prevent time-based hydration errors
- Renders client-side only with mounted state check
- Custom background color support: `#1e293b`
- Padding creates visible border around content