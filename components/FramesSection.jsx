import { getPhotographs } from "@/lib/db";
import FramesGallery from "./FramesGallery";

export default async function FramesSection() {
  const photographs = await getPhotographs();

  return (
    <section id="frames">
      <div className="section-head">
        <h2>Frames</h2>
        <p>Unexpected moments captured through the lens. Click any photo to preview or download it.</p>
      </div>
      <FramesGallery photographs={photographs} />
    </section>
  );
}
