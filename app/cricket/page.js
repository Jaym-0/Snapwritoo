import Nav from "@/components/Nav";
import PitchSection from "@/components/PitchSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "On the pitch — Snapwritoo",
};

// Reads live from the database on every request, so stats/entries added via
// /admin show up immediately instead of only after the next build.
export const dynamic = "force-dynamic";

export default function CricketPage() {
  return (
    <>
      <Nav />
      <div className="page-spacer" />
      <PitchSection />
      <Footer />
    </>
  );
}
