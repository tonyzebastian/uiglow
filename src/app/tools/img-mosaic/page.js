import MosaicPhotoEffect from './MosaicPhotoEffect';
import AppHeader from "@/components/core/AppHeader";
import UIGlowLogo from "@/components/Logo";

export const metadata = {
  title: "Image Mosaic - UiGlow",
  description: "Create stunning photo mosaic effects with customizable grid patterns and animations.",
};

export default function ImgMosaicPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader title="Image Mosaic" />
      <MosaicPhotoEffect />
    </div>
  );
}
``