import Nav from "@/components/Nav";
import PoemsSection from "@/components/PoemsSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Poems — Snapwritoo",
};

// Reads live from the database on every request, so poems added via /admin
// show up immediately instead of only after the next `next build`.
export const dynamic = "force-dynamic";

export default function PoemsPage() {
  return (
    <>
      <Nav />
      <div className="page-spacer" />
      <PoemsSection />
      <Footer />
    </>
  );
}
