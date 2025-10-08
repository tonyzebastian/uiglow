'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import DraggableItem from './DraggableItem';

const BOUNDARY_PADDING = 300; // Max distance user can scroll away from items
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

  // Set mounted state and calculate initial scale
  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const calculatedScale = viewportWidth / BASE_WIDTH;
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, calculatedScale));
    setCanvasScale(clampedScale);
    setIsMounted(true);
  }, []);

  // Calculate canvas boundaries based on item positions (accounting for scale)
  const calculateBoundaries = useCallback(() => {
    if (items.length === 0) return { minX: -BOUNDARY_PADDING, maxX: BOUNDARY_PADDING, minY: -BOUNDARY_PADDING, maxY: BOUNDARY_PADDING };

    const positions = items.map(item => ({
      left: item.position.x * canvasScale,
      right: (item.position.x + item.size.width) * canvasScale,
      top: item.position.y * canvasScale,
      bottom: (item.position.y + item.size.height) * canvasScale,
    }));

    const minX = Math.min(...positions.map(p => p.left)) - BOUNDARY_PADDING;
    const maxX = Math.max(...positions.map(p => p.right)) + BOUNDARY_PADDING;
    const minY = Math.min(...positions.map(p => p.top)) - BOUNDARY_PADDING;
    const maxY = Math.max(...positions.map(p => p.bottom)) + BOUNDARY_PADDING;

    return { minX, maxX, minY, maxY };
  }, [items, canvasScale]);

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

    // Apply boundaries
    const boundaries = calculateBoundaries();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const clampedX = Math.max(
      -boundaries.maxX + viewportWidth,
      Math.min(newX, -boundaries.minX)
    );
    const clampedY = Math.max(
      -boundaries.maxY + viewportHeight,
      Math.min(newY, -boundaries.minY)
    );

    setCanvasOffset({ x: clampedX, y: clampedY });
  }, [isDraggingCanvas, calculateBoundaries]);

  // Handle canvas drag end
  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
  }, []);

  // Handle mouse wheel scroll
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    const newX = canvasOffset.x - e.deltaX;
    const newY = canvasOffset.y - e.deltaY;

    // Apply boundaries
    const boundaries = calculateBoundaries();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const clampedX = Math.max(
      -boundaries.maxX + viewportWidth,
      Math.min(newX, -boundaries.minX)
    );
    const clampedY = Math.max(
      -boundaries.maxY + viewportHeight,
      Math.min(newY, -boundaries.minY)
    );

    setCanvasOffset({ x: clampedX, y: clampedY });
  }, [canvasOffset, calculateBoundaries]);

  // Calculate and update canvas scale based on viewport
  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const calculatedScale = viewportWidth / BASE_WIDTH;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, calculatedScale));
      setCanvasScale(clampedScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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
      className={`relative w-full h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 canvas-background ${
        isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'
      }`}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
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
