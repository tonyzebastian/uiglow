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
  const opensInNewTab = card.interactive && card.link && card.openInNewTab;
  const previewClassName = 'relative block w-full overflow-hidden rounded-[9px] bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2';

  return (
    <motion.div layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
      <article className="group w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
        {opensModal ? (
          <button
            type="button"
            className={previewClassName}
            style={previewStyle}
            aria-label={`Open ${card.title}`}
            onClick={() => onOpen(card)}
          >
            <Preview card={card} />
          </button>
        ) : opensInNewTab ? (
          <a
            href={card.link}
            target="_blank"
            rel="noreferrer"
            className={previewClassName}
            style={previewStyle}
            aria-label={`View ${card.title} in a new tab`}
          >
            <Preview card={card} />
          </a>
        ) : (
          <div className="relative overflow-hidden rounded-[9px] bg-slate-100" style={previewStyle}>
            <Preview card={card} />
          </div>
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
          {card.interactive && card.link && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 bg-[linear-gradient(to_top,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.28)_45%,rgba(255,255,255,0)_100%)] px-4 pb-3 pt-20 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <p className="text-sm font-normal tracking-tight text-slate-950">{card.title}</p>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          )}
    </>
  );
}
