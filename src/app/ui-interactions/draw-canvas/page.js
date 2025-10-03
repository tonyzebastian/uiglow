import DrawingCanvas from './DrawingCanvas';

export default function DrawingPage() {
  // Canvas Configuration
  const canvasWidth = 800;
  const canvasHeight = 501;

  // Image Configuration (can be single or multiple images in array)
  const defaultImages = [
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758636253/cld-sample.jpg',
  ];
  const imageSize = 600;        // Controls the max width/height of each image (maintains aspect ratio)
  const imagePadding = 5;      // White padding around each image (set to 0 to disable)
  const imageGap = 0;          // Gap between images in grid
  const showImageShadow = true; // Set to false to disable shadow
  const showImages = true;      // Set to false to hide images

  // Canvas Appearance
  const showDottedPattern = true;      // Set to false to disable dotted background pattern
  const canvasBorderColor = '#d1d5db'; // Canvas border color (hex color)

  // Drawing Configuration
  const strokeColor = '#000000';
  const strokeWidth = 2;
  const padding = 50;

  // Button visibility controls
  const showUpload = true;   // Set to false to hide upload button
  const showClear = true;     // Set to false to hide clear button
  const showSave = true;      // Set to false to hide save button

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <DrawingCanvas
        width={canvasWidth}
        height={canvasHeight}
        backgroundImages={defaultImages}
        imageSize={imageSize}
        imagePadding={imagePadding}
        imageGap={imageGap}
        showImageShadow={showImageShadow}
        showImages={showImages}
        showDottedPattern={showDottedPattern}
        canvasBorderColor={canvasBorderColor}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        padding={padding}
        showUploadButton={showUpload}
        showClearButton={showClear}
        showSaveButton={showSave}
      />
    </div>
  );
}
