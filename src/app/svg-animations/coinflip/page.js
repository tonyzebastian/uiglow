import CoinFlip from "./CoinFlip";

export const metadata = {
  title: "Coin Flip - UiGlow",
  description: "Interactive SVG coin flip animation with realistic physics and smooth transitions.",
};

export default function CoinFlipPage() {
  return (
    <div className="flex items-center justify-center mt-16">
      <CoinFlip />
    </div>
  );
}