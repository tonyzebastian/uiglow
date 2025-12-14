# UiGlow - Project Context

Modern Next.js showcase platform for UI components, animations, and interactive experiences.

**Version**: 0.1.0 | **Framework**: Next.js 15.5.9 (App Router) | **Language**: JavaScript
**Deployment**: Cloudflare Pages (Static Export) | **Build Output**: `out/`

---

## Tech Stack

### Core
- **Next.js 15.5.9** + React 18.3.1
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Shadcn/ui** - Component library (Radix UI primitives)
- **Motion 12.22.0** - Animation library

### Icons & UI
- **Lucide React** - Primary icon library
- **React Icons** - Secondary icons (FontAwesome, Ionicons, etc.)

### Deployment & Hosting
- **Cloudflare Pages** - Static hosting with global CDN
- **Node.js 20** - Build environment (specified in `.nvmrc`)
- **Static Export** - Pre-rendered HTML (`output: 'export'`)

### Tools
- **Turbopack** - Fast bundler (dev mode)
- **ESLint** - Code linting

---

## Deployment Architecture (Cloudflare Pages)

### Build Configuration
```javascript
// next.config.mjs
output: 'export'           // Static HTML export
images: { unoptimized: true }  // Standard <img> tags (no optimization)
```

### Cloudflare Pages Settings
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Node version**: 20 (from `.nvmrc`)
- **Framework preset**: Next.js (Static HTML Export)

### What Works on Cloudflare Pages ✅
- ✅ Static site generation (SSG)
- ✅ Client-side routing
- ✅ Standard `<img>` tags (no Next.js Image optimization)
- ✅ Dynamic imports with Suspense
- ✅ Client-side state management
- ✅ CSS/Tailwind styling
- ✅ Public assets (images, videos, fonts)
- ✅ Custom headers (`public/_headers`)
- ✅ Redirects (`public/_redirects`)

### What Doesn't Work on Cloudflare Pages ❌
- ❌ Server-side rendering (SSR) - `getServerSideProps`
- ❌ Incremental static regeneration (ISR) - `revalidate`
- ❌ API routes (`/api/*`) - use Cloudflare Workers/Functions instead
- ❌ Middleware (unless using Cloudflare Workers)
- ❌ Next.js Image optimization (`next/image` with optimization)
- ❌ Dynamic routes with fallback (`fallback: true`)
- ❌ On-demand revalidation
- ❌ Edge runtime features

### Migration Changes from Vercel
1. **Removed**: `next/image` → Replaced with standard `<img>` tags
2. **Removed**: Vercel Analytics → Can use Cloudflare Web Analytics instead
3. **Added**: `output: 'export'` in `next.config.mjs`
4. **Added**: `images.unoptimized: true`
5. **Added**: `.nvmrc` file (Node 20)

### Performance Considerations
- **No automatic image optimization** - Manually optimize images before deployment
  - Convert to WebP/AVIF for better compression
  - Use tools like ImageOptim, Squoosh, or Sharp
  - Add `loading="lazy"` for off-screen images
- **No CDN image resizing** - Serve appropriately sized images
- **Static assets cached via Cloudflare CDN** - Excellent global performance

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout (fonts, ErrorBoundary)
│   ├── page.js                   # Home - draggable canvas
│   ├── experiences/              # Interactive demos (clock, fish, cars)
│   ├── svg-animations/           # SVG animations (coinflip, comet, unlock)
│   ├── ui-interactions/          # UI component demos (image effects, chat)
│   └── tools/                    # Standalone tools (mosaic, draw-canvas)
├── components/
│   ├── Logo.js                   # Consolidated logo (variant: full/mini)
│   ├── ErrorBoundary.jsx         # Global error handling
│   ├── core/                     # App components (AppHeader, SidebarNav)
│   ├── canvas/                   # Canvas system (DraggableCanvas, CardContent)
│   ├── ui/                       # Shadcn/ui components
│   ├── backgrounds/              # Visual effects (GradientBlob)
│   ├── effects/                  # Animation effects (BreathingText)
│   ├── previews/                 # Preview components
│   └── unused/                   # Deprecated components (kept for reference)
├── data/
│   └── canvasData.js             # Canvas items (uses factory functions)
├── hooks/
│   ├── useTheme.jsx              # Theme management hook
│   └── use-mobile.jsx            # Mobile detection hook
└── lib/
    └── utils.js                  # Utility functions (cn, etc.)
