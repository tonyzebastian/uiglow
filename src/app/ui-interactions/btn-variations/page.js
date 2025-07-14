import DownloadBtn from "./downloadbtn";
import OutlineBtn from "./outlinebtn";

export default function DownloadBtnPage() {
  return (
    <div className="flex flex-col items-center gap-4 justify-center mt-16">
      <DownloadBtn />
      <OutlineBtn />
    </div>
  );
}