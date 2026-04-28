// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⇄</span>
          SkillSwap
        </Link>

        {user && (
          <div className="navbar-links">
            <Link to="/matches" className={isActive("/matches")}>🎯 Matches</Link>
            <Link to="/search" className={isActive("/search")}>🔍 Search</Link>
            <Link to="/swaps" className={isActive("/swaps")}>🔄 Requests</Link>
            <Link to="/chat" className={isActive("/chat")}>💬 Chat</Link>
            {user.role === "admin" && <Link to="/admin" className={isActive("/admin")}>⚡ Admin</Link>}
          </div>
        )}

        <div className="navbar-actions">
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" title="Toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="btn btn-secondary btn-sm">
                <Avatar name={user.name} size="sm" /> {user.name}
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function Avatar({ name = "?", size = "md", src }) {
  const letter = name.charAt(0).toUpperCase();
  if (src) return <img src={src} alt={name} className={`avatar avatar-${size}`} />;
  return <div className={`avatar avatar-${size}`}>{letter}</div>;
}

export function Stars({ rating = 0, total }) {
  return (
    <div className="flex items-center gap-2">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`star ${n <= Math.round(rating) ? "filled" : ""}`}>★</span>
        ))}
      </div>
      <span className="text-sm text-muted">
        {rating > 0 ? `${rating}${total !== undefined ? ` (${total})` : ""}` : "No ratings"}
      </span>
    </div>
  );
}

export function SkillTag({ skill, level, type = "offered" }) {
  return (
    <span className={`skill-tag skill-${type}`}>
      {type === "offered" ? "🎓" : "🌱"} {skill}
      {level && <span style={{ opacity: 0.7, fontSize: 11 }}>· {level}</span>}
    </span>
  );
}

export function Spinner({ size = "md" }) {
  return <div className={`spinner spinner-${size}`} />;
}

export function LoadingPage() {
  return (
    <div className="loading-center">
      <Spinner size="lg" />
      <span>Loading…</span>
    </div>
  );
}

export function EmptyState({ icon = "📭", title, sub, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {sub && <p className="empty-state-sub mt-1">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ type = "error", children }) {
  const icons = { error: "⚠️", success: "✅", warning: "⚡", info: "ℹ️" };
  return (
    <div className={`alert alert-${type}`}>
      <span>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

export function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) { window.location.href = "/login"; return null; }
  if (adminOnly && user.role !== "admin") { window.location.href = "/"; return null; }
  return children;
}
