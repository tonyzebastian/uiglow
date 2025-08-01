'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CarAnimation from './CarAnimation';

export default function SlateCarAnimation() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const intervalRef = useRef(null);
  const imageCache = useRef(new Map()); // Persistent image cache

  const keyFrames = [1, 51, 102, 152, 202];
  const bubbleNames = ["The Blank Slate", "The Sunny Side", "The Doer", "Kind of a Big Teal", "Beach Bound"];
  const bodyTypes = ["Truck", "SUV Kit", "Truck", "Fastback SUV", "Open Air Kit"];
  
  const modelDescriptions = [
    {
      title: "The Blank Slate",
      description: "It's a Slate. A radically simple electric pickup truck that can change into whatever you need it to be - even an SUV. Made in the USA at a price that's actually affordable (no really, for real).",
    },
    {
      title: "The Sunny Side",
      description: "Optimized for sunny days and outdoor exploration. A sleek, capable fastback meets laidback attitude, for comfort in any weather.",
    },
    {
      title: "The Doer",
      description: "No matter what you're building, fixing, renovating, or installing, this truck is ready to work. Built for productivity and heavy-duty tasks.",
    },
    {
      title: "Kind of a Big Teal",
      description: "Now that's a fun wrap. Even makes you look forward to the Monday commute. Designed with coastal living in mind.",
    },
    {
      title: "Beach Bound",
      description: "Lose the door, throw on an Open Air Kit, and turn errand-running into summer fun. The ultimate beach companion.",
    }
  ];

  // Preload and cache all car images permanently
  useEffect(() => {
    const preloadImages = async () => {
      console.log('Starting image preload and caching...');
      const imagePromises = [];
      let loadedCount = 0;
      const totalImages = 202 + 5; // Updated to 202 based on your keyFrames
      
      // Preload all car sequence images (1-202) and store in cache
      for (let i = 1; i <= 202; i++) {
        const img = new Image();
        const promise = new Promise((resolve) => {
          img.onload = () => {
            // Store in persistent cache
            imageCache.current.set(`car_${i}`, img);
            loadedCount++;
            console.log(`Loaded and cached ${loadedCount}/${totalImages} images`);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load car_${i}.jpg`);
            loadedCount++;
            resolve(); // Continue even if some images fail
          };
        });
        img.src = `/slate/car_${i}.jpg`;
        imagePromises.push(promise);
      }
      
      // Preload configuration preview images (1-5.png) and store in cache
      for (let i = 1; i <= 5; i++) {
        const img = new Image();
        const promise = new Promise((resolve) => {
          img.onload = () => {
            // Store in persistent cache
            imageCache.current.set(`preview_${i}`, img);
            loadedCount++;
            console.log(`Loaded and cached ${loadedCount}/${totalImages} images`);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load ${i}.png`);
            loadedCount++;
            resolve();
          };
        });
        img.src = `/slate/${i}.png`;
        imagePromises.push(promise);
      }
      
      await Promise.all(imagePromises);
      console.log(`All images preloaded and cached! Cache size: ${imageCache.current.size}`);
      setImagesLoaded(true);
    };
    
    preloadImages();
  }, []);

  const animate = (fromFrame, toFrame, callback) => {
    if (!imagesLoaded) {
      console.log('Images not loaded yet, skipping animation');
      return;
    }
    
    console.log(`Animating from frame ${fromFrame} to ${toFrame}`);
    setIsAnimating(true);
    let frame = fromFrame;
    const increment = fromFrame < toFrame ? 1 : -1;
    
    intervalRef.current = setInterval(() => {
      if (frame === toFrame) {
        setCurrentFrame(frame);
        clearInterval(intervalRef.current);
        setIsAnimating(false);
        console.log(`Animation complete at frame ${frame}`);
        if (callback) callback();
        return;
      }
      
      setCurrentFrame(frame);
      console.log(`Showing frame ${frame}`);
      frame += increment;
    }, 24); // Reduced to ~60fps for smoother animation
  };

  const handleBubbleClick = (bubbleIndex) => {
    if (isAnimating || !imagesLoaded) return;
    
    const targetFrame = keyFrames[bubbleIndex];
    setSelectedBubble(bubbleIndex);
    
    animate(currentFrame, targetFrame, () => {
      // Animation complete
    });
  };

  return (
    <div className="min-h-screen w-full" >
      {/* Two Column Layout */}
      <div className="flex min-h-screen w-full border">
        {/* Left Column - Car Animation (White Background) */}
        <div className="flex-[3] bg-white flex flex-col justify-center items-center px-8 pt-8 relative" >
          {/* Loading indicator */}
          {!imagesLoaded && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
                <p className="text-slate-600 font-sans">Loading car images...</p>
              </div>
            </div>
          )}
          {/* Slate Logo */}
          <div className="absolute top-12 left-14 z-10">
            <svg width="160" height="24" viewBox="0 0 217 29" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="Logo">
              <path id="Logo_2" d="M180.217 28.5H216.741V21.3802H195.169V17.9401H216.741V11.0599H195.169V7.61977H216.741V0.5H180.217V28.5ZM145.778 28.5H160.734V7.61977H173.806V0.5H132.711V7.61977H145.783V28.5H145.778ZM102.675 15.5397L104.396 7.61977H111.011L112.733 15.5397H102.67H102.675ZM84.3925 28.5H99.8295L101.112 22.5779H114.301L115.583 28.5H131.097L123.92 0.5H91.5644L84.3874 28.5H84.3925ZM44.38 28.5H78.4976V21.3802H59.3317V0.5H44.3749V28.5H44.38ZM29.5867 28.5H0V21.3802H22.6548V18.0624H8.01987C3.00873 18.0624 0 14.9434 0 10.9427V7.62486C0 3.62414 3.00873 0.505096 8.01987 0.505096H37.6065V7.62486H14.9517V10.9427H29.5867C34.5978 10.9427 37.6065 14.0617 37.6065 18.0624V21.3802C37.6065 25.381 34.5978 28.5 29.5867 28.5Z" fill="#CFCFCF"/>
              </g>
            </svg>
          </div>
          
          <CarAnimation currentFrame={currentFrame} imageCache={imageCache.current} />
          
          {/* Dynamic Content Below Car */}
          <div className="mt-16 text-center max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedBubble}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-slate-800 font-sans ">
                  {modelDescriptions[selectedBubble].title}
                </h2>
                <p className="text-slate-700 text-sm leading-relaxed font-sans">
                  {modelDescriptions[selectedBubble].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column - Configuration (Light Beige Background) */}
        <div className="flex-[2] bg-zinc-50 flex flex-col justify-center items-center p-12 w-full">
          <div className="max-w-md">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 font-sans">
            BUILD YOUR TRUCK
            </h1>
            <p className="text-base text-slate-700 mb-12 font-sans">
            Make it yours. From model to trim, wheels to paint, every detail of your car is in your hands.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-sans font-medium text-slate-800 mb-4">Choose your model</h3>
                
                <div className="space-y-4">
                  {keyFrames.map((_, index) => {
                    const isSelected = selectedBubble === index;
                    const isHovered = hoveredIndex === index;
                    
                    return (
                      <motion.div 
                        key={index}
                        onClick={() => handleBubbleClick(index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all overflow-hidden ${
                          isSelected 
                            ? 'border-blue-600 bg-white shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                        } ${isAnimating || !imagesLoaded ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <div className="flex-1">
                          <div className={`font-semibold text-base font-sans pb-1 ${isSelected ? 'text-slate-950' : 'text-slate-900'}`}>
                            {bubbleNames[index]}
                          </div>
                          <div className="text-slate-800 text-sm tracking-wider">
                            {bodyTypes[index]}
                          </div>
                        </div>
                        
                        {/* Car Image - Partially Hidden, Reveals on Selection */}
                        <div className="relative w-20 h-16">
                          <motion.div
                            className="w-40 h-24 flex items-center justify-center"
                            animate={{
                              x: isSelected ? -64 : (isHovered ? -20 : 12)
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <img 
                              src={imageCache.current.has(`preview_${index + 1}`) 
                                ? imageCache.current.get(`preview_${index + 1}`).src 
                                : `/slate/${index + 1}.png`}
                              alt={`Car stage ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}