import CenteredPageLayout from '@/components/core/CenteredPageLayout';
import ImageReveal from "./ImgTile"

export const metadata = {
  title: "Image Tiles - UiGlow",
  description: "Tile-based image reveal component with smooth transition effects.",
};

export default function ImgTile() {
  return (
    <CenteredPageLayout>
      <div className='-ml-12'>  {/* Removed -ml-12 */}
        <ImageReveal
            leftImage="https://images.unsplash.com/photo-1758178309498-036c3d7d73b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987"
            middleImage="https://images.unsplash.com/photo-1757647016230-d6b42abc6cc9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2072"
            rightImage="https://images.unsplash.com/photo-1757906447358-f2b2cb23d5d8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987"
        />
      </div>
    </CenteredPageLayout>
  );
}