'use client';

import { X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export default function GalleryModal({ isOpen, onClose, item }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!item?.link) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-[82vh] w-full max-w-6xl items-center justify-center sm:h-[88vh] sm:w-[85vw]"
          >
            <div className="h-full w-full overflow-hidden rounded-lg bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <iframe src={item.link} className="h-full w-full border-0 bg-background" title={item.title || 'Content'} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            </div>
            <div className="absolute right-0 top-3 flex -translate-y-full flex-row gap-2 sm:-right-14 sm:top-0 sm:translate-y-0 sm:flex-col sm:gap-3">
              <button onClick={onClose} className="rounded-full bg-slate-950 p-2 text-white shadow-2xl transition-transform hover:scale-105" aria-label="Close modal">
                <X className="h-6 w-6" />
              </button>
              <button onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')} className="rounded-full bg-slate-950 p-2 text-white shadow-2xl transition-transform hover:scale-105" aria-label="Open in new tab">
                <Maximize2 className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
