import LinkLibrary from "@/features/link-library/LinkLibrary";

export const metadata = {
  title: "Link library | UiGlow",
  description: "Private saved links and references.",
  robots: { index: false, follow: false },
};

export default function LinkLibraryPage() {
  return <LinkLibrary />;
}
