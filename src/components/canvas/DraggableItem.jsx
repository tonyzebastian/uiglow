'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import CardContent from './CardContent';

const DRAG_THRESHOLD = 3; // pixels to move before it's considered a drag

export default function DraggableItem({ item, onDrag, canvasOffset }) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, itemX: 0, itemY: 0, hasMoved: false });

  const handleMouseDown = (e) => {
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
      // If it was a click (not a drag) and item is clickable, navigate
      if (!dragStartRef.current.hasMoved && item.clickable && item.link) {
        if (item.openInNewTab) {
          window.open(item.link, '_blank');
        } else {
          router.push(item.link);
        }
      }
      setIsDragging(false);
    }
  }, [isDragging, item, router]);

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
  const bgClass = item.background ? 'bg-white dark:bg-slate-800' : 'bg-transparent';
  const cursorClass = item.clickable ? 'cursor-pointer' : 'cursor-move';

  return (
    <motion.div
      className={`absolute ${shadowClass} ${bgClass} ${cursorClass} rounded-xl select-none`}
      style={{
        left: item.position.x,
        top: item.position.y,
        width: item.size.width,
        height: item.size.height,
        rotate: item.rotation,
        padding: item.padding,
        zIndex: isDragging ? 100 : 1,
      }}
      onMouseDown={handleMouseDown}
      initial={false}
      whileHover={{ scale: item.clickable ? 1.02 : 1 }}
      animate={{ scale: isDragging ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="w-full h-full rounded-lg overflow-hidden pointer-events-none">
        <CardContent
          contentType={item.contentType}
          content={item.content}
          component={item.component}
          componentProps={item.componentProps}
          title={item.title}
        />
      </div>
    </motion.div>
  );
}
