import ImageLoader from './ImageLoader'
import CenteredPageLayout from "@/components/core/CenteredPageLayout"

export const metadata = {
  title: "Image Loading - UiGlow",
  description: "Creative image loading animations with skeleton screens and fade effects.",
};

export default function ImageLoadingPage() {
  return (
    <CenteredPageLayout>
      <div className="mx-auto w-fit">
        <div className="rounded-lg">
          <ImageLoader
            src="https://images.unsplash.com/photo-1757647016230-d6b42abc6cc9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2072"
            alt="Mountain landscape"
            width="800px"
            height="630px"
            gridSize={15}
            cellGap={15}
            cellShape="square"
            cellColor="#cbd5e1"
            blinkSpeed={2000}
            transitionDuration={500}
            fadeOutDuration={600}
            loadingDelay={3500}
            className="rounded-lg overflow-hidden"
          />
        </div>
      </div>
    </CenteredPageLayout>
  )
}