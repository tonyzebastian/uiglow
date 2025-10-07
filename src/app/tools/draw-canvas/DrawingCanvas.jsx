'use client';

import { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Trash2, Download, Upload } from 'lucide-react';

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
  canvasConfig = {
    width: 1200,
    height: 800,
    borderColor: '#d1d5db',
    showDottedPattern: true
  },
  // Image config
  imageConfig = {
    urls: [],
    size: 600,
    padding: 20,
    gap: 20,
    showShadow: true,
    showImages: true
  },
  // Drawing config
  drawingConfig = {
    strokeColor: '#000000',
    strokeWidth: 2
  },
  // Button config
  buttonConfig = {
    showUpload: true,
    showClear: true,
    showSave: true
  }
}, ref) => {
  // Destructure configs with defaults
  const {
    width = 1200,
    height = 800,
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

  const {
    showUpload = true,
    showClear = true,
    showSave = true
  } = buttonConfig;

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundImagesData, setBackgroundImagesData] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

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
    if (showDottedPattern) {
      ctx.fillStyle = '#d1d5db';
      for (let x = 0; x < canvas.width; x += DOT_SPACING) {
        for (let y = 0; y < canvas.height; y += DOT_SPACING) {
          ctx.fillRect(x, y, DOT_SIZE, DOT_SIZE);
        }
      }
    }
  }, [showDottedPattern]);

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

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawBackground();
  }, [width, height, strokeColor, strokeWidth, drawBackground]);

  // Load background images (from props or uploaded)
  useEffect(() => {
    const imageSources = uploadedImages.length > 0 ? uploadedImages : urls;

    if (!showImages || !imageSources || imageSources.length === 0) {
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

        // Calculate scaled dimensions
        const scale = Math.min(imageSize / img.width, imageSize / img.height);
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
          const cols = Math.min(numImages, MAX_GRID_COLUMNS);
          const rows = Math.ceil(numImages / cols);

          // Calculate grid dimensions
          const gridWidth = (imageSize * cols) + (imageGap * (cols - 1));
          const gridHeight = (imageSize * rows) + (imageGap * (rows - 1));

          // Center the grid on canvas
          const startX = (canvas.width - gridWidth) / 2;
          const startY = (canvas.height - gridHeight) / 2;

          // Draw each image in grid
          const imagesData = [];
          loadedImages.forEach((imgData, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);

            // Calculate cell position
            const cellX = startX + (col * (imageSize + imageGap));
            const cellY = startY + (row * (imageSize + imageGap));

            // Center image within cell
            const x = cellX + (imageSize - imgData.width) / 2;
            const y = cellY + (imageSize - imgData.height) / 2;

            drawSingleImage(ctx, imgData.img, x, y, imgData.width, imgData.height);

            imagesData.push({
              img: imgData.img,
              x,
              y,
              width: imgData.width,
              height: imgData.height
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
  }, [urls, uploadedImages, imageSize, imagePadding, showImageShadow, imageGap, showImages, drawBackground, drawSingleImage]);

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
    link.download = `drawing-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }, []);

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
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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

      {/* Overlay Controls - Only visible on hover */}
      <div
        className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-200 ${
          isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {showUpload && (
          <button
            onClick={handleUploadClick}
            className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200"
            title="Upload image"
          >
            <Upload size={20} />
          </button>
        )}
        {showClear && (
          <button
            onClick={handleClear}
            className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200"
            title="Clear canvas"
          >
            <Trash2 size={20} />
          </button>
        )}
        {showSave && (
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg"
            title="Save drawing"
          >
            <Download size={20} />
          </button>
        )}
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
