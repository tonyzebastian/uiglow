import DrawingCanvas from './DrawingCanvas';
import AppHeader from "@/components/core/AppHeader";

export const metadata = {
  title: "Drawing Canvas - UiGlow",
  description: "Interactive drawing canvas tool with image upload, annotation, and save functionality.",
};

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
      'https://images.unsplash.com/photo-1762515303947-cef3ea72386d?q=80&w=2753&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    size: 600,                        // Max width/height (maintains aspect ratio)
    padding: 5,                       // White padding around images (0 to disable)
    gap: 0,                           // Gap between images in grid
    showShadow: false,                 // Drop shadow on images
    showImages: true                  // Toggle image visibility
  };

  // Drawing Configuration
  const drawingConfig = {
    strokeColor: '#000000',           // Drawing stroke color
    strokeWidth: 2                    // Drawing stroke width
  };

  // Toolbar Configuration
  const toolbarConfig = {
    show: true,                       // Show/hide toolbar
    showUpload: true,                 // Upload button visibility
    showClear: true,                  // Clear button visibility
    showSave: true                    // Save button visibility
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="Drawing Canvas" />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <DrawingCanvas
          canvasConfig={canvasConfig}
          imageConfig={imageConfig}
          drawingConfig={drawingConfig}
          toolbarConfig={toolbarConfig}
        />
      </div>
    </div>
  );
}
