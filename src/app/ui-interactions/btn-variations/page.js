import DownloadBtn from "./DownloadButton";
import OutlineBtn from "./OutlineButton";

export default function DownloadBtnPage() {
  return (
    <div className="flex flex-col items-center gap-4 justify-center mt-16">
      <DownloadBtn />
      <OutlineBtn />
    </div>
  );
}