import { getPoems } from "@/lib/db";

export default async function PoemsSection() {
  const poems = await getPoems();

  return (
    <section id="poems">
      <div className="section-head">
        <h2>Poems</h2>
        <p>Some verses from my collection.</p>
      </div>
      <div className="poem-grid">
        {poems.map((poem) => (
          <div className="poem-card" key={poem.slug}>
            <h3>{poem.title}</h3>
            <p>
              {poem.lines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < poem.lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
