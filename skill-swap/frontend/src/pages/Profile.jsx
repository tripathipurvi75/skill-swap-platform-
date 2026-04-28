// src/pages/Profile.jsx — PHASE 3
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Avatar, Stars, SkillTag, Spinner, Alert } from "../components/Navbar";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: "", bio: "", location: "", skillsOffered: [], skillsWanted: [], availability: [] });
  const [newOffered, setNewOffered] = useState({ skill: "", level: "Intermediate" });
  const [newWanted, setNewWanted] = useState({ skill: "", level: "Beginner" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name || "", bio: user.bio || "", location: user.location || "", skillsOffered: user.skillsOffered || [], skillsWanted: user.skillsWanted || [], availability: user.availability || [] });
  }, [user]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const addSkill = (type) => {
    const data = type === "offered" ? newOffered : newWanted;
    if (!data.skill.trim()) return;
    setForm((f) => ({ ...f, [type === "offered" ? "skillsOffered" : "skillsWanted"]: [...f[type === "offered" ? "skillsOffered" : "skillsWanted"], { ...data, skill: data.skill.trim() }] }));
    type === "offered" ? setNewOffered({ skill: "", level: "Intermediate" }) : setNewWanted({ skill: "", level: "Beginner" });
  };

  const removeSkill = (type, idx) => {
    const key = type === "offered" ? "skillsOffered" : "skillsWanted";
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
  };

  const toggleAvailability = (day, timeSlot) => {
    setForm((f) => {
      const exists = f.availability.find((a) => a.day === day && a.timeSlot === timeSlot);
      return { ...f, availability: exists ? f.availability.filter((a) => !(a.day === day && a.timeSlot === timeSlot)) : [...f.availability, { day, timeSlot }] };
    });
  };

  const isSelected = (day, slot) => form.availability.some((a) => a.day === day && a.timeSlot === slot);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/users/profile", form);
      updateUser(res.data.user);
      setMsg({ type: "success", text: "Profile saved successfully!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to save." });
    } finally { setSaving(false); setTimeout(() => setMsg({ type: "", text: "" }), 3000); }
  };

  return (
    <div className="page">
      <div className="container-sm">
        {/* Profile Hero */}
        <div className="profile-hero mb-6">
          <Avatar name={user?.name} size="xl" />
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <div className="location">📍 {user?.location || "Location not set"}</div>
            <Stars rating={user?.averageRating} total={user?.totalRatings} />
            <div className="mt-2">
              <span className={`badge ${user?.role === "admin" ? "badge-gold" : "badge-accent"}`}>{user?.role}</span>
            </div>
          </div>
        </div>

        {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}

        <form onSubmit={onSave}>
          {/* Basic Info */}
          <div className="card card-pad mb-4">
            <h2 className="section-title mb-4">Basic Info</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" value={form.name} onChange={onChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" value={form.location} onChange={onChange} placeholder="Delhi, India" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" name="bio" value={form.bio} onChange={onChange} placeholder="Tell others what you're about…" />
            </div>
          </div>

          {/* Skills Offered */}
          <div className="card card-pad mb-4">
            <h2 className="section-title mb-4">🎓 Skills I Can Teach</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skillsOffered.map((s, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <SkillTag skill={s.skill} level={s.level} type="offered" />
                  <button type="button" onClick={() => removeSkill("offered", i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14 }}>×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="form-input" placeholder="e.g. Python" value={newOffered.skill} onChange={(e) => setNewOffered((f) => ({ ...f, skill: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("offered"))} />
              <select className="form-input" style={{ width: "auto" }} value={newOffered.level} onChange={(e) => setNewOffered((f) => ({ ...f, level: e.target.value }))}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <button type="button" className="btn btn-secondary" onClick={() => addSkill("offered")}>Add</button>
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="card card-pad mb-4">
            <h2 className="section-title mb-4">🌱 Skills I Want to Learn</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skillsWanted.map((s, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <SkillTag skill={s.skill} level={s.level} type="wanted" />
                  <button type="button" onClick={() => removeSkill("wanted", i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14 }}>×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="form-input" placeholder="e.g. Guitar" value={newWanted.skill} onChange={(e) => setNewWanted((f) => ({ ...f, skill: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("wanted"))} />
              <select className="form-input" style={{ width: "auto" }} value={newWanted.level} onChange={(e) => setNewWanted((f) => ({ ...f, level: e.target.value }))}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <button type="button" className="btn btn-secondary" onClick={() => addSkill("wanted")}>Add</button>
            </div>
          </div>

          {/* Availability */}
          <div className="card card-pad mb-4">
            <h2 className="section-title mb-4">🕐 Availability</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>Day / Slot</th>
                    {SLOTS.map((s) => <th key={s} style={{ padding: "8px 12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{day}</td>
                      {SLOTS.map((slot) => (
                        <td key={slot} style={{ padding: "8px 12px", textAlign: "center" }}>
                          <button type="button" onClick={() => toggleAvailability(day, slot)}
                            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid", cursor: "pointer", transition: "all 0.15s", background: isSelected(day, slot) ? "var(--accent)" : "var(--bg-elevated)", borderColor: isSelected(day, slot) ? "var(--accent)" : "var(--border)", color: isSelected(day, slot) ? "#fff" : "var(--text-muted)", fontSize: 14 }}>
                            {isSelected(day, slot) ? "✓" : ""}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={saving}>
            {saving ? <><Spinner size="sm" /> Saving…</> : "Save Profile →"}
          </button>
        </form>
      </div>
    </div>
  );
}
