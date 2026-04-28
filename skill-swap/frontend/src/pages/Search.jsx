// src/pages/Search.jsx — PHASE 7
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { Avatar, Stars, SkillTag, Spinner, EmptyState } from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = useState({ skill: "", level: "", location: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookmarked, setBookmarked] = useState({});
  const navigate = useNavigate();

  const doSearch = useCallback(async () => {
    setLoading(true); setSearched(true);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(query).filter(([, v]) => v)));
      const res = await api.get(`/users/search?${params}`);
      setResults(res.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => {
    // Search on mount to show all users
    doSearch();
  }, []);

  const toggleBookmark = async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/bookmark`);
      setBookmarked((b) => ({ ...b, [userId]: res.data.bookmarked }));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title mb-6">🔍 Find People</h1>

        {/* Search bar */}
        <div className="card card-pad mb-6">
          <div className="grid-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Skill</label>
              <input className="form-input" placeholder="e.g. Guitar, Python…" value={query.skill} onChange={(e) => setQuery((q) => ({ ...q, skill: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Level</label>
              <select className="form-input" value={query.level} onChange={(e) => setQuery((q) => ({ ...q, level: e.target.value }))}>
                <option value="">Any level</option>
                {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="e.g. Delhi…" value={query.location} onChange={(e) => setQuery((q) => ({ ...q, location: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
            </div>
          </div>
          <div className="mt-4">
            <button className="btn btn-primary" onClick={doSearch} disabled={loading}>
              {loading ? <><Spinner size="sm" /> Searching…</> : "Search →"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><Spinner size="lg" /><span>Searching…</span></div>
        ) : searched && results.length === 0 ? (
          <EmptyState icon="🔍" title="No users found" sub="Try different search terms." />
        ) : (
          <div className="grid-auto">
            {results.map((u) => (
              <div key={u._id} className="user-card">
                <div className="user-card-header">
                  <Avatar name={u.name} size="md" />
                  <div style={{ flex: 1 }}>
                    <div className="user-card-name">{u.name}</div>
                    <div className="user-card-meta">📍 {u.location || "Unknown"}</div>
                    <Stars rating={u.averageRating} total={u.totalRatings} />
                  </div>
                </div>
                {u.bio && <p className="text-sm text-muted mb-3" style={{ lineHeight: 1.5 }}>{u.bio}</p>}
                <div className="user-card-skills">
                  {u.skillsOffered?.slice(0, 3).map((s, i) => <SkillTag key={i} skill={s.skill} level={s.level} type="offered" />)}
                  {u.skillsWanted?.slice(0, 2).map((s, i) => <SkillTag key={i} skill={s.skill} level={s.level} type="wanted" />)}
                </div>
                <div className="user-card-footer">
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleBookmark(u._id)}>
                    {bookmarked[u._id] ? "🔖 Saved" : "🔖 Save"}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/matches`)}>
                    Find Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
