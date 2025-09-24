# UiGlow ✨

A modern React component showcase and experimentation platform built with Next.js 15, featuring interactive animations, UI demonstrations, and immersive experiences.

![Next.js](https://img.shields.io/badge/Next.js-15.1.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Support-3178C6?style=flat-square&logo=typescript)

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/uiglow.git
cd uiglow

# Install dependencies
npm install

# Start development server with Turbopack
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running.

## 🚀 What is UiGlow?

UiGlow is a comprehensive showcase platform for modern UI components and interactive experiences. It features:

- **🎨 Interactive Experiences** - Immersive demos like fish simulations and car configurators
- **🔧 UI Component Library** - Demonstrations of reusable UI patterns and interactions
- **📱 SVG Animations** - Smooth, performant vector animations
- **🌙 Dark Mode** - Full theme support with CSS variables
- **📱 Responsive Design** - Mobile-first approach with modern layouts

## 📁 Project Structure

```
uiglow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── experiences/        # Interactive experiences
│   │   │   ├── clock/         # World clock visualization
│   │   │   ├── fish/          # Fish school simulation
│   │   │   └── slate-cars/    # Car configuration demo
│   │   ├── svg-animations/    # SVG-based animations
│   │   └── ui-interactions/   # UI component demonstrations
│   ├── components/            # Reusable React components
│   │   ├── core/             # App-level components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── backgrounds/      # Background components
│   │   ├── effects/          # Visual effects
│   │   └── previews/         # Preview components
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utility functions
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15.1.2** - Full-stack React framework with App Router
- **React 18** - Component library with modern features
- **TypeScript/JavaScript** - Type-safe development (mixed usage)

### Styling & Design
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Shadcn/ui** - High-quality accessible components
- **CSS Variables** - Dynamic theming system
- **Custom Fonts** - Raleway (body) & Bitter (headings)

### Animation & Interaction
- **Motion 12.22.0** - Performant animation library
- **Lucide React** - Beautiful icon library
- **Custom CSS animations** - Hand-crafted transitions

### Development Tools
- **Turbopack** - Lightning-fast bundler
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing pipeline

## 🎯 Features & Sections

### 🎪 Experiences
Interactive demonstrations showcasing complex UI patterns:

- **Fish School Simulation** - Realistic fish behavior with dynamic interactions
- **World Clock** - Visual timezone representation
- **Car Configuration** - Immersive product customization experience

### 🎛️ UI Interactions
Component demonstrations for common UI patterns:

- **Interactive Tags** - Jelly-like animated tags
- **Upvote Components** - Social interaction elements
- **Music Player UI** - Media control interfaces
- **Toolbar Components** - Professional app toolbars
- **Button Variations** - Different button styles and states
- **Image Tiles** - Interactive image components

### 🎨 SVG Animations
Vector-based animations for smooth performance:

- **Coin Flip** - Physics-based flip animation
- **Comet Hero** - Dynamic hero animations
- **Lock/Unlock** - State transition animations

## 🚦 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks

# Additional commands
npm run typecheck    # Type checking (if using TypeScript)
npm run preview      # Preview production build
```

## 🎨 Design System

### Typography
- **Body Text**: Raleway (300-700 weights)
- **Headings**: Bitter (500-700 weights)
- **Loading**: Next.js font optimization with `display: 'swap'`

### Color Palette
- **Base**: Slate color system
- **Themes**: Light and dark mode support
- **Custom Variables**: Component-specific colors
- **Semantic**: Shadcn/ui color conventions

### Layout Patterns
- **Three-column Layout**: Sidebar + Content + Sidebar
- **Grid Systems**: Responsive grid layouts
- **Fixed Width**: Optimized content containers (700-900px)

## 📚 How to Use This Repository

### For Developers

1. **Explore Components**: Browse `/src/components` for reusable patterns
2. **Study Experiences**: Check `/src/app/experiences` for complex implementations
3. **Learn Animations**: Examine `/src/app/svg-animations` for animation techniques
4. **Understand Structure**: Review the consistent file organization

### For Designers

1. **Component Library**: View live components at `/ui-interactions`
2. **Animation Patterns**: See animations in action at `/svg-animations`
3. **Layout Examples**: Study responsive layouts in experiences
4. **Theme System**: Examine CSS variables in `globals.css`

### For Learning

1. **Start with Simple Components**: Begin in `/ui-interactions`
2. **Progress to Experiences**: Move to complex `/experiences`
3. **Study Animation**: Learn from `/svg-animations`
4. **Build Your Own**: Use existing patterns as templates

## 🔧 Adding New Components

### 1. Create Component Structure
```bash
# For UI interactions
mkdir src/app/ui-interactions/your-component
touch src/app/ui-interactions/your-component/page.js
touch src/app/ui-interactions/your-component/YourComponent.jsx
```

### 2. Follow Naming Conventions
- **Directories**: `kebab-case`
- **Components**: `PascalCase.jsx`
- **Pages**: `page.js`
- **Configs**: `kebab-case.js`

### 3. Update Navigation
Add your component to the navigation config:
```javascript
// src/app/ui-interactions/navigation-config.js
export const navItems = [
  // ... existing items
  { label: "Your Component", href: "/ui-interactions/your-component" },
];
```

### 4. Create Preview (Optional)
For homepage previews, create in `/src/components/previews/`

## 🎯 Best Practices

### Code Style
- Use TypeScript types where beneficial
- Follow existing component patterns
- Maintain consistent prop interfaces
- Document complex logic

### Performance
- Optimize images and assets
- Use dynamic imports for large components
- Implement proper loading states
- Leverage Next.js built-in optimizations

### Accessibility
- Follow ARIA guidelines
- Ensure keyboard navigation
- Maintain proper color contrast
- Test with screen readers

### Responsive Design
- Mobile-first approach
- Test on various screen sizes
- Use Tailwind responsive utilities
- Consider touch interactions

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-component`
3. **Follow naming conventions** (see CLAUDE.md for details)
4. **Add your component** with proper documentation
5. **Test thoroughly** across different devices
6. **Submit a pull request** with clear description

### Contribution Guidelines
- Follow existing code patterns
- Add components to appropriate sections
- Include responsive design considerations
- Test both light and dark themes
- Update navigation configs as needed

## 📝 Documentation

- **CLAUDE.md** - Detailed technical context for AI agents and developers
- **components.json** - Shadcn/ui configuration
- **tailwind.config.mjs** - Tailwind customization
- **next.config.mjs** - Next.js configuration

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
```bash
npm run build
# Check for TypeScript errors or missing dependencies
```

**Style Issues:**
- Verify Tailwind classes are correct
- Check CSS variable definitions in `globals.css`
- Ensure proper theme switching

**Import Errors:**
- Verify file paths match the naming conventions
- Check if components are properly exported
- Ensure all dependencies are installed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- [Motion](https://motion.dev/) - Animation library
- [Lucide](https://lucide.dev/) - Icon library

---

**Made with ❤️ and modern web technologies**

*UiGlow - Where components come to life*