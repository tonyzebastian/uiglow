import Link from "next/link";

export const metadata = {
  title: "Physiotherapy Clinic Creative Process",
  description: "Illustration, animation, and landing-page conversation transcript.",
};

export default function PhysioReadmePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f7f4ec", padding: "16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", fontFamily: "Arial, sans-serif" }}>
        <Link href="/client/physio" style={{ color: "#222", fontWeight: 600, textDecoration: "none" }}>
          ← Movewell Physio
        </Link>
        <a href="/client/physio/readme/transcript.md" download style={{ color: "#222", fontSize: "14px" }}>
          Download Markdown
        </a>
      </div>
      <iframe
        title="Physiotherapy clinic creative process"
        src="/client/physio/readme/content.html"
        style={{ display: "block", width: "100%", maxWidth: "1100px", height: "calc(100vh - 76px)", margin: "0 auto", border: "1px solid #ded9ce", borderRadius: "12px", background: "#f7f4ec" }}
      />
    </main>
  );
}