```

---

## Design System

### Typography
- **Body**: Raleway (300-700)
- **Headings**: Merriweather (400, 700, 900)
- **Loading**: `display: 'swap'` for optimal performance

### Theme
- **Colors**: Slate palette
- **Mode**: Light/Dark via CSS variables
- **Implementation**: `useTheme` hook with localStorage persistence

### Layout
- **Canvas**: 60%-120% responsive scaling (1440px base)
- **Content**: 700-900px fixed width
- **Approach**: Mobile-first responsive

---

## Key Features

### 1. Draggable Canvas (Home Page)
Interactive infinite canvas showcasing all projects:
- **Pan/Drag**: Click-drag to navigate, mouse wheel to scroll
- **Debounced Resize**: Optimized performance (150ms debounce)
- **4 Visual Groups**: Experiments, Tools, Interactions, SVG Animations
- **Content Types**: Images, videos (autoplay), live React components
- **Hover Effects**: Tilt rotation + title overlay
- **Error Handling**: Individual items wrapped in ErrorBoundary

**Performance:**
- Standard `<img>` tags for images (Cloudflare Pages compatibility)
- Suspense boundaries for dynamic components
- 10000px canvas boundary

### 2. Content Sections
- **Experiences**: Fish school, World clock, Car configurator
- **UI Interactions**: 6 image manipulation demos + chat interface
- **SVG Animations**: Coin flip, Comet hero, Unlock
- **Tools**: Drawing canvas, Image mosaic (standalone, no nav)

### 3. Component Architecture
- **Reusable**: Modular design with factory functions
- **Dynamic Loading**: Next.js dynamic imports + Suspense
- **Error Boundaries**: Global + component-level protection
- **SSR-Safe**: Proper window/localStorage checks

---

## Development Standards

### File Naming
- **Components**: PascalCase (`.jsx`) - `AppHeader.js`, `CoinFlip.jsx`
- **Directories**: kebab-case - `ui-interactions`, `slate-cars`
- **Pages**: `page.js`, `layout.js` (Next.js convention)
- **Configs**: kebab-case - `navigation-config.js`

### Code Conventions
- **Language**: 100% JavaScript (no TypeScript)
- **Client Components**: `"use client"` directive where needed
- **Imports**: `@/` path alias for clean imports
- **Styling**: Tailwind utility classes, CSS variables for theming

### Performance Best Practices
- **Debouncing**: Resize handlers (150ms)
- **Image Loading**: Standard `<img>` tags with `loading="lazy"` attribute
- **Code Splitting**: Dynamic imports for heavy components
- **Error Handling**: ErrorBoundary at root + critical components
- **Hydration**: `suppressHydrationWarning` for time-based components
- **Static Export**: All pages pre-rendered at build time for Cloudflare Pages

---

## Notable Patterns

### Logo Component (`components/Logo.js`)
Single component with variants:
```javascript
<UIGlowLogo />               // Full logo (default)
<UIGlowLogo variant="mini" /> // Mini icon
```

### Theme Hook (`hooks/useTheme.jsx`)
Reusable theme management:
```javascript
const { isDark, toggleTheme } = useTheme();
```
- SSR-safe (checks `typeof window`)
- localStorage persistence
- System preference detection

### Canvas Factory Functions (`data/canvasData.js`)
DRY approach to canvas items:
```javascript
createImageCard('fish', {
  content: '/thumbnails/fish.gif',
  title: 'A School of Fish',
  position: { x: -120, y: 75 },
  size: { width: 280, height: 200 },
  rotation: -2,
  link: '/experiences/fish',
});
```

**Factory Functions:**
- `createImageCard()` - Image items
- `createVideoCard()` - Video items
- `createComponentCard()` - React component items
- `createGroupTitle()` - Section titles
- `createArrow()` - Visual arrows

**Common Props:**
- Auto-applied: `clickable`, `shadow`, `background`, `padding: 4`, `openInNewTab: true`
- Custom: `position`, `size`, `rotation`, `hoverRotation`, `link`, `backgroundColor`

### AppHeader Component
Two variants via `variant` prop:
- **Primary**: Rounded pill, fixed top-center (home page)
- **Secondary**: Full-width, bottom border (sub-pages with title)

### Error Boundary
Locations:
1. Root layout (`app/layout.js`) - catches all errors
2. Canvas components (`CardContent.jsx`) - isolates dynamic component failures

Shows user-friendly error UI with reload button (dev mode shows error details).

---

## Canvas System Deep Dive

### Architecture
- **DraggableCanvas.jsx**: Pan/zoom, boundaries, debounced resize, responsive scaling
- **DraggableItem.jsx**: Individual items with drag, hover effects
- **CardContent.jsx**: Content renderer (image/video/component) with Suspense + ErrorBoundary
- **canvasData.js**: Configuration with factory functions

### Content Types
- `image` - Standard `<img>` tags (Cloudflare Pages compatible)
- `video` - Autoplay, muted, loop, playsInline
- `component` - Dynamic import with Suspense fallback
- `text` - Centered text
- `group-title` - Section headers
- `arrow` - Hand-drawn SVG arrows

### Adding New Canvas Items
1. Use factory function in `canvasData.js`:
   ```javascript
   createImageCard('my-item', {
     content: '/thumbnails/my-item.gif',
     title: 'My Item',
     position: { x: 100, y: 200 },
     size: { width: 240, height: 170 },
     rotation: 2,
     link: '/my-route',
   })
   ```
2. Add thumbnail to `public/thumbnails/`
3. For components: Add to `componentMap` in `CardContent.jsx`

### Performance Features
- **Debounced resize**: 150ms (avoids 500+ calls during resize)
- **Suspense**: Loading skeleton for dynamic components
- **Error isolation**: Failed components don't crash canvas
- **Drag threshold**: 3px to differentiate click from drag
- **Viewport positioning**: Centers at 500x400, scales 60-120%

---

## Common Tasks

### Add a New Experience
1. Create directory: `src/app/experiences/my-experience/`
2. Add `page.js` and component files
3. Add to `navigation-config.js` (if using sidebar)
4. Add canvas item to `canvasData.js` using factory function
5. Add thumbnail to `public/thumbnails/`

### Add a New Tool
1. Create: `src/app/tools/my-tool/page.js`
2. Use `AppHeader` with `variant="secondary"` and custom title
3. Add canvas item (tools group) to `canvasData.js`
4. Tools don't need navigation config (standalone)

### Modify Theme
- Edit `hooks/useTheme.jsx` for logic
- CSS variables in `app/globals.css`
- Tailwind config in `tailwind.config.mjs`

### Add Utility Function
Add to `lib/utils.js` - current utilities:
- `cn()` - className merger (clsx + tailwind-merge)

---

## Scripts

```bash
npm run dev    # Development with Turbopack
npm run build  # Production static export (outputs to /out)
npm run start  # Production server (for local testing only)
npm run lint   # ESLint check
```

**Note for Cloudflare Pages**:
- Use `npm run build` to generate static export
- Output directory: `out/` (configured in Cloudflare Pages)
- Preview locally: `npx serve out`

---

## Asset Guidelines

### Images
- **Thumbnails**: GIF or PNG in `public/thumbnails/`
- **Implementation**: Standard `<img>` tags (Cloudflare Pages compatible)
- **Optimization**: Manually optimize before deployment (WebP/AVIF recommended)
- **Lazy Loading**: Add `loading="lazy"` for off-screen images
- **Sizing**: Use CSS/Tailwind classes for responsive sizing

### Videos
- Format: MP4
- Location: `public/thumbnails/`
- Attributes: autoplay, muted, loop, playsInline

### Icons
- **Primary**: Lucide React (consistent design system)
- **Secondary**: React Icons (when Lucide doesn't have it)
- **Usage**: Import only what you need

---

## Performance Checklist

✅ **Implemented:**
- Debounced resize handlers
- Standard `<img>` tags (Cloudflare Pages compatible)
- Dynamic imports with Suspense
- Error boundaries
- SSR-safe code
- Removed duplicate files
- Consolidated components
- Factory functions for DRY code
- Static export for Cloudflare Pages
- Node.js 20 build environment

⏳ **Future Optimizations:**
- Bundle analyzer (track bundle size)
- Intersection observer (canvas items)
- Image optimization (convert to WebP/AVIF)
- Add `loading="lazy"` to off-screen images
- Additional utility functions
- Cloudflare Web Analytics integration

---

## Troubleshooting

### Hydration Errors
- Check for `suppressHydrationWarning` on time-based components
- Ensure SSR checks: `typeof window === 'undefined'`
- Initial state should match server render

### Canvas Performance
- Resize lag? Check debounce is working (150ms delay)
- Too many items? Consider intersection observer
- Animations janky? Verify GPU acceleration (`will-change` CSS)

### Theme Not Persisting
- Check localStorage in browser dev tools
- Verify `useTheme` hook is imported correctly
- Ensure no conflicting theme scripts

### Component Not Loading
- Check `componentMap` in `CardContent.jsx`
- Verify dynamic import path is correct
- Look for errors in ErrorBoundary UI

---

## Notes for AI Agents

- **100% JavaScript codebase** - no TypeScript
- **Motion library** (not Framer Motion) - import from `motion/react`
- **Lucide icons preferred** - consistent with design system
- **Factory functions** - use for canvas items (DRY principle)
- **Error boundaries** - wrap risky components
- **SSR awareness** - always check `typeof window` before browser APIs
- **Path alias**: `@/` = `src/`
- **Cloudflare Pages deployment** - Static export only, no SSR/ISR/API routes
- **Image handling** - Use standard `<img>` tags, NOT `next/image`
- **Build command** - `npm run build` outputs to `out/` directory
- **Next.js version** - 15.5.9 (latest stable 15.x)
- **React version** - 18.3.1 (not React 19 yet)
