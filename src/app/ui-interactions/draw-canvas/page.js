import DrawingCanvas from './DrawingCanvas';

export default function DrawingPage() {
  // Canvas Configuration
  const canvasConfig = {
    width: 800,
    height: 501,
    borderColor: '#d1d5db',           // Canvas border color (hex)
    showDottedPattern: true           // Background dotted pattern
  };

  // Image Configuration
  const imageConfig = {
    urls: [
      'https://res.cloudinary.com/dctgknnt7/image/upload/v1758636253/cld-sample.jpg',
    ],
    size: 600,                        // Max width/height (maintains aspect ratio)
    padding: 5,                       // White padding around images (0 to disable)
    gap: 0,                           // Gap between images in grid
    showShadow: true,                 // Drop shadow on images
    showImages: true                  // Toggle image visibility
  };

  // Drawing Configuration
  const drawingConfig = {
    strokeColor: '#000000',           // Drawing stroke color
    strokeWidth: 2                    // Drawing stroke width
  };

  // Button Configuration
  const buttonConfig = {
    showUpload: true,                 // Upload button visibility
    showClear: true,                  // Clear button visibility
    showSave: true                    // Save button visibility
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <DrawingCanvas
        canvasConfig={canvasConfig}
        imageConfig={imageConfig}
        drawingConfig={drawingConfig}
        buttonConfig={buttonConfig}
      />
    </div>
  );
}
