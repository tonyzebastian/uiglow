'use client';

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Trash2, Download, Upload } from 'lucide-react';

const DrawingCanvas = forwardRef(({
  width = 1200,
  height = 800,
  backgroundImages = [],
  strokeColor = '#000000',
  strokeWidth = 2,
  padding = 40,
  imageSize = 600,
  imagePadding = 20,
  imageGap = 20,
  showImageShadow = true,
  showDottedPattern = true,
  canvasBorderColor = '#d1d5db',
  showUploadButton = true,
  showClearButton = true,
  showSaveButton = true,
  showImages = true
}, ref) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundImagesData, setBackgroundImagesData] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Draw white background with optional dotted pattern
  const drawBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dotted pattern if enabled
    if (showDottedPattern) {
      ctx.fillStyle = '#d1d5db';
      const spacing = 20;
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Always draw background (white + dotted pattern)
    drawBackground();
  }, [width, height, strokeColor, strokeWidth]);

  // Helper function to draw a single image with padding and shadow
  const drawSingleImage = (ctx, img, x, y, imgWidth, imgHeight) => {
    const cornerRadius = 12;

    // Draw white padding and shadow if enabled
    if (imagePadding > 0) {
      // Set shadow if enabled
      if (showImageShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
      }

      ctx.fillStyle = '#ffffff';

      // Draw rounded rectangle around image
      const rectX = x - imagePadding;
      const rectY = y - imagePadding;
      const rectWidth = imgWidth + (imagePadding * 2);
      const rectHeight = imgHeight + (imagePadding * 2);

      ctx.beginPath();
      ctx.moveTo(rectX + cornerRadius, rectY);
      ctx.lineTo(rectX + rectWidth - cornerRadius, rectY);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + cornerRadius);
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - cornerRadius, rectY + rectHeight);
      ctx.lineTo(rectX + cornerRadius, rectY + rectHeight);
      ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - cornerRadius);
      ctx.lineTo(rectX, rectY + cornerRadius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + cornerRadius, rectY);
      ctx.closePath();
      ctx.fill();
    }

    // Reset shadow for image drawing
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Clip to rounded rectangle for image
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + imgWidth - cornerRadius, y);
    ctx.quadraticCurveTo(x + imgWidth, y, x + imgWidth, y + cornerRadius);
    ctx.lineTo(x + imgWidth, y + imgHeight - cornerRadius);
    ctx.quadraticCurveTo(x + imgWidth, y + imgHeight, x + imgWidth - cornerRadius, y + imgHeight);
    ctx.lineTo(x + cornerRadius, y + imgHeight);
    ctx.quadraticCurveTo(x, y + imgHeight, x, y + imgHeight - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
    ctx.clip();

    // Draw image with rounded corners
    ctx.drawImage(img, x, y, imgWidth, imgHeight);

    ctx.restore();
  };

  // Load background images (from props or uploaded)
  useEffect(() => {
    const imageSources = uploadedImages.length > 0 ? uploadedImages : backgroundImages;

    if (!showImages || !imageSources || imageSources.length === 0) {
      setBackgroundImagesData([]);
      const canvas = canvasRef.current;
      if (canvas) {
        drawBackground();
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const loadedImages = [];
    let loadedCount = 0;

    imageSources.forEach((src, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
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
          const ctx = canvas.getContext('2d');
          drawBackground();

          const maxCols = 3;
          const numImages = loadedImages.length;
          const cols = Math.min(numImages, maxCols);
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
              height: imgData.height,
              padding: imagePadding,
              cornerRadius: 12,
              showShadow: showImageShadow
            });
          });

          setBackgroundImagesData(imagesData);
        }
      };

      img.src = src;
    });
  }, [backgroundImages, uploadedImages, imageSize, imagePadding, showImageShadow, imageGap, showImages]);

  // Mouse event handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear canvas (removes only drawings, keeps background and images)
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Redraw background (white + dotted pattern)
    drawBackground();

    // Redraw all images
    backgroundImagesData.forEach(imgData => {
      const { img, x, y, width, height } = imgData;
      drawSingleImage(ctx, img, x, y, width, height);
    });
  };

  // Save canvas
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  // Handle image upload (supports multiple files)
  const handleImageUpload = (e) => {
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
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clearCanvas: handleClear,
    saveCanvas: handleSave,
    getCanvasDataURL: () => canvasRef.current?.toDataURL('image/png')
  }));

  return (
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
        onMouseLeave={stopDrawing}
        className="border cursor-crosshair rounded-lg"
        style={{
          display: 'block',
          borderColor: canvasBorderColor
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
        {showUploadButton && (
          <button
            onClick={handleUploadClick}
            className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200"
            title="Upload image"
          >
            <Upload size={20} />
          </button>
        )}
        {showClearButton && (
          <button
            onClick={handleClear}
            className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200"
            title="Clear canvas"
          >
            <Trash2 size={20} />
          </button>
        )}
        {showSaveButton && (
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
