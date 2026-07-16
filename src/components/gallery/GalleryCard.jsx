'use client';

import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import GalleryContent from './GalleryContent';

export default function GalleryCard({ card, onOpen }) {
  const previewStyle = {
    aspectRatio: `${card.size.width} / ${card.size.height}`,
    backgroundColor: card.backgroundColor,
  };
  const opensModal = card.interactive && card.link && !card.openInNewTab;

  return (
    <motion.div layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
      <article className="group w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
        {opensModal ? (
          <button
            type="button"
            className="relative block w-full overflow-hidden rounded-[9px] bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            style={previewStyle}
            aria-label={`Open ${card.title}`}
            onClick={() => onOpen(card)}
          >
            <Preview card={card} />
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-[9px] bg-slate-100" style={previewStyle}>
            <Preview card={card} />
          </div>
        )}
        {card.link && (
          <a
            href={card.link}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center justify-center gap-1.5 rounded-[8px] bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-600 transition-[background-color,color,transform] duration-150 hover:-translate-y-px hover:bg-slate-100 hover:text-slate-950 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            aria-label={`View ${card.title} in a new tab`}
          >
            View Prototype <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </article>
    </motion.div>
  );
}

function Preview({ card }) {
  return (
    <>
          <div className="h-full w-full pointer-events-none">
            <GalleryContent
              contentType={card.contentType}
              content={card.content}
              component={card.component}
              componentProps={card.componentProps}
              title={card.title}
            />
          </div>
          {card.interactive && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent px-4 pb-3 pt-10 text-white">
              <p className="text-sm font-semibold tracking-tight drop-shadow-sm">{card.title}</p>
              {card.link && <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />}
            </div>
          )}
    </>
  );
}
