'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function CarAnimation() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState(0);
  const intervalRef = useRef(null);



  const keyFrames = [1, 51, 102, 152, 203];
  const bubbleNames = ["THE BLANK SLATE", "THE SUNNYSIDE", "THE DOER", "KIND OF A BIG TEAL", "BEACH BOUND"];

  const animate = (fromFrame, toFrame, callback) => {
    setIsAnimating(true);
    let frame = fromFrame;
    const increment = fromFrame < toFrame ? 1 : -1;
    
    intervalRef.current = setInterval(() => {
      setCurrentFrame(frame);
      
      if (frame === toFrame) {
        clearInterval(intervalRef.current);
        setIsAnimating(false);
        if (callback) callback();
        return;
      }
      
      frame += increment;
    }, 24);
  };


  const handleBubbleClick = (bubbleIndex) => {
    if (isAnimating) return;
    
    const targetFrame = keyFrames[bubbleIndex];
    setSelectedBubble(bubbleIndex);
    
    animate(currentFrame, targetFrame, () => {
      // Animation complete
    });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-6xl flex flex-col items-center">
      {/* Car Animation */}
      <div className="w-full max-w-4xl h-96 md:h-[500px] flex justify-center items-center mb-4">
        <img 
          src={`/slate/car_${currentFrame}.png`}
          alt={`Car frame ${currentFrame}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Bubble Navigation */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {keyFrames.map((frame, index) => {
          const isActive = currentFrame === frame;
          const isSelected = selectedBubble === index;
          const shouldExpand = isActive || isSelected;
          
          return (
            <motion.div key={index} className="flex items-center justify-center">
              <motion.button
                onClick={() => handleBubbleClick(index)}
                disabled={isAnimating}
                className={`
                  relative  border overflow-hidden flex items-center justify-center
                  ${
                    shouldExpand
                      ? 'border-slate-700 bg-slate-700 shadow-lg rounded-2xl'
                      : 'border-slate-300 bg-slate-100 hover:border-gray-400 rounded-xl'
                  }
                  ${
                    isAnimating ? 'cursor-not-allowed ' : 'cursor-pointer'
                  }
                `}
                animate={{
                  width: shouldExpand ? 'auto' : 94,
                  height: 64,
                  scale: shouldExpand ? 1.1 : 1
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  duration: 0.3
                }}
                whileHover={{ scale: shouldExpand ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2 px-2">
                  <div className="w-18 h-20 flex-shrink-0">
                    <img 
                      src={`/slate/${index + 1}.png`}
                      alt={`Car stage ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <AnimatePresence>
                    {shouldExpand && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="text-sm font-sans font-semibold text-white tracking-wide whitespace-nowrap pr-2"
                      >
                        {bubbleNames[index]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}