import Nav from "@/components/Nav";
import FramesSection from "@/components/FramesSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Frames — Snapwritoo",
};

// Reads live from the database on every request, so photographs added via
// /admin show up immediately instead of only after the next `next build`.
export const dynamic = "force-dynamic";

export default function PhotographyPage() {
  return (
    <>
      <Nav />
      <div className="page-spacer" />
      <FramesSection />
      <Footer />
    </>
  );
}
