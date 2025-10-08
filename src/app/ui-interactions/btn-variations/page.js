import DownloadBtn from "./DownloadButton";
import OutlineBtn from "./OutlineButton";

export const metadata = {
  title: "Button Variations - UiGlow",
  description: "Collection of animated button components with download and outline variations.",
};

export default function DownloadBtnPage() {
  return (
    <div className="flex flex-col items-center gap-4 justify-center mt-16">
      <DownloadBtn />
      <OutlineBtn />
    </div>
  );
}