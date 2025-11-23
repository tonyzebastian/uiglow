'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function MosaicPhotoEffect({
  grainTextureUrl = '/tools/texture-pattern.jpg',
  defaultImage = '/thumbnails/mosaic_1.jpg'
}) {
  // State
  const [image, setImage] = useState(defaultImage);
  const [tileSize, setTileSize] = useState(15);
  const [resolution, setResolution] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [progress, setProgress] = useState(0);

  // Refs
  const sourceCanvasRef = useRef(null);
  const mosaicCanvasRef = useRef(null);
  const grainImageRef = useRef(null);
  const fileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Enhance color saturation based on brightness
  const enhanceColor = useCallback((color) => {
    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;

    // Convert to HSL-like approach for saturation boost
    const max = Math.max(color.r, color.g, color.b);
    const min = Math.min(color.r, color.g, color.b);
    const delta = max - min;

    if (delta === 0) return color; // Grayscale, no saturation to enhance

    // For darker colors (luminance < 0.5), make them darker and more saturated
    // For lighter colors (luminance >= 0.5), make them brighter and more saturated
    let saturationBoost, brightnessAdjust;

    if (luminance < 0.5) {
      // Dark colors: increase saturation, decrease brightness
      saturationBoost = 1.3;
      brightnessAdjust = 0.85;
    } else {
      // Light colors: increase saturation, increase brightness
      saturationBoost = 1.3;
      brightnessAdjust = 1.15;
    }

    // Apply saturation boost by pushing colors away from gray
    const gray = (color.r + color.g + color.b) / 3;
    let r = gray + (color.r - gray) * saturationBoost;
    let g = gray + (color.g - gray) * saturationBoost;
    let b = gray + (color.b - gray) * saturationBoost;

    // Apply brightness adjustment
    r = r * brightnessAdjust;
    g = g * brightnessAdjust;
    b = b * brightnessAdjust;

    // Clamp values and ensure blacks are not pure black (minimum value of 20)
    const minBlackLevel = 20;
    return {
      r: Math.max(minBlackLevel, Math.min(255, Math.round(r))),
      g: Math.max(minBlackLevel, Math.min(255, Math.round(g))),
      b: Math.max(minBlackLevel, Math.min(255, Math.round(b))),
      a: color.a
    };
  }, []);

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

    const avgColor = {
      r: Math.round(r / pixelCount),
      g: Math.round(g / pixelCount),
      b: Math.round(b / pixelCount),
      a: Math.round(a / pixelCount)
    };

    // Enhance the color for more saturated look
    return enhanceColor(avgColor);
  }, [enhanceColor]);

  // Darken color for borders
  const darkenColor = useCallback((color, factor) => {
    return {
      r: Math.round(color.r * (1 - factor)),
      g: Math.round(color.g * (1 - factor)),
      b: Math.round(color.b * (1 - factor)),
      a: color.a
    };
  }, []);

  // Blend a color with its neighbors
  const blendWithNeighbors = useCallback((colorGrid, tileX, tileY, totalTilesX, totalTilesY) => {
    const currentColor = colorGrid[tileY][tileX];

    // Weights for blending
    const centerWeight = 0.65; // Current tile
    const directWeight = 0.06; // Direct neighbors (N, S, E, W)
    const diagonalWeight = 0.025; // Diagonal neighbors (NE, NW, SE, SW)

    let r = currentColor.r * centerWeight;
    let g = currentColor.g * centerWeight;
    let b = currentColor.b * centerWeight;
    let a = currentColor.a * centerWeight;

    // Define neighbor offsets: [dy, dx, weight]
    const neighbors = [
      [-1, 0, directWeight],   // North
      [1, 0, directWeight],    // South
      [0, -1, directWeight],   // West
      [0, 1, directWeight],    // East
      [-1, -1, diagonalWeight], // NW
      [-1, 1, diagonalWeight],  // NE
      [1, -1, diagonalWeight],  // SW
      [1, 1, diagonalWeight]    // SE
    ];

    // Add neighbor colors with their weights
    for (const [dy, dx, weight] of neighbors) {
      const ny = tileY + dy;
      const nx = tileX + dx;

      // Check if neighbor exists
      if (ny >= 0 && ny < totalTilesY && nx >= 0 && nx < totalTilesX) {
        const neighborColor = colorGrid[ny][nx];
        r += neighborColor.r * weight;
        g += neighborColor.g * weight;
        b += neighborColor.b * weight;
        a += neighborColor.a * weight;
      }
    }

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
      a: Math.round(a)
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
      // Apply resolution percentage to original dimensions
      const scale = resolution / 100;
      let width = Math.floor(img.width * scale);
      let height = Math.floor(img.height * scale);

      // Set canvas dimensions
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      mosaicCanvas.width = width;
      mosaicCanvas.height = height;

      setImageDimensions({ width, height });

      // Draw scaled image to source canvas
      sourceCtx.drawImage(img, 0, 0, width, height);

      // Calculate total tiles for progress tracking
      const totalTilesX = Math.ceil(width / tileSize);
      const totalTilesY = Math.ceil(height / tileSize);
      const totalTiles = totalTilesX * totalTilesY;
      let processedTiles = 0;

      // PASS 1: Calculate all tile colors and store in a 2D grid
      const colorGrid = [];
      for (let tileY = 0; tileY < totalTilesY; tileY++) {
        colorGrid[tileY] = [];
        for (let tileX = 0; tileX < totalTilesX; tileX++) {
          const x = tileX * tileSize;
          const y = tileY * tileSize;
          const actualTileWidth = Math.min(tileSize, width - x);
          const actualTileHeight = Math.min(tileSize, height - y);

          // Get pixel data for this tile
          const imageData = sourceCtx.getImageData(x, y, actualTileWidth, actualTileHeight);

          // Calculate and store average color
          colorGrid[tileY][tileX] = calculateAverageColor(imageData);

          // Update progress (50% for first pass)
          processedTiles++;
          setProgress((processedTiles / totalTiles) * 50);
        }
      }

      // PASS 2: Blend with neighbors and draw tiles
      processedTiles = 0;
      for (let tileY = 0; tileY < totalTilesY; tileY++) {
        for (let tileX = 0; tileX < totalTilesX; tileX++) {
          const x = tileX * tileSize;
          const y = tileY * tileSize;
          const actualTileWidth = Math.min(tileSize, width - x);
          const actualTileHeight = Math.min(tileSize, height - y);

          // Blend color with neighbors
          const blendedColor = blendWithNeighbors(colorGrid, tileX, tileY, totalTilesX, totalTilesY);

          // Draw tile with blended color
          drawTile(mosaicCtx, x, y, actualTileWidth, actualTileHeight, blendedColor);

          // Update progress (50-100% for second pass)
          processedTiles++;
          setProgress(50 + (processedTiles / totalTiles) * 50);
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
  }, [image, tileSize, resolution, calculateAverageColor, drawTile, blendWithNeighbors]);

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
  }, [tileSize, resolution, image, generateMosaic]);

  // Initial mosaic generation
  useEffect(() => {
    if (image) {
      generateMosaic();
    }
  }, [image]);

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Hidden elements */}
      <canvas ref={sourceCanvasRef} className="hidden" />
      <img ref={grainImageRef} src={grainTextureUrl} alt="" className="hidden" crossOrigin="anonymous" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Canvas Area - Fixed viewport container */}
      <div
        className="m-8 overflow-auto rounded-lg bg-slate-50 dark:bg-slate-900 scrollbar-hide border border-slate-200"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        {!image ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-64 h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No image uploaded</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} size="lg">
                <Upload className="w-4 h-4" />
                Upload Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-w-full min-h-full flex items-center justify-center relative">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400">Processing... {Math.round(progress)}%</div>
              </div>
            )}
            <div className="p-6">
              <canvas
                ref={mosaicCanvasRef}
                className="block rounded-lg shadow border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      {image && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-10">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              {/* Quality Control */}
              <Select value={resolution.toString()} onValueChange={(value) => setResolution(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="125">125%</SelectItem>
                  <SelectItem value="150">150%</SelectItem>
                </SelectContent>
              </Select>

              {/* Tile Size Control */}
              <input
                type="range"
                min="5"
                max="50"
                value={tileSize}
                onChange={(e) => setTileSize(parseInt(e.target.value))}
                className="w-[250px] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Separator */}
            <Separator orientation="vertical" className="h-8" />

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Upload Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="sm"
              >
                <Upload className="w-4 h-4" />
              </Button>

              {/* Download Button */}
              <Button
                onClick={exportMosaic}
                disabled={isProcessing}
                size="sm"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
