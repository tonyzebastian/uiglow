import { Geist, Instrument_Serif } from 'next/font/google';
import Stage from './Stage';

// Page-scoped fonts: pretext measures against the exact rendered font, so the
// body font is read from computed style at runtime (see Stage.jsx).
const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata = {
  title: 'The Inhabitant - UiGlow',
  description:
    'A procedurally animated character that walks and climbs through a paragraph that reflows around it in real time.',
};

export default function InhabitantPage() {
  return (
    <div className={`${geist.variable} ${instrumentSerif.variable}`}>
      <Stage />
    </div>
  );
}
