import ImageSpotlight from "./ImageSpotlight"
import CenteredPageLayout from "@/components/shared/CenteredPageLayout"

export const metadata = {
  title: "Image Spotlight - UiGlow",
  description: "Interactive image spotlight effect with dynamic lighting and smooth cursor tracking.",
};

export default function ImageSpotlightPage() {
  return (
    <CenteredPageLayout>
      <div className="flex justify-center gap-2">
        <ImageSpotlight
          src="https://images.unsplash.com/photo-1742201877377-03d18a323c18?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
        <ImageSpotlight
          src="https://images.unsplash.com/photo-1757081791153-3f48cd8c67ac?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
        <ImageSpotlight
          src="https://images.unsplash.com/photo-1757626961383-be254afee9a0?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
      </div>
    </CenteredPageLayout>
  )
}
