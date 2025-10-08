'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import DraggableItem from './DraggableItem';

const CANVAS_SIZE = 10000; // Large canvas boundary (10000px in each direction)
const BASE_WIDTH = 1440; // Base design width
const MIN_SCALE = 0.6; // Minimum scale (60%)
const MAX_SCALE = 1.2; // Maximum scale (120%)

export default function DraggableCanvas({ items: initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, canvasX: 0, canvasY: 0 });
  const canvasRef = useRef(null);

  // Set mounted state, calculate initial scale, and position viewport
  useEffect(() => {
    const updateScaleAndPosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const calculatedScale = viewportWidth / BASE_WIDTH;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, calculatedScale));
      setCanvasScale(clampedScale);

      // Position viewport with top-left anchor approach
      // Center horizontally, but keep consistent vertical offset from top
      const centerX = (viewportWidth / 2) - (500 * clampedScale);
      const topMargin = 100; // Fixed margin from top
      const offsetY = topMargin;
      setCanvasOffset({ x: centerX, y: offsetY });

      setIsMounted(true);
    };

    updateScaleAndPosition();
  }, []);

  // Handle canvas drag start
  const handleCanvasMouseDown = (e) => {
    // Only start canvas drag if clicking on background (not on an item)
    if (e.target === e.currentTarget || e.target.closest('.canvas-background')) {
      setIsDraggingCanvas(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        canvasX: canvasOffset.x,
        canvasY: canvasOffset.y,
      };
    }
  };

  // Handle canvas drag
  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDraggingCanvas) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newX = dragStartRef.current.canvasX + deltaX;
    const newY = dragStartRef.current.canvasY + deltaY;

    // Apply simple boundaries
    const clampedX = Math.max(-CANVAS_SIZE, Math.min(newX, CANVAS_SIZE));
    const clampedY = Math.max(-CANVAS_SIZE, Math.min(newY, CANVAS_SIZE));

    setCanvasOffset({ x: clampedX, y: clampedY });
  }, [isDraggingCanvas]);

  // Handle canvas drag end
  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
  }, []);

  // Handle mouse wheel scroll
  const handleWheel = useCallback((e) => {
    const newX = canvasOffset.x - e.deltaX;
    const newY = canvasOffset.y - e.deltaY;

    // Apply simple boundaries
    const clampedX = Math.max(-CANVAS_SIZE, Math.min(newX, CANVAS_SIZE));
    const clampedY = Math.max(-CANVAS_SIZE, Math.min(newY, CANVAS_SIZE));

    setCanvasOffset({ x: clampedX, y: clampedY });
  }, [canvasOffset]);

  // Update canvas scale and reposition on resize
  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const calculatedScale = viewportWidth / BASE_WIDTH;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, calculatedScale));
      setCanvasScale(clampedScale);

      // Reposition viewport when scale changes (top-left anchor)
      if (isMounted) {
        const centerX = (viewportWidth / 2) - (500 * clampedScale);
        const topMargin = 100; // Fixed margin from top
        const offsetY = topMargin;
        setCanvasOffset({ x: centerX, y: offsetY });
      }
    };

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isMounted]);

  // Add wheel event listener with passive: false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      handleWheel(e);
    };

    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    return () => canvas.removeEventListener('wheel', wheelHandler);
  }, [handleWheel]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDraggingCanvas) {
      window.addEventListener('mousemove', handleCanvasMouseMove);
      window.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCanvasMouseMove);
        window.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isDraggingCanvas, handleCanvasMouseMove, handleCanvasMouseUp]);

  // Update item position
  const handleItemDrag = (itemId, newPosition) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, position: newPosition } : item
      )
    );
  };

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 canvas-background ${
        isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'
      }`}
      onMouseDown={handleCanvasMouseDown}
    >
      <div
        className="absolute inset-0"
        style={{
          pointerEvents: 'none',
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
          transformOrigin: 'top left',
          opacity: isMounted ? 1 : 0,
          transition: isMounted ? 'none' : 'opacity 0s',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {items.map(item => (
            <DraggableItem
              key={item.id}
              item={item}
              onDrag={handleItemDrag}
              canvasOffset={canvasOffset}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
