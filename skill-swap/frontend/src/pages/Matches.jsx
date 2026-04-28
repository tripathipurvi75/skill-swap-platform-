// src/pages/Matches.jsx — PHASE 4
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Avatar, Stars, SkillTag, LoadingPage, EmptyState } from "../components/Navbar";
import SwapRequestModal from "./SwapRequestModal";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/users/matches")
      .then((r) => setMatches(r.data.matches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="page">
      <div className="container">
        <div className="mb-6">
          <h1 className="page-title">🎯 Your Matches</h1>
          <p className="page-subtitle">People who want what you offer — and offer what you want.</p>
        </div>

        {matches.length === 0 ? (
          <EmptyState icon="🔍" title="No matches yet" sub="Complete your profile by adding skills offered and wanted." action={<button className="btn btn-primary" onClick={() => navigate("/profile")}>Edit Profile →</button>} />
        ) : (
          <div className="grid-auto">
            {matches.map(({ user, matchDetails }) => (
              <MatchCard key={user.id} user={user} matchDetails={matchDetails} onRequest={() => setSelected({ user, matchDetails })} />
            ))}
          </div>
        )}
      </div>
      {selected && <SwapRequestModal match={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function MatchCard({ user, matchDetails, onRequest }) {
  const maxScore = 20;
  const pct = Math.min((matchDetails.score / maxScore) * 100, 100);

  return (
    <div className="user-card" onClick={onRequest}>
      <div className="user-card-header">
        <Avatar name={user.name} size="md" />
        <div style={{ flex: 1 }}>
          <div className="user-card-name">{user.name}</div>
          <div className="user-card-meta">📍 {user.location || "Location unknown"}</div>
          <Stars rating={user.averageRating} total={user.totalRatings} />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-muted mb-2">They can teach you:</div>
        <div className="flex flex-wrap gap-2">
          {matchDetails.theyCanTeachMe.map((s) => <SkillTag key={s} skill={s} type="offered" />)}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-muted mb-2">You can teach them:</div>
        <div className="flex flex-wrap gap-2">
          {matchDetails.iCanTeachThem.map((s) => <SkillTag key={s} skill={s} type="wanted" />)}
        </div>
      </div>

      {matchDetails.availabilityOverlap.length > 0 && (
        <div className="text-sm mb-4" style={{ color: "var(--accent-2)" }}>
          📅 Available on: {matchDetails.availabilityOverlap.join(", ")}
        </div>
      )}

      <div className="user-card-footer">
        <div className="match-score" style={{ flex: 1, marginRight: 12 }}>
          <span>Match</span>
          <div className="match-score-bar">
            <div className="match-score-fill" style={{ width: `${pct}%` }} />
          </div>
          <span>{matchDetails.score.toFixed(1)}</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onRequest(); }}>
          Request Swap
        </button>
      </div>
    </div>
  );
}
