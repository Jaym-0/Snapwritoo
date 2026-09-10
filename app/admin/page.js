"use client";

import { useEffect, useState } from "react";

function useToken() {
  const [token, setToken] = useState("");
  useEffect(() => {
    setToken(localStorage.getItem("snapwritoo-admin-token") || "");
  }, []);
  function update(value) {
    setToken(value);
    localStorage.setItem("snapwritoo-admin-token", value);
  }
  return [token, update];
}

export default function AdminPage() {
  const [token, setToken] = useToken();
  const [poems, setPoems] = useState([]);
  const [photographs, setPhotographs] = useState([]);
  const [pitchStats, setPitchStats] = useState([]);
  const [pitchLedger, setPitchLedger] = useState([]);
  const [poemForm, setPoemForm] = useState({ title: "", author: "", lines: "" });
  const [photoForm, setPhotoForm] = useState({ caption: "", tint: "" });
  const [statEdits, setStatEdits] = useState({});
  const [ledgerForm, setLedgerForm] = useState({ tag: "", body: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [status, setStatus] = useState("");

  async function refresh() {
    const [poemsRes, photosRes, statsRes, ledgerRes] = await Promise.all([
      fetch("/api/poems"),
      fetch("/api/photographs"),
      fetch("/api/pitch/stats"),
      fetch("/api/pitch/ledger"),
    ]);
    setPoems(await poemsRes.json());
    setPhotographs(await photosRes.json());
    setPitchStats(await statsRes.json());
    setPitchLedger(await ledgerRes.json());
  }

  useEffect(() => {
    refresh();
  }, []);

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const [, base64] = reader.result.split(",");
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  function onPhotoFileChange(e) {
    const file = e.target.files?.[0] || null;
    if (file && !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setStatus(
        `"${file.name}" is a ${file.type || "format"} browsers can't display (e.g. HEIC from iPhones). ` +
          "Convert it to JPG, PNG, or WebP first, then choose the converted file."
      );
      e.target.value = "";
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setStatus("");
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function addPoem(e) {
    e.preventDefault();
    setStatus("Saving poem…");
    const res = await fetch("/api/poems", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({
        title: poemForm.title,
        author: poemForm.author || undefined,
        lines: poemForm.lines.split("\n").map((l) => l.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setPoemForm({ title: "", author: "", lines: "" });
      setStatus("Poem added.");
      refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(`Error: ${data.error || res.statusText}`);
    }
  }

  async function addPhotograph(e) {
    e.preventDefault();
    if (!photoFile) {
      setStatus("Choose an image file first.");
      return;
    }
    setStatus("Uploading photograph…");
    try {
      const imageData = await fileToBase64(photoFile);
      const res = await fetch("/api/photographs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          imageData,
          imageMime: photoFile.type,
          caption: photoForm.caption,
          tint: photoForm.tint,
        }),
      });
      if (res.ok) {
        setPhotoForm({ caption: "", tint: "" });
        setPhotoFile(null);
        setPhotoPreview(null);
        setStatus("Photograph added.");
        refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus(`Error: ${data.error || res.statusText}`);
      }
    } catch (err) {
      setStatus(`Error reading file: ${err.message}`);
    }
  }

  async function removePoem(id) {
    if (!confirm("Delete this poem?")) return;
    await fetch(`/api/poems/${id}`, { method: "DELETE", headers: { "x-admin-token": token } });
    refresh();
  }

  async function removePhotograph(id) {
    if (!confirm("Delete this photograph?")) return;
    await fetch(`/api/photographs/${id}`, { method: "DELETE", headers: { "x-admin-token": token } });
    refresh();
  }

  function computeAverage(stats) {
    const find = (label) => stats.find((s) => s.label.toLowerCase() === label);
    const runs = find("runs");
    const matches = find("matches");
    if (!runs || !matches) return null;
    const runsNum = parseFloat(String(runs.value).replace(/,/g, ""));
    const matchesNum = parseFloat(String(matches.value).replace(/,/g, ""));
    if (!matchesNum || Number.isNaN(runsNum) || Number.isNaN(matchesNum)) return null;
    return (runsNum / matchesNum).toFixed(1);
  }

  async function saveStat(id, value) {
    setStatus("Saving stat…");
    const res = await fetch(`/api/pitch/stats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      setStatus("Stat updated.");
      refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(`Error: ${data.error || res.statusText}`);
    }
  }

  async function addLedgerItem(e) {
    e.preventDefault();
    setStatus("Saving ledger entry…");
    const res = await fetch("/api/pitch/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(ledgerForm),
    });
    if (res.ok) {
      setLedgerForm({ tag: "", body: "" });
      setStatus("Ledger entry added.");
      refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(`Error: ${data.error || res.statusText}`);
    }
  }

  async function removeLedgerItem(id) {
    if (!confirm("Delete this ledger entry?")) return;
    await fetch(`/api/pitch/ledger/${id}`, { method: "DELETE", headers: { "x-admin-token": token } });
    refresh();
  }

  return (
    <div id="admin-page">
      <h1>Snapwritoo admin</h1>
      <p className="admin-note">
        Changes here go straight to the database — no code edit, no redeploy.
        This is only as secure as the token below; don't share the URL publicly
        without setting a real <code>ADMIN_TOKEN</code> environment variable.
      </p>

      <div className="admin-field">
        <label>Admin token</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="matches ADMIN_TOKEN (defaults to snapwritoo-dev)"
        />
      </div>

      {status && <p className="admin-status">{status}</p>}

      <section className="admin-section">
        <h2>Poems ({poems.length})</h2>
        <form onSubmit={addPoem} className="admin-form">
          <input
            placeholder="Title"
            value={poemForm.title}
            onChange={(e) => setPoemForm({ ...poemForm, title: e.target.value })}
            required
          />
          <input
            placeholder="Author (optional)"
            value={poemForm.author}
            onChange={(e) => setPoemForm({ ...poemForm, author: e.target.value })}
          />
          <textarea
            placeholder="One line per row"
            rows={6}
            value={poemForm.lines}
            onChange={(e) => setPoemForm({ ...poemForm, lines: e.target.value })}
            required
          />
          <button type="submit">Add poem</button>
        </form>
        <ul className="admin-list">
          {poems.map((p) => (
            <li key={p.id}>
              <span>{p.title}</span>
              <button onClick={() => removePoem(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-section">
        <h2>Photographs ({photographs.length})</h2>
        <form onSubmit={addPhotograph} className="admin-form">
          <input type="file" accept="image/*" onChange={onPhotoFileChange} />
          {photoPreview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={photoPreview} alt="Preview" className="admin-photo-preview" />
          )}
          <input
            placeholder="Caption"
            value={photoForm.caption}
            onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
            required
          />
          <input
            placeholder="Tint gradient (optional)"
            value={photoForm.tint}
            onChange={(e) => setPhotoForm({ ...photoForm, tint: e.target.value })}
          />
          <p className="admin-hint">Max 2.5MB — compress large photos first if the upload fails.</p>
          <button type="submit">Upload photograph</button>
        </form>
        <ul className="admin-list">
          {photographs.map((p) => (
            <li key={p.id}>
              <span>{p.caption}</span>
              <button onClick={() => removePhotograph(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-section">
        <h2>Pitch stats</h2>
        <p className="admin-hint">
          Fixed set of stats — edit the values, no adding or removing. Average is calculated
          automatically from Runs ÷ Matches and isn't editable directly.
        </p>
        <ul className="admin-list admin-list-editable">
          {pitchStats.map((s) => (
            <li key={s.id}>
              <span className="admin-stat-label">{s.label}</span>
              <input
                className="admin-stat-input"
                value={statEdits[s.id] ?? s.value}
                onChange={(e) => setStatEdits({ ...statEdits, [s.id]: e.target.value })}
              />
              <button onClick={() => saveStat(s.id, statEdits[s.id] ?? s.value)}>Save</button>
            </li>
          ))}
          {computeAverage(pitchStats) !== null && (
            <li>
              <span className="admin-stat-label">Average</span>
              <input className="admin-stat-input" value={computeAverage(pitchStats)} disabled />
              <span className="admin-hint" style={{ margin: 0 }}>
                auto
              </span>
            </li>
          )}
        </ul>
      </section>

      <section className="admin-section">
        <h2>Pitch ledger ({pitchLedger.length})</h2>
        <form onSubmit={addLedgerItem} className="admin-form">
          <input
            placeholder="Tag (e.g. District final, 2019)"
            value={ledgerForm.tag}
            onChange={(e) => setLedgerForm({ ...ledgerForm, tag: e.target.value })}
            required
          />
          <textarea
            placeholder="The story / entry text"
            rows={3}
            value={ledgerForm.body}
            onChange={(e) => setLedgerForm({ ...ledgerForm, body: e.target.value })}
            required
          />
          <button type="submit">Add entry</button>
        </form>
        <ul className="admin-list">
          {pitchLedger.map((item) => (
            <li key={item.id}>
              <span>{item.tag}</span>
              <button onClick={() => removeLedgerItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
