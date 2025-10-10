export default function CenteredPageLayout({ children }) {
  return (
    <main className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center">
      {children}
    </main>
  );
}
