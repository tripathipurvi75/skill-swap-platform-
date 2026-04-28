// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import api from "../utils/api";
import { Avatar, Stars, LoadingPage, EmptyState } from "../components/Navbar";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users").then((r) => setUsers(r.data.users)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  const admins = users.filter((u) => u.role === "admin");
  const regular = users.filter((u) => u.role === "user");

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title mb-2">⚡ Admin Panel</h1>
        <p className="page-subtitle mb-6">Platform overview and user management.</p>

        {/* Stats */}
        <div className="grid-3 mb-6">
          {[
            { label: "Total Users", value: users.length, icon: "👥" },
            { label: "Admins", value: admins.length, icon: "⚡" },
            { label: "Regular Users", value: regular.length, icon: "👤" },
          ].map((s) => (
            <div key={s.label} className="card card-pad" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--accent)" }}>{s.value}</div>
              <div className="text-muted text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="card">
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>
            All Users
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["User", "Email", "Role", "Skills Offered", "Rating", "Joined"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} size="sm" />
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className={`badge ${u.role === "admin" ? "badge-gold" : "badge-muted"}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex flex-wrap gap-1">
                        {u.skillsOffered?.slice(0, 2).map((s, i) => (
                          <span key={i} style={{ fontSize: 12, background: "var(--accent-2-light)", color: "var(--accent-2)", padding: "2px 8px", borderRadius: 12 }}>{s.skill}</span>
                        ))}
                        {u.skillsOffered?.length > 2 && <span className="text-muted text-sm">+{u.skillsOffered.length - 2}</span>}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Stars rating={u.averageRating} total={u.totalRatings} />
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
