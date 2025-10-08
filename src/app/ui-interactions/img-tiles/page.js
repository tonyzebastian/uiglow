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
            leftImage="/ui/imgtiles/left.jpg"
            middleImage="/ui/imgtiles/middle.jpg"
            rightImage="/ui/imgtiles/right.jpg"
        />
      </div>
    </CenteredPageLayout>
  );
}