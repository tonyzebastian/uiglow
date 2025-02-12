export default function GradientNoise() {
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 400"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="5"
              numOctaves="10"
              stitchTiles="stitch"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          filter="url(#noiseFilter)"
          className="opacity-30"
        />
        <rect
          width="100%"
          height="100%"
          className="mix-blend-overlay"
          fill="url(#gradient)"
        />
        <linearGradient id="gradient" gradientTransform="rotate(15)">
          <stop offset="0%" stopColor="rgba(111,123,247,1)" />
          <stop offset="100%" stopColor="rgba(155,248,244,1)" />
        </linearGradient>
      </svg>
    );
  }