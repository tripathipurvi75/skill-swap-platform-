// src/pages/SwapRequestModal.jsx — PHASE 5
import { useState } from "react";
import api from "../utils/api";
import { Avatar, Spinner, Alert } from "../components/Navbar";

export default function SwapRequestModal({ match, onClose }) {
  const { user, matchDetails } = match;
  const [form, setForm] = useState({
    skillOffered: matchDetails?.iCanTeachThem?.[0] || "",
    skillWanted: matchDetails?.theyCanTeachMe?.[0] || "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/swaps", { to: user.id, ...form });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="card card-pad" style={{ maxWidth: 480, width: "100%", animation: "fadeIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>Request Sent!</h3>
            <p className="text-muted">We've notified {user.name}. They'll respond soon.</p>
            <button className="btn btn-primary mt-4" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={user.name} size="md" />
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Request Swap with {user.name}</h3>
                <p className="text-sm text-muted">📍 {user.location || "Unknown"}</p>
              </div>
              <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>

            {error && <Alert type="error">{error}</Alert>}

            <form onSubmit={onSend}>
              <div className="form-group">
                <label className="form-label">I will teach them</label>
                <input className="form-input" value={form.skillOffered} onChange={(e) => setForm((f) => ({ ...f, skillOffered: e.target.value }))} placeholder="Skill you're offering" required />
              </div>
              <div className="form-group">
                <label className="form-label">I want to learn</label>
                <input className="form-input" value={form.skillWanted} onChange={(e) => setForm((f) => ({ ...f, skillWanted: e.target.value }))} placeholder="Skill you want" required />
              </div>
              <div className="form-group">
                <label className="form-label">Message (optional)</label>
                <textarea className="form-input" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Hi! I'd love to swap skills with you…" />
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <><Spinner size="sm" /> Sending…</> : "Send Request →"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
