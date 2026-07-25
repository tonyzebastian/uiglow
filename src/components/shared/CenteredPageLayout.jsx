export default function CenteredPageLayout({ children, className = "" }) {
  return (
    <main className={`w-full min-h-[calc(100vh-80px)] flex items-center justify-center ${className}`}>
      {children}
    </main>
  );
}
