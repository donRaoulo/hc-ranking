import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

export default function App() {
  const [payload, setPayload] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/ranking.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(setPayload)
      .catch((err) => setPayload({ error: String(err) }));
  }, []);

  const rows = useMemo(() => {
    const data = payload?.data || [];
    const f = q.trim().toLowerCase();
    if (!f) return data;
    return data.filter((r) =>
      (r.name || "").toLowerCase().includes(f) ||
      (r.class || "").toLowerCase().includes(f) ||
      (r.race || "").toLowerCase().includes(f)
    );
  }, [payload, q]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Rising Gods Rangliste</h1>
          <div className="sub">
            Stand:{" "}
            {payload?.generatedAt
              ? new Date(payload.generatedAt).toLocaleString("de-DE")
              : "—"}
            {"  "}• OK: {payload?.ok ?? "—"}/{payload?.total ?? "—"}
          </div>
        </div>

        <div className="controls">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suche Name / Klasse / Rasse…"
          />
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </header>

      <main className="card">
        <div className="thead">
          <div>#</div>
          <div>Name</div>
          <div>Klasse</div>
          <div>Rasse</div>
          <div>Level</div>
        </div>

        {!payload && <div className="status">Lade…</div>}
        {payload?.error && <div className="status bad">Fehler: {payload.error}</div>}

        {payload && !payload.error && (
          <div>
            {rows.map((r, idx) => (
              <div className="row" key={r.name}>
                <div className="rank">#{idx + 1}</div>
                <div className="name">
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.name}
                  </a>
                </div>
                <div><span className="badge">{r.class}</span></div>
                <div><span className="badge">{r.race}</span></div>
                <div><span className="badge">Lvl {r.level}</span></div>
              </div>
            ))}
            {rows.length === 0 && <div className="status">Keine Einträge.</div>}
          </div>
        )}

        {!!payload?.errors?.length && (
          <div className="status">
            <b>Hinweis:</b> {payload.errors.length} Chars konnten nicht gelesen werden (siehe ranking.json → errors).
          </div>
        )}
      </main>
    </div>
  );
}
