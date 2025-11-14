import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "24px 16px",
      display: "flex",
      justifyContent: "center",
    },
    container: { width: "100%", maxWidth: 1200 },

    /* hero */
    hero: {
      background: "#1e293b",
      color: "white",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    },
    heroGrid: {
      display: "grid",
      gridTemplateColumns: "1.1fr .9fr",
      gap: 20,
      alignItems: "center",
    },
    h1: { fontSize: "clamp(28px,3.6vw,42px)", margin: "0 0 8px" },
    lead: { color: "#cbd5e1", margin: "0 0 16px", fontSize: 18 },

    searchRow: { display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 },
    input: {
      padding: "14px 14px",
      borderRadius: 8,
      border: "1px solid #334155",
      background: "#0f172a",
      color: "#f8fafc",
      width: "100%",
      outline: "none",
    },
    searchBtn: {
      padding: "12px 16px",
      borderRadius: 8,
      border: "none",
      background: "#0b1220",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
    },

    ctas: { display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" },
    btnPrimary: {
      background: "#4f46e5",
      border: "1px solid #6366f1",
      color: "#fff",
      textDecoration: "none",
      padding: "10px 14px",
      borderRadius: 10,
      fontWeight: 600,
    },
    btnGhost: {
      background: "transparent",
      border: "1px solid #94a3b8",
      color: "#e2e8f0",
      textDecoration: "none",
      padding: "10px 14px",
      borderRadius: 10,
      fontWeight: 600,
    },

    policy: {
      background: "#0f172a",
      color: "white",
      borderRadius: 12,
      padding: 18,
      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
    },
    h2: { fontSize: 20, margin: "0 0 6px" },
    body: { color: "#cbd5e1", margin: 0, lineHeight: 1.6 },

    tiles: {
      marginTop: 24,
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
    },
    tile: {
      background: "#0f172a",
      color: "white",
      borderRadius: 12,
      padding: 18,
      border: "1px solid #1f2937",
      boxShadow: "0 10px 20px rgba(15,23,42,.15)",
    },
    tileTitle: { fontWeight: 800, margin: 0, color: "#e2e8f0", fontSize: 18 },
    tileSub: { color: "#cbd5e1", marginTop: 6, fontSize: 14 },
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 900;
  const heroGrid = isMobile
    ? { ...styles.heroGrid, gridTemplateColumns: "1fr" }
    : styles.heroGrid;

  const featureTiles = [
    { title: "Report and Drop off a found item", desc: "Takes under a minute." },
    { title: "Browse recent posts", desc: "Takes under a minute." },
    { title: "Message securely", desc: "Takes under a minute." },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HERO */}
        <header style={styles.hero}>
          <div style={heroGrid}>
            <div>
              <h1 style={styles.h1}>University Lost &amp; Found</h1>
              <p style={styles.lead}>Search the directory or report a new item.</p>

              <div style={styles.searchRow}>
                <input
                  placeholder="Search items (e.g., 'calculator')"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={styles.input}
                />
                <button
                  style={styles.searchBtn}
                  onClick={() => nav("/messages")}
                >
                  Search
                </button>
              </div>

              <div style={styles.ctas}>
                <Link to="/signup" style={styles.btnPrimary}>
                  Create account
                </Link>
                <Link to="/login" style={styles.btnGhost}>
                  Log in
                </Link>
              </div>
            </div>

            <aside style={styles.policy}>
              <h2 style={styles.h2}>Policy</h2>
              <p style={styles.body}>
                Use university-appropriate language, meet in public campus spaces,
                and follow Student Conduct guidelines. Questions? Contact Campus Life.
              </p>
            </aside>
          </div>
        </header>

        {/* FEATURE TILES */}
        <section style={styles.tiles}>
          {featureTiles.map((t) => (
            <div key={t.title} style={styles.tile}>
              <h4 style={styles.tileTitle}>{t.title}</h4>
              <p style={styles.tileSub}>{t.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
