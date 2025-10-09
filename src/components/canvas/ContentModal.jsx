'use client';

import { X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function ContentModal({ isOpen, onClose, item }) {
  if (!item || !item.link) return null;

  const handleOpenInNewTab = () => {
    window.open(item.link, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[85vw] h-[90vh] p-0 gap-0 overflow-hidden"
        hideCloseButton
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">{item.title || 'Content Preview'}</DialogTitle>

        {/* Iframe content */}
        <iframe
          src={item.link}
          className="w-full h-full border-0"
          title={item.title || 'Content'}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </DialogContent>

      {/* Controls positioned fixed on the right side of the modal */}
      {isOpen && (
        <div className="fixed left-[50%] top-[50%] translate-x-[calc(42.5vw+2rem)] -translate-y-1/2 flex flex-col gap-3 z-[100]">
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xl"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={handleOpenInNewTab}
            className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xl"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-6 w-6" />
          </button>
        </div>
      )}
    </Dialog>
  );
}
