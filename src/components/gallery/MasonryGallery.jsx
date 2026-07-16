'use client';

import { useEffect, useMemo, useState } from 'react';
import GalleryCard from './GalleryCard';
import GalleryModal from './GalleryModal';

const getColumnCount = () => {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
};

// This follows the reference site's approach: real column elements are filled
// in JavaScript rather than relying on CSS multi-columns. That preserves the
// intended reading order and balances the visual height of each column.
function distributeCards(cards, count) {
  const columns = Array.from({ length: count }, () => ({ cards: [], height: 0 }));

  cards.forEach((card) => {
    const target = columns.reduce((shortest, column) => column.height < shortest.height ? column : shortest);
    const ratio = card.size.height / card.size.width;
    target.cards.push(card);
    target.height += ratio + 0.03; // account for the row gap while balancing
  });

  return columns.map((column) => column.cards);
}

export default function MasonryGallery({ cards }) {
  const [columnCount, setColumnCount] = useState(1);
  const [modalCard, setModalCard] = useState(null);

  useEffect(() => {
    const updateColumns = () => setColumnCount(getColumnCount());
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const columns = useMemo(() => distributeCards(cards, columnCount), [cards, columnCount]);

  return (
    <>
      <section aria-label="UiGlow projects" className="w-full px-2 pb-24 pt-2">
        <div className="-ml-2 flex w-auto pr-1" data-columns={columnCount}>
          {columns.map((column, index) => (
            <div key={index} className="min-w-0 flex-1 pl-2">
              <div className="space-y-2">
                {column.map((card) => <GalleryCard key={card.id} card={card} onOpen={setModalCard} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <GalleryModal isOpen={Boolean(modalCard)} onClose={() => setModalCard(null)} item={modalCard} />
    </>
  );
}
