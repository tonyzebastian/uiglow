export default function CarAnimation({ currentFrame }) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Car Animation */}
      <div className="w-full h-80 md:h-96 flex justify-center items-center">
        <img 
          src={`/slate/car_${currentFrame}.jpg`}
          alt={`Car frame ${currentFrame}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}