 "use client";

import { useEffect, useMemo, useState } from "react";

function useToken() {
  const [token, setTokenState] = useState("");

  useEffect(() => {
    setTokenState(localStorage.getItem("snapwritoo-admin-token") || "");
  }, []);

  function setToken(value) {
    setTokenState(value);
    localStorage.setItem("snapwritoo-admin-token", value);
  }

  return [token, setToken];
}

export default function AdminPage() {
  const [token, setToken] = useToken();

  const [poems, setPoems] = useState([]);
  const [photographs, setPhotographs] = useState([]);
  const [pitchStats, setPitchStats] = useState([]);
  const [pitchLedger, setPitchLedger] = useState([]);

  const [poemForm, setPoemForm] = useState({
    title: "",
    author: "",
    lines: "",
  });

  const [photoForm, setPhotoForm] = useState({
    caption: "",
    tint: "",
  });

  const [ledgerForm, setLedgerForm] = useState({
    tag: "",
    body: "",
  });

  const [statEdits, setStatEdits] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
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
    } catch (error) {
      setStatus(`Error loading dashboard: ${error.message}`);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const average = useMemo(() => {
    const runs = pitchStats.find(
      (s) => s.label?.toLowerCase() === "runs"
    );
    const matches = pitchStats.find(
      (s) => s.label?.toLowerCase() === "matches"
    );

    if (!runs || !matches) return null;

    const runsNum = parseFloat(String(runs.value).replace(/,/g, ""));
    const matchesNum = parseFloat(
      String(matches.value).replace(/,/g, "")
    );

    if (!matchesNum || Number.isNaN(runsNum) || Number.isNaN(matchesNum)) {
      return null;
    }

    return (runsNum / matchesNum).toFixed(1);
  }, [pitchStats]);

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

  const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  function onPhotoFileChange(e) {
    const file = e.target.files?.[0] || null;

    if (file && !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setStatus(
        `"${file.name}" is not supported. Use JPG, PNG, WebP or GIF.`
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

    setLoading(true);
    setStatus("Saving poem…");

    try {
      const res = await fetch("/api/poems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          title: poemForm.title,
          author: poemForm.author || undefined,
          lines: poemForm.lines
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || res.statusText);
      }

      setPoemForm({ title: "", author: "", lines: "" });
      setStatus("Poem added successfully.");
      await refresh();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function addPhotograph(e) {
    e.preventDefault();

    if (!photoFile) {
      setStatus("Choose an image first.");
      return;
    }

    setLoading(true);
    setStatus("Uploading photograph…");

    try {
      const imageData = await fileToBase64(photoFile);

      const res = await fetch("/api/photographs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          imageData,
          imageMime: photoFile.type,
          caption: photoForm.caption,
          tint: photoForm.tint,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || res.statusText);
      }

      setPhotoForm({ caption: "", tint: "" });
      setPhotoFile(null);
      setPhotoPreview(null);
      setStatus("Photograph added successfully.");

      await refresh();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function removePoem(id) {
    if (!confirm("Delete this poem?")) return;

    await fetch(`/api/poems/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });

    setStatus("Poem deleted.");
    refresh();
  }

  async function removePhotograph(id) {
    if (!confirm("Delete this photograph?")) return;

    await fetch(`/api/photographs/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });

    setStatus("Photograph deleted.");
    refresh();
  }

  async function saveStat(id, value) {
    setStatus("Saving stat…");

    const res = await fetch(`/api/pitch/stats/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
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

    setLoading(true);
    setStatus("Saving ledger entry…");

    try {
      const res = await fetch("/api/pitch/ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(ledgerForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || res.statusText);
      }

      setLedgerForm({ tag: "", body: "" });
      setStatus("Ledger entry added.");
      await refresh();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function removeLedgerItem(id) {
    if (!confirm("Delete this ledger entry?")) return;

    await fetch(`/api/pitch/ledger/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });

    setStatus("Ledger entry deleted.");
    refresh();
  }

  return (
    <main id="admin-page">
      <header className="admin-hero">
        <div>
          <p className="admin-kicker">SnapWritoo / Studio</p>

          <h1>
            Welcome,
            <span> Priyanshi Dwivedi</span>
          </h1>

          <p className="admin-intro">
            A quiet control room for poems, photographs, pitch statistics
            and the stories behind them.
          </p>
        </div>

        <div className="admin-hero-mark" aria-hidden="true">
          <span>SW</span>
          <small>ADMIN</small>
        </div>
      </header>

      <section className="admin-access">
        <div>
          <p className="admin-eyebrow">/ Access</p>
          <h2>Admin token</h2>
          <p>
            Your token is stored locally in this browser and sent with
            protected admin requests.
          </p>
        </div>

        <div className="admin-access-field">
          <label htmlFor="admin-token">Authentication token</label>

          <div className="admin-input-row">
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter admin token"
              autoComplete="current-password"
            />

            <span className={token ? "token-dot active" : "token-dot"}>
              {token ? "READY" : "EMPTY"}
            </span>
          </div>
        </div>
      </section>

      {status && (
        <div className="admin-status" role="status">
          <span className="status-line" />
          <span>{status}</span>
        </div>
      )}

      <section className="admin-overview">
        <article>
          <span>POEMS</span>
          <strong>{poems.length}</strong>
          <small>published entries</small>
        </article>

        <article>
          <span>PHOTOGRAPHS</span>
          <strong>{photographs.length}</strong>
          <small>visual stories</small>
        </article>

        <article>
          <span>PITCH STATS</span>
          <strong>{pitchStats.length}</strong>
          <small>tracked metrics</small>
        </article>

        <article>
          <span>LEDGER</span>
          <strong>{pitchLedger.length}</strong>
          <small>story entries</small>
        </article>
      </section>

      <div className="admin-content">
        {/* POEMS */}
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="admin-eyebrow">/ Writing</p>
              <h2>Poems</h2>
            </div>

            <span className="admin-count">
              {String(poems.length).padStart(2, "0")}
            </span>
          </div>

          <p className="admin-card-description">
            Add new writing to the collection. Each line in the editor
            becomes a separate poem line.
          </p>

          <form onSubmit={addPoem} className="admin-form">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="poem-title">Title</label>
                <input
                  id="poem-title"
                  placeholder="The title of the poem"
                  value={poemForm.title}
                  onChange={(e) =>
                    setPoemForm({
                      ...poemForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="poem-author">Author</label>
                <input
                  id="poem-author"
                  placeholder="Optional"
                  value={poemForm.author}
                  onChange={(e) =>
                    setPoemForm({
                      ...poemForm,
                      author: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="poem-lines">Poem</label>
              <textarea
                id="poem-lines"
                placeholder={"One line per row…\nLet the words breathe."}
                rows={7}
                value={poemForm.lines}
                onChange={(e) =>
                  setPoemForm({
                    ...poemForm,
                    lines: e.target.value,
                  })
                }
                required
              />
            </div>

            <button className="admin-primary-button" type="submit" disabled={loading}>
              <span>{loading ? "Saving…" : "Add poem"}</span>
              <span>↗</span>
            </button>
          </form>

          <div className="admin-divider" />

          <div className="admin-list-header">
            <h3>Existing poems</h3>
            <span>{poems.length} entries</span>
          </div>

          <ul className="admin-list">
            {poems.length === 0 ? (
              <li className="admin-empty">No poems yet.</li>
            ) : (
              poems.map((poem) => (
                <li key={poem.id}>
                  <div>
                    <strong>{poem.title}</strong>
                    {poem.author && <small>{poem.author}</small>}
                  </div>

                  <button
                    className="admin-delete"
                    onClick={() => removePoem(poem.id)}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* PHOTOGRAPHS */}
        <section className="admin-card admin-photo-card">
          <div className="admin-card-head">
            <div>
              <p className="admin-eyebrow">/ Frames</p>
              <h2>Photographs</h2>
            </div>

            <span className="admin-count">
              {String(photographs.length).padStart(2, "0")}
            </span>
          </div>

          <p className="admin-card-description">
            Upload a frame, give it a caption and optionally define the
            tint used by the gallery.
          </p>

          <form onSubmit={addPhotograph} className="admin-form">
            <div className="photo-upload">
              <label htmlFor="photo-file" className="upload-box">
                {photoPreview ? (
                  <img src={photoPreview} alt="Selected preview" />
                ) : (
                  <>
                    <span className="upload-icon">+</span>
                    <strong>Choose a photograph</strong>
                    <small>JPG / PNG / WebP / GIF · Max 2.5MB</small>
                  </>
                )}

                <input
                  id="photo-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onPhotoFileChange}
                />
              </label>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="photo-caption">Caption</label>
                <input
                  id="photo-caption"
                  placeholder="A short description"
                  value={photoForm.caption}
                  onChange={(e) =>
                    setPhotoForm({
                      ...photoForm,
                      caption: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="photo-tint">Tint gradient</label>
                <input
                  id="photo-tint"
                  placeholder="Optional CSS gradient"
                  value={photoForm.tint}
                  onChange={(e) =>
                    setPhotoForm({
                      ...photoForm,
                      tint: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button className="admin-primary-button" type="submit" disabled={loading}>
              <span>{loading ? "Uploading…" : "Upload photograph"}</span>
              <span>↗</span>
            </button>
          </form>

          <div className="admin-divider" />

          <div className="admin-list-header">
            <h3>Gallery inventory</h3>
            <span>{photographs.length} frames</span>
          </div>

          <ul className="admin-list">
            {photographs.length === 0 ? (
              <li className="admin-empty">No photographs yet.</li>
            ) : (
              photographs.map((photo) => (
                <li key={photo.id}>
                  <div>
                    <strong>{photo.caption}</strong>
                  </div>

                  <button
                    className="admin-delete"
                    onClick={() => removePhotograph(photo.id)}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* STATS */}
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="admin-eyebrow">/ Numbers</p>
              <h2>Pitch stats</h2>
            </div>

            <span className="admin-count">LIVE</span>
          </div>

          <p className="admin-card-description">
            Keep the fixed performance set current. Average is calculated
            automatically from Runs ÷ Matches.
          </p>

          <div className="stats-board">
            {pitchStats.map((stat) => (
              <div className="stat-row" key={stat.id}>
                <div>
                  <span>{stat.label}</span>
                  <small>editable metric</small>
                </div>

                <input
                  className="admin-stat-input"
                  value={statEdits[stat.id] ?? stat.value}
                  onChange={(e) =>
                    setStatEdits({
                      ...statEdits,
                      [stat.id]: e.target.value,
                    })
                  }
                />

                <button
                  className="stat-save"
                  onClick={() =>
                    saveStat(
                      stat.id,
                      statEdits[stat.id] ?? stat.value
                    )
                  }
                >
                  Save
                </button>
              </div>
            ))}

            {average !== null && (
              <div className="stat-row stat-auto">
                <div>
                  <span>Average</span>
                  <small>calculated automatically</small>
                </div>

                <input
                  className="admin-stat-input"
                  value={average}
                  disabled
                  readOnly
                />

                <span className="auto-badge">AUTO</span>
              </div>
            )}
          </div>
        </section>

        {/* LEDGER */}
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="admin-eyebrow">/ Memory</p>
              <h2>Pitch ledger</h2>
            </div>

            <span className="admin-count">
              {String(pitchLedger.length).padStart(2, "0")}
            </span>
          </div>

          <p className="admin-card-description">
            Preserve the little stories, milestones and moments behind
            the pitch.
          </p>

          <form onSubmit={addLedgerItem} className="admin-form">
            <div className="form-field">
              <label htmlFor="ledger-tag">Entry tag</label>
              <input
                id="ledger-tag"
                placeholder="District final, 2019"
                value={ledgerForm.tag}
                onChange={(e) =>
                  setLedgerForm({
                    ...ledgerForm,
                    tag: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="ledger-body">Story</label>
              <textarea
                id="ledger-body"
                placeholder="Write the memory behind this entry…"
                rows={5}
                value={ledgerForm.body}
                onChange={(e) =>
                  setLedgerForm({
                    ...ledgerForm,
                    body: e.target.value,
                  })
                }
                required
              />
            </div>

            <button className="admin-primary-button" type="submit" disabled={loading}>
              <span>{loading ? "Saving…" : "Add ledger entry"}</span>
              <span>↗</span>
            </button>
          </form>

          <div className="admin-divider" />

          <div className="ledger-list">
            {pitchLedger.length === 0 ? (
              <div className="admin-empty">No ledger entries yet.</div>
            ) : (
              pitchLedger.map((item, index) => (
                <article className="ledger-item" key={item.id}>
                  <div className="ledger-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="ledger-content">
                    <span>{item.tag}</span>
                    <p>{item.body}</p>
                  </div>

                  <button
                    className="admin-delete"
                    onClick={() => removeLedgerItem(item.id)}
                  >
                    Delete
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="admin-footer">
        <span>SNAPWRITOO</span>
        <span>PRIVATE STUDIO / ADMIN</span>
        <span>~Priyanshi..♪</span>
      </footer>
    </main>
  );
}
