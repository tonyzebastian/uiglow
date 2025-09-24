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
│   ├── page.js                   # Home page
│   ├── globals.css               # Global styles and CSS variables
│   ├── experiences/              # Interactive experiences
│   │   ├── clock/                # World clock experience
│   │   ├── fish/                 # School of fish simulation
│   │   └── slate-cars/           # Car configuration demo
│   ├── svg-animations/           # SVG-based animations
│   │   ├── coinflip/             # Coin flip animation
│   │   ├── comethero/            # Comet hero animation
│   │   └── unlock/               # Lock/unlock animation
│   └── ui-interactions/          # UI component demonstrations
│       ├── jellytags/            # Interactive jelly tags
│       ├── upvote/               # Upvote component
│       ├── music-player/         # Music player UI
│       ├── toolbar/              # Toolbar component
│       ├── btn-variations/       # Button variations
│       └── img-tile/             # Image tile component
├── components/                   # Reusable components
│   ├── core/                     # Core application components
│   │   ├── AppHeader.js          # Application header
│   │   ├── ExperienceCard.jsx    # Card component for experiences
│   │   ├── PageLayout.jsx        # Page layout wrapper
│   │   └── SidebarNav.jsx        # Navigation sidebar
│   ├── ui/                       # Shadcn/ui components
│   ├── backgrounds/              # Background components
│   │   └── GradientBlob.jsx      # Animated gradient blob
│   ├── effects/                  # Visual effects
│   │   └── BreathingText.jsx     # Breathing text animation
│   └── previews/                 # Preview components
│       └── ClockPreview.jsx      # Clock preview component
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
- **Three-column layout**: Left sidebar + main content + right sidebar
- **Grid systems**: 2-column grids for cards
- **Responsive design**: Mobile-first approach
- **Fixed width content**: 700-900px main content area

## Key Features

### 1. Experiences Section
Interactive demos and experiments:
- Fish school simulation
- World clock visualization
- Car configuration interface
- Gradient experiments

### 2. UI Interactions Section
Component demonstrations:
- Interactive jelly tags
- Upvote animations
- Music player interface
- Toolbar components
- Button variations
- Image tile interactions

### 3. SVG Animations Section
Vector-based animations:
- Coin flip mechanics
- Comet hero animations
- Lock/unlock transitions

### 4. Component Architecture
- **Reusable components**: Modular design
- **Props-based configuration**: Flexible component API
- **Mixed rendering**: Image and component previews
- **Navigation configs**: Centralized route definitions

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

### 1. Experience Cards System
Dynamic card rendering supporting both image and component previews with consistent props API.

### 2. Navigation Configuration
Centralized navigation definitions for each section, enabling easy route management.

### 3. Theme System
Comprehensive CSS variable system supporting light/dark modes with custom color schemes.

### 4. Animation Integration
Seamless integration of Motion library with custom CSS animations for rich interactions.

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
- **Patterns**: Experience cards, navigation configs, component previews