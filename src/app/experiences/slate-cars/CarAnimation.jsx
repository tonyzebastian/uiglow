export default function CarAnimation({ currentFrame, imageCache }) {
  // Use cached image if available, fallback to regular src
  const getCachedImageSrc = () => {
    if (imageCache && imageCache.has(`car_${currentFrame}`)) {
      return imageCache.get(`car_${currentFrame}`).src;
    }
    return `/slate/car_${currentFrame}.jpg`;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Car Animation */}
      <div className="w-full h-80 md:h-96 flex justify-center items-center">
        <img 
          src={getCachedImageSrc()}
          alt={`Car frame ${currentFrame}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}