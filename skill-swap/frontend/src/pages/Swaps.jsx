// src/pages/Swaps.jsx — PHASE 5
import { useState, useEffect } from "react";
import api from "../utils/api";
import { Avatar, LoadingPage, EmptyState, Spinner } from "../components/Navbar";
import RatingModal from "./RatingModal";

export default function Swaps() {
  const [swaps, setSwaps] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("received");
  const [actionLoading, setActionLoading] = useState("");
  const [ratingTarget, setRatingTarget] = useState(null);

  useEffect(() => {
    api.get("/swaps").then((r) => setSwaps(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const respond = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await api.put(`/swaps/${id}/respond`, { action });
      setSwaps((s) => ({ ...s, received: s.received.map((r) => r._id === id ? res.data.swap : r) }));
    } catch (err) { alert(err.response?.data?.message || "Failed."); }
    finally { setActionLoading(""); }
  };

  const cancel = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/swaps/${id}/cancel`);
      setSwaps((s) => ({ ...s, sent: s.sent.map((r) => r._id === id ? { ...r, status: "cancelled" } : r) }));
    } catch (err) { alert(err.response?.data?.message || "Failed."); }
    finally { setActionLoading(""); }
  };

  if (loading) return <LoadingPage />;

  const list = tab === "received" ? swaps.received : swaps.sent;

  return (
    <div className="page">
      <div className="container-sm">
        <h1 className="page-title mb-6">🔄 Swap Requests</h1>

        <div className="flex gap-2 mb-6">
          {["received", "sent"].map((t) => (
            <button key={t} className={`btn ${tab === t ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab(t)}>
              {t === "received" ? "📥" : "📤"} {t.charAt(0).toUpperCase() + t.slice(1)} ({swaps[t].length})
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon={tab === "received" ? "📭" : "📤"} title={`No ${tab} requests`} sub={tab === "received" ? "When someone sends you a swap request, it'll appear here." : "Go to Matches to send your first request."} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.map((swap) => {
              const other = tab === "received" ? swap.from : swap.to;
              const isLoading = actionLoading.startsWith(swap._id);
              return (
                <div key={swap._id} className="swap-card">
                  <Avatar name={other?.name} size="md" />
                  <div className="swap-card-body">
                    <div className="swap-card-title">{other?.name}</div>
                    <div className="swap-card-meta">
                      🎓 Offering: <strong>{swap.skillOffered}</strong> · 🌱 Wants: <strong>{swap.skillWanted}</strong>
                    </div>
                    {swap.message && <p className="text-sm text-muted mb-2" style={{ fontStyle: "italic" }}>"{swap.message}"</p>}
                    <div className="flex items-center gap-3">
                      <span className={`badge badge-${swap.status}`}>{swap.status}</span>
                      <span className="text-sm text-muted">{new Date(swap.createdAt).toLocaleDateString()}</span>
                    </div>
                    {swap.status === "pending" && (
                      <div className="swap-card-actions mt-2">
                        {tab === "received" ? (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => respond(swap._id, "accept")} disabled={isLoading}>
                              {isLoading && actionLoading === swap._id + "accept" ? <Spinner size="sm" /> : "✅ Accept"}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => respond(swap._id, "reject")} disabled={isLoading}>
                              {isLoading && actionLoading === swap._id + "reject" ? <Spinner size="sm" /> : "❌ Reject"}
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => cancel(swap._id)} disabled={isLoading}>
                            {isLoading ? <Spinner size="sm" /> : "Cancel"}
                          </button>
                        )}
                      </div>
                    )}
                    {swap.status === "accepted" && tab === "sent" && (
                      <button className="btn btn-secondary btn-sm mt-2" onClick={() => setRatingTarget(other)}>⭐ Rate {other?.name}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {ratingTarget && <RatingModal user={ratingTarget} onClose={() => setRatingTarget(null)} />}
    </div>
  );
}
