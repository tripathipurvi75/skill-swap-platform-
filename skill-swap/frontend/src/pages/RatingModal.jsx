// src/pages/RatingModal.jsx — PHASE 6
import { useState } from "react";
import api from "../utils/api";
import { Spinner, Alert } from "../components/Navbar";

export default function RatingModal({ user, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    setLoading(true);
    try {
      await api.post(`/users/${user._id || user.id}/rate`, { rating, feedback });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="card card-pad" style={{ maxWidth: 420, width: "100%", animation: "fadeIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>Rating Submitted!</h3>
            <p className="text-muted">Thank you for helping build trust in the community.</p>
            <button className="btn btn-primary mt-4" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>Rate {user.name}</h3>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>
            {error && <Alert type="error">{error}</Alert>}
            <form onSubmit={onSubmit}>
              <div className="form-group" style={{ textAlign: "center" }}>
                <label className="form-label">Your Rating</label>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 36, cursor: "pointer", margin: "8px 0" }}>
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                      style={{ color: n <= (hover || rating) ? "var(--accent-3)" : "var(--border)", transition: "color 0.1s", userSelect: "none" }}>★</span>
                  ))}
                </div>
                <div className="text-sm text-muted">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hover || rating] || "Select a rating"}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Feedback (optional)</label>
                <textarea className="form-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience with this person…" />
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading || !rating}>
                  {loading ? <><Spinner size="sm" /> Submitting…</> : "Submit Rating"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
