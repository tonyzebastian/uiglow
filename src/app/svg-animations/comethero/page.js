import CometHero from "./CometHero";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoinFlipPage() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen relative">
      <div className="text-center">
        <h1 className="font-serif text-4xl dark:text-slate-200 text-slate-800 pb-2 tracking-wide">Welcome to Comet</h1>
        <p className="dark:text-slate-500 text-slate-600 text-sm font-sans tracking-wider">Your download is starting automatically. Click below to retry manually.</p>
        <div className="pt-8">
          <Button size="lg" variant="secondary" className="font-sans tracking-wide cursor-pointer">
            <Download className="w-4 h-4" />
            Download Comet
          </Button>
          <p className="text-slate-500 text-xs pt-2 font-sans tracking-wider">For macOS 14 or later</p>
        </div>
      </div>
      <div className="w-full max-w-[900px] absolute">
        <CometHero />
      </div>
    </div>
  );
}