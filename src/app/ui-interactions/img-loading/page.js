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
            src="https://res.cloudinary.com/dctgknnt7/image/upload/v1758636339/middle_vqdg9p.jpg"
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