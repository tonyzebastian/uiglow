'use client';

import { X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export default function ContentModal({ isOpen, onClose, item }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!item || !item.link) return null;

  const handleOpenInNewTab = (e) => {
    e.stopPropagation();
    window.open(item.link, '_blank', 'noopener,noreferrer');
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-[85vw] h-[90vh] flex items-center justify-center"
          >
            {/* Modal content */}
            <div
              className="w-full h-full bg-slate-900 rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Iframe content */}
              <iframe
                src={item.link}
                className="w-full h-full border-0 bg-slate-900"
                title={item.title || 'Content'}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>

            {/* Control buttons positioned on the right top */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="absolute -right-14 top-0 flex flex-col gap-3"
            >
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-slate-950 hover:bg-slate-900 text-white transition-all shadow-2xl hover:scale-105"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="p-2 rounded-full bg-slate-950 hover:bg-slate-900 hover:scale-105 text-white transition-all shadow-2xl"
                aria-label="Open in new tab"
              >
                <Maximize2 className="h-6 w-6" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
