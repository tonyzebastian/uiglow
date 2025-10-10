'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import CardContent from './CardContent';

const DRAG_THRESHOLD = 3; // pixels to move before it's considered a drag

export default function DraggableItem({ item, onDrag, onItemClick, canvasOffset }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, itemX: 0, itemY: 0, hasMoved: false });

  const handleMouseDown = (e) => {
    // If item is not draggable (clickable: false and id is breathing-hero), don't handle mouse events
    if (!item.clickable && item.id === 'breathing-hero') {
      return;
    }

    e.stopPropagation(); // Prevent canvas drag
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      itemX: item.position.x,
      itemY: item.position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Check if movement exceeds threshold
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > DRAG_THRESHOLD) {
      dragStartRef.current.hasMoved = true;
    }

    if (dragStartRef.current.hasMoved) {
      const newX = dragStartRef.current.itemX + deltaX;
      const newY = dragStartRef.current.itemY + deltaY;
      onDrag(item.id, { x: newX, y: newY });
    }
  }, [isDragging, item.id, onDrag]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // If it was a click (not a drag) and item is clickable, handle navigation
      if (!dragStartRef.current.hasMoved && item.clickable && item.link) {
        // For tools or items that open in new tab, open directly
        if (item.openInNewTab) {
          window.open(item.link, '_blank');
        } else {
          // For other items, open in modal
          onItemClick(item);
        }
      }
      setIsDragging(false);
    }
  }, [isDragging, item, onItemClick]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const shadowClass = item.shadow ? 'shadow-lg' : '';
  const cursorClass = item.id === 'breathing-hero' ? 'cursor-default' : (item.clickable ? 'cursor-pointer' : 'cursor-move');

  // Handle outer container background (padding area)
  const getOuterBackgroundStyle = () => {
    if (!item.background) return 'bg-transparent';
    return 'bg-white dark:bg-slate-800'; // Default background for padding area
  };

  // Handle inner content background
  const getInnerBackgroundStyle = () => {
    if (!item.background) return 'bg-transparent';
    if (item.backgroundColor) return ''; // Use inline style for custom color
    return 'bg-white dark:bg-slate-800'; // Default background
  };

  const hoverRotation = item.hoverRotation || 0; // Get configurable hover rotation
  const showTitleOnHover = item.contentType !== 'group-title' && item.contentType !== 'arrow' && item.contentType !== 'text' && item.id !== 'breathing-hero';

  // Special rendering for breathing hero - no card structure
  if (item.id === 'breathing-hero') {
    return (
      <div
        className="absolute select-none"
        style={{
          left: item.position.x,
          top: item.position.y,
          width: item.size.width,
          height: item.size.height,
          zIndex: 1,
        }}
      >
        <CardContent
          contentType={item.contentType}
          content={item.content}
          component={item.component}
          componentProps={item.componentProps}
          title={item.title}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={`absolute ${shadowClass} ${getOuterBackgroundStyle()} ${cursorClass} rounded-xl select-none overflow-hidden`}
      style={{
        left: item.position.x,
        top: item.position.y,
        width: item.size.width,
        height: item.size.height,
        rotate: item.rotation,
        padding: item.padding,
        zIndex: isDragging ? 100 : (isHovered ? 50 : 1),
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      whileHover={{
        scale: item.clickable ? 1.02 : 1,
        rotate: item.rotation + hoverRotation,
      }}
      animate={{
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? item.rotation : item.rotation,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        className={`w-full h-full rounded-lg overflow-hidden pointer-events-none relative ${getInnerBackgroundStyle()}`}
        style={{
          backgroundColor: item.backgroundColor || undefined,
        }}
      >
        <CardContent
          contentType={item.contentType}
          content={item.content}
          component={item.component}
          componentProps={item.componentProps}
          title={item.title}
        />

        {/* Title overlay on hover */}
        {showTitleOnHover && item.title && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative pb-2">
              {/* Smoother gradient background with extended fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 via-30% via-black/20 via-50% via-black/10 via-70% to-transparent"
                   style={{ height: '120px', bottom: 0 }} />
              {/* Title text */}
              <p className="relative text-white text-sm font-medium px-3 py-2 text-center drop-shadow-lg">
                {item.title}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
