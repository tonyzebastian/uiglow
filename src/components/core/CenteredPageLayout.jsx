export default function CenteredPageLayout({ children }) {
  return (
    <main className="w-full p-6 flex">
      <div className="w-full flex-1">
        <div className="h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </main>
  );
}
