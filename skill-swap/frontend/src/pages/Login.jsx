// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Spinner } from "../components/Navbar";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); setError(""); };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/matches");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span style={{ fontSize: 22 }}>⇄</span> SkillSwap</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to find your perfect skill match.</p>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={onChange} placeholder="Your password" />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><Spinner size="sm" /> Signing in…</> : "Sign in →"}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <div style={{ marginBottom: 4, fontWeight: 600, color: "var(--text-dim)" }}>Demo accounts</div>
          <div>arjun@demo.com / demo123 (Admin)</div>
          <div>priya@demo.com / demo123</div>
        </div>

        <p className="auth-footer">Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
      </div>
    </div>
  );
}
