// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "100px 24px 80px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "var(--accent-light)", color: "var(--accent)", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24, border: "1px solid rgba(200,92,46,0.2)" }}>
          ⇄ Skills, not money
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24 }}>
          Swap skills.<br />
          <span style={{ color: "var(--accent)" }}>Grow together.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Teach what you know. Learn what you don't. No money involved — just humans helping humans.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {user ? (
            <Link to="/matches" className="btn btn-primary btn-lg">Find Your Match →</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 24px", background: "var(--bg-elevated)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 48, letterSpacing: "-0.02em" }}>How it works</h2>
          <div className="grid-3">
            {[
              { icon: "🧑‍🎓", step: "01", title: "Add your skills", desc: "List what you can teach — coding, guitar, yoga, cooking, anything." },
              { icon: "🤝", step: "02", title: "Find your match", desc: "Our algorithm finds people who offer what you want AND want what you offer." },
              { icon: "⇄", step: "03", title: "Swap & grow", desc: "Send a swap request, agree on a schedule, and start teaching each other." },
            ].map((item) => (
              <div key={item.step} className="card card-pad" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Step {item.step}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example swaps */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>Example swaps happening now</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>Real exchanges on the platform</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Python", "Guitar"], ["Yoga", "React"], ["Spanish", "Photography"],
              ["Cooking", "Data Science"], ["UI Design", "Chess"],
            ].map(([a, b]) => (
              <div key={a} className="card" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 15 }}>
                <span style={{ background: "var(--accent-2-light)", color: "var(--accent-2)", padding: "6px 14px", borderRadius: 20, fontWeight: 600 }}>🎓 {a}</span>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 18 }}>⇄</span>
                <span style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "6px 14px", borderRadius: 20, fontWeight: 600 }}>🌱 {b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
