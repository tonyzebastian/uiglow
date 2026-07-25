'use client';

import { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import DrawingToolbar from './DrawingToolbar';

// Constants
const CORNER_RADIUS = 12;
const DOT_SPACING = 20;
const DOT_SIZE = 2;
const MAX_GRID_COLUMNS = 3;
const SHADOW_CONFIG = {
  color: 'rgba(0, 0, 0, 0.1)',
  blur: 15,
  offsetX: 0,
  offsetY: 4
};

// Helper: Draw rounded rectangle path
const drawRoundedRectPath = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const DrawingCanvas = forwardRef(({
  // Canvas config
  canvasConfig = {},
  // Image config
  imageConfig = {},
  // Drawing config
  drawingConfig = {},
  // Toolbar config
  toolbarConfig = {},
  // Ref for external access
}, ref) => {
  // Destructure configs with defaults
  const {
    width = 800,
    height = 501,
    borderColor = '#d1d5db',
    showDottedPattern = true
  } = canvasConfig;

  const {
    urls = [],
    size: imageSize = 600,
    padding: imagePadding = 20,
    gap: imageGap = 20,
    showShadow: showImageShadow = true,
    showImages = true
  } = imageConfig;

  const {
    strokeColor = '#000000',
    strokeWidth = 2
  } = drawingConfig;

  // Toolbar config: Controls toolbar visibility and button options
  // - show: true/false to toggle entire toolbar
  // - showUpload/showClear/showSave: individual button visibility
  const {
    show: showToolbar = true,
    showUpload = true,
    showClear = true,
    showSave = true
  } = toolbarConfig;

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundImagesData, setBackgroundImagesData] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentColor, setCurrentColor] = useState(strokeColor);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(strokeWidth);
  const [currentImageSize, setCurrentImageSize] = useState(imageSize);
  const [showDottedPatternState, setShowDottedPatternState] = useState(showDottedPattern);
  const [showImagesState, setShowImagesState] = useState(showImages);
  const [saveCounter, setSaveCounter] = useState(1);

  // Refs
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const fileInputRef = useRef(null);

  // Draw white background with optional dotted pattern
  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dotted pattern if enabled
    if (showDottedPatternState) {
      ctx.fillStyle = '#d1d5db';
      for (let x = 0; x < canvas.width; x += DOT_SPACING) {
        for (let y = 0; y < canvas.height; y += DOT_SPACING) {
          ctx.fillRect(x, y, DOT_SIZE, DOT_SIZE);
        }
      }
    }
  }, [showDottedPatternState]);

  // Helper function to draw a single image with padding and shadow
  const drawSingleImage = useCallback((ctx, img, x, y, imgWidth, imgHeight) => {
    // Draw white padding and shadow if enabled
    if (imagePadding > 0) {
      // Set shadow if enabled
      if (showImageShadow) {
        ctx.shadowColor = SHADOW_CONFIG.color;
        ctx.shadowBlur = SHADOW_CONFIG.blur;
        ctx.shadowOffsetX = SHADOW_CONFIG.offsetX;
        ctx.shadowOffsetY = SHADOW_CONFIG.offsetY;
      }

      ctx.fillStyle = '#ffffff';

      // Draw rounded rectangle around image
      const rectX = x - imagePadding;
      const rectY = y - imagePadding;
      const rectWidth = imgWidth + (imagePadding * 2);
      const rectHeight = imgHeight + (imagePadding * 2);

      drawRoundedRectPath(ctx, rectX, rectY, rectWidth, rectHeight, CORNER_RADIUS);
      ctx.fill();
    }

    // Reset shadow for image drawing
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Clip to rounded rectangle for image
    ctx.save();
    drawRoundedRectPath(ctx, x, y, imgWidth, imgHeight, CORNER_RADIUS);
    ctx.clip();

    // Draw image with rounded corners
    ctx.drawImage(img, x, y, imgWidth, imgHeight);

    ctx.restore();
  }, [imagePadding, showImageShadow]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentStrokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawBackground();
  }, [width, height, drawBackground]);

  // Update stroke style when color or width changes
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentStrokeWidth;
  }, [currentColor, currentStrokeWidth]);

  // Load background images (from props or uploaded)
  useEffect(() => {
    const imageSources = uploadedImages.length > 0 ? uploadedImages : urls;

    if (!showImagesState || !imageSources || imageSources.length === 0) {
      setBackgroundImagesData([]);
      drawBackground();
      return;
    }

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const loadedImages = [];
    let loadedCount = 0;
    let isMounted = true;

    imageSources.forEach((src, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (!isMounted) return;

        // Calculate scaled dimensions based on the toolbar image-size control.
        const scale = Math.min(currentImageSize / img.width, currentImageSize / img.height);
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;

        loadedImages[index] = {
          img,
          width: imgWidth,
          height: imgHeight
        };

        loadedCount++;

        // When all images are loaded, calculate grid and draw
        if (loadedCount === imageSources.length) {
          drawBackground();

          const numImages = loadedImages.length;
          const imagesData = [];

          if (numImages === 1) {
            const { img } = loadedImages[0];
            // A single image is a canvas background: preserve its aspect ratio
            // while covering the full drawing area, cropping only the excess.
            const coverScale = Math.max(canvas.width / img.width, canvas.height / img.height)
              * (currentImageSize / imageSize);
            const scaledImgWidth = img.width * coverScale;
            const scaledImgHeight = img.height * coverScale;
            const x = (canvas.width - scaledImgWidth) / 2;
            const y = (canvas.height - scaledImgHeight) / 2;

            drawSingleImage(ctx, img, x, y, scaledImgWidth, scaledImgHeight);
            imagesData.push({ img, x, y, width: scaledImgWidth, height: scaledImgHeight });
            setBackgroundImagesData(imagesData);
            return;
          }

          const cols = Math.min(numImages, MAX_GRID_COLUMNS);
          const rows = Math.ceil(numImages / cols);

          // Calculate grid dimensions
          const gridWidth = (currentImageSize * cols) + (imageGap * (cols - 1));
          const gridHeight = (currentImageSize * rows) + (imageGap * (rows - 1));

          // Calculate available canvas space (with padding for borders)
          const canvasPadding = imagePadding * 4; // Extra padding from edges
          const maxGridWidth = canvas.width - canvasPadding;
          const maxGridHeight = canvas.height - canvasPadding;

          // Scale down grid if it exceeds canvas dimensions
          let gridScale = 1;
          if (gridWidth > maxGridWidth || gridHeight > maxGridHeight) {
            gridScale = Math.min(maxGridWidth / gridWidth, maxGridHeight / gridHeight);
          }

          // Apply scale to all image dimensions
          const scaledImageSize = currentImageSize * gridScale;
          const scaledGridWidth = gridWidth * gridScale;
          const scaledGridHeight = gridHeight * gridScale;

          // Center the grid on canvas
          const startX = (canvas.width - scaledGridWidth) / 2;
          const startY = (canvas.height - scaledGridHeight) / 2;

          // Draw each image in grid
          loadedImages.forEach((imgData, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);

            // Calculate cell position with scaled dimensions
            const cellX = startX + (col * (scaledImageSize + imageGap * gridScale));
            const cellY = startY + (row * (scaledImageSize + imageGap * gridScale));

            // Scale image dimensions
            const scaledImgWidth = imgData.width * gridScale;
            const scaledImgHeight = imgData.height * gridScale;

            // Center image within cell
            const x = cellX + (scaledImageSize - scaledImgWidth) / 2;
            const y = cellY + (scaledImageSize - scaledImgHeight) / 2;

            drawSingleImage(ctx, imgData.img, x, y, scaledImgWidth, scaledImgHeight);

            imagesData.push({
              img: imgData.img,
              x,
              y,
              width: scaledImgWidth,
              height: scaledImgHeight
            });
          });

          setBackgroundImagesData(imagesData);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        loadedCount++;
      };

      img.src = src;
    });

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [urls, uploadedImages, currentImageSize, imagePadding, showImageShadow, imageGap, showImagesState, drawBackground, drawSingleImage]);

  // Mouse event handlers
  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Clear canvas (removes only drawings, keeps background and images)
  const handleClear = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Redraw background (white + dotted pattern)
    drawBackground();

    // Redraw all images
    backgroundImagesData.forEach(imgData => {
      const { img, x, y, width, height } = imgData;
      drawSingleImage(ctx, img, x, y, width, height);
    });
  }, [backgroundImagesData, drawBackground, drawSingleImage]);

  // Save canvas
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `draw-canvas-${saveCounter}.png`;
    link.href = dataURL;
    link.click();

    setSaveCounter(prev => prev + 1);
  }, [saveCounter]);

  // Handle image upload (supports multiple files)
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setUploadedImages(results);
    });
  }, []);

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clearCanvas: handleClear,
    saveCanvas: handleSave,
    getCanvasDataURL: () => canvasRef.current?.toDataURL('image/png')
  }), [handleClear, handleSave]);

  return (
    <>
      {/* Canvas Container */}
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border cursor-crosshair rounded-lg"
          style={{
            display: 'block',
            borderColor
          }}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Toolbar - Outside canvas container */}
      {showToolbar && (
        <div className="mt-6 flex justify-center">
          <DrawingToolbar
            currentColor={currentColor}
            onColorChange={setCurrentColor}
            strokeWidth={currentStrokeWidth}
            onStrokeWidthChange={setCurrentStrokeWidth}
            imageSize={currentImageSize}
            onImageSizeChange={setCurrentImageSize}
            showImages={showImagesState}
            onShowImagesChange={setShowImagesState}
            showGrid={showDottedPatternState}
            onShowGridChange={setShowDottedPatternState}
            onUpload={handleUploadClick}
            onClear={handleClear}
            onSave={handleSave}
            showUploadButton={showUpload}
            showClearButton={showClear}
            showSaveButton={showSave}
          />
        </div>
      )}
    </>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
