import CarAnimation from './CarAnimation';

export default function SlateCarAnimation() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-24 pl-6 pr-2">
      <div className="text-center mb-4 max-w-3xl">
        <h1 className="text-3xl md:text-5xl text-black mb-3 font-sans">
          THIS TRUCK CAN BE ANYTHING.
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-500 font-sans">
          EVEN AN SUV
        </h2>
      </div>

      <CarAnimation />
    </div>
  );
}