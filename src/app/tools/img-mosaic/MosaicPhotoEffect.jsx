'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';

export default function MosaicPhotoEffect({
  grainTextureUrl = '/tools/texture-pattern.jpg',
  defaultImage = 'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731403/1_d8uozd.jpg'
}) {
  // State
  const [image, setImage] = useState(defaultImage);
  const [tileSize, setTileSize] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Refs
  const sourceCanvasRef = useRef(null);
  const mosaicCanvasRef = useRef(null);
  const grainImageRef = useRef(null);
  const fileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Calculate average color from image data
  const calculateAverageColor = useCallback((imageData) => {
    let r = 0, g = 0, b = 0, a = 0;
    const pixels = imageData.data;
    const pixelCount = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
      a += pixels[i + 3];
    }

    return {
      r: Math.round(r / pixelCount),
      g: Math.round(g / pixelCount),
      b: Math.round(b / pixelCount),
      a: Math.round(a / pixelCount)
    };
  }, []);

  // Darken color for borders
  const darkenColor = useCallback((color, factor) => {
    return {
      r: Math.round(color.r * (1 - factor)),
      g: Math.round(color.g * (1 - factor)),
      b: Math.round(color.b * (1 - factor)),
      a: color.a
    };
  }, []);

  // Draw a single tile with border
  const drawTile = useCallback((ctx, x, y, width, height, color) => {
    // Draw main tile
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
    ctx.fillRect(x, y, width, height);

    // Draw border (darker version)
    const borderColor = darkenColor(color, 0.3);
    ctx.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a / 255})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }, [darkenColor]);

  // Generate mosaic from source image
  const generateMosaic = useCallback(() => {
    if (!image) return;

    setIsProcessing(true);

    const sourceCanvas = sourceCanvasRef.current;
    const mosaicCanvas = mosaicCanvasRef.current;
    const grainImage = grainImageRef.current;
    const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    const mosaicCtx = mosaicCanvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate scaled dimensions to fit viewport (max 800px)
      const maxDimension = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      // Set canvas dimensions
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      mosaicCanvas.width = width;
      mosaicCanvas.height = height;

      setImageDimensions({ width, height });

      // Draw scaled image to source canvas
      sourceCtx.drawImage(img, 0, 0, width, height);

      // Generate mosaic tiles
      for (let y = 0; y < height; y += tileSize) {
        for (let x = 0; x < width; x += tileSize) {
          // Get actual tile dimensions (handle edge cases)
          const actualTileWidth = Math.min(tileSize, width - x);
          const actualTileHeight = Math.min(tileSize, height - y);

          // Get pixel data for this tile
          const imageData = sourceCtx.getImageData(x, y, actualTileWidth, actualTileHeight);

          // Calculate average color
          const avgColor = calculateAverageColor(imageData);

          // Draw tile
          drawTile(mosaicCtx, x, y, actualTileWidth, actualTileHeight, avgColor);
        }
      }

      // Apply texture directly to canvas using composite operation
      if (grainImage && grainImage.complete) {
        // Apply grunge texture with reduced opacity
        mosaicCtx.globalCompositeOperation = 'color-dodge';
        mosaicCtx.globalAlpha = 0.4;
        mosaicCtx.drawImage(grainImage, 0, 0, width, height);

        // Add grain noise on top using a temporary canvas
        const grainCanvas = document.createElement('canvas');
        grainCanvas.width = width;
        grainCanvas.height = height;
        const grainCtx = grainCanvas.getContext('2d');

        // Generate procedural grain on temporary canvas
        const grainData = grainCtx.createImageData(width, height);
        for (let i = 0; i < grainData.data.length; i += 4) {
          const noise = Math.random() * 255;
          grainData.data[i] = noise;     // R
          grainData.data[i + 1] = noise; // G
          grainData.data[i + 2] = noise; // B
          grainData.data[i + 3] = 255;   // A
        }
        grainCtx.putImageData(grainData, 0, 0);

        // Draw grain with overlay blend mode
        mosaicCtx.globalCompositeOperation = 'overlay';
        mosaicCtx.globalAlpha = 0.15;
        mosaicCtx.drawImage(grainCanvas, 0, 0);

        // Reset composite operation and alpha
        mosaicCtx.globalCompositeOperation = 'source-over';
        mosaicCtx.globalAlpha = 1.0;
      }

      setIsProcessing(false);
    };

    img.src = image;
  }, [image, tileSize, calculateAverageColor, drawTile]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Export mosaic as PNG
  const exportMosaic = () => {
    const mosaicCanvas = mosaicCanvasRef.current;

    if (!mosaicCanvas) return;

    // The canvas already has the texture and grain applied, so just export it directly
    const dataURL = mosaicCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'mosaic-photo.png';
    link.href = dataURL;
    link.click();
  };

  // Debounced regeneration when tile size changes
  useEffect(() => {
    if (!image) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      generateMosaic();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [tileSize, image, generateMosaic]);

  // Initial mosaic generation
  useEffect(() => {
    if (image) {
      generateMosaic();
    }
  }, [image]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      {/* Hidden canvases for processing */}
      <canvas ref={sourceCanvasRef} className="hidden" />

      {/* Grain texture (preload) */}
      <img
        ref={grainImageRef}
        src={grainTextureUrl}
        alt=""
        className="hidden"
        crossOrigin="anonymous"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {!image ? (
        // Upload Area
        <div className="flex flex-col items-center gap-6">
          <div className="w-64 h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
            <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No image uploaded</p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
        </div>
      ) : (
        // Mosaic Display & Controls
        <div className="flex flex-col items-center gap-6 w-full max-w-6xl">
          {/* Controls */}
          <div className="w-full flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 flex-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Tile Size:
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={tileSize}
                onChange={(e) => setTileSize(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-mono text-slate-600 dark:text-slate-400 w-12 text-right">
                {tileSize}px
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                New Image
              </button>

              <button
                onClick={exportMosaic}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export PNG
              </button>
            </div>
          </div>

          {/* Mosaic Preview */}
          <div className="relative bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 overflow-auto max-h-[70vh]">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400">Processing...</div>
              </div>
            )}

            <canvas
              ref={mosaicCanvasRef}
              className="max-w-full h-auto block"
            />
          </div>

          {/* Image Info */}
          {imageDimensions.width > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {imageDimensions.width} × {imageDimensions.height} pixels
            </div>
          )}
        </div>
      )}
    </div>
  );
}
