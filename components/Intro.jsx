export default function Intro() {
  return (
    <section id="intro-page">
      <div id="intro-content">
        <h1 className="hero-fade-in i1">Priyanshi Dwivedi</h1>
        <h3 className="hero-brand-in i2">~ Snapwritoo</h3>
        <p className="hero-fade-in d2">I write what I feel,</p>
        <p className="hero-fade-in d3">play what I love, </p>
        <p className="hero-fade-in d4">and photograph what catches my eye. </p>
      </div>
      <div id="intro-image">
        <img
          src="/pf.png"
          alt="Portrait of Jay"
          width={420}
          height={520}
          draggable="false"
        />
      </div>
    </section>
  );
}
