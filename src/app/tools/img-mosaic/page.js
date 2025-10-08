import MosaicPhotoEffect from './MosaicPhotoEffect';
import AppHeader from "@/components/core/AppHeader";
import UIGlowLogoMini from "@/components/LogoMini";

export default function ImgMosaicPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader variant="secondary" title="Image Mosaic" secondaryLogo={<UIGlowLogoMini />}/>
      <div className="flex-1 flex items-center justify-center p-6">
        <MosaicPhotoEffect />
      </div>
    </div>
  );
}
``