import { getPitchStats, getPitchLedger, computePitchAverage } from "@/lib/db";

export default async function PitchSection() {
  const stats = await getPitchStats();
  const ledger = await getPitchLedger();

  const average = computePitchAverage(stats);
  const displayStats = [...stats];
  if (average !== null) {
    // Insert right after "Runs", matching the original card order.
    const runsIndex = displayStats.findIndex(
      (s) => s.label.toLowerCase() === "runs",
    );
    const insertAt = runsIndex === -1 ? displayStats.length : runsIndex + 1;
    displayStats.splice(insertAt, 0, {
      id: "average",
      label: "Average",
      value: average,
    });
  }

  return (
    <section id="pitch">
      <div id="pitch-div">
        <div className="section-head">
          <h2>On the pitch</h2>
          <p>
            A club-level batting record, kept the way a scorer keeps it — one
            line at a time.
          </p>
        </div>
        <div className="stat-row">
          {displayStats.map((s) => (
            <div className="stat" key={s.id}>
              <div className="num">{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="ledger">
          {ledger.map((item) => (
            <div className="ledger-item" key={item.id}>
              <div className="tag">{item.tag}</div>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
