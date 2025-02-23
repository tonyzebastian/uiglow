import AppHeader from '@/components/AppHeader';
import AppSidebar from "@/components/AppSidebar";

export default function UIExplorationsLayout({ children }) {
  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto">
      <AppHeader />
      <div className="flex flex-row w-full">
        <AppSidebar />
        {children}
      </div>
    </div>
  );
}