import BreathingText from "@/fancy/components/text/breathing-text"

export default function BreathingTextComp() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center dark:text-slate-100 font-heading text-3xl">
        <BreathingText
          staggerDuration={0.2}
          fromFontVariationSettings="'wght' 100, 'slnt' 0"
          toFontVariationSettings="'wght' 800, 'slnt' -10"
        >
         A Space for Motion, Pixels, and Play
        </BreathingText>
      </div>
    </div>
  )
}
