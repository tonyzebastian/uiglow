
import PageLayout from '@/components/PageLayout';

export default function UIExplorationsLayout({ children }) {
  return (
    <div className="flex flex-col w-full mx-auto">
        <PageLayout>
          {children}
        </PageLayout>
    </div>
  );
}