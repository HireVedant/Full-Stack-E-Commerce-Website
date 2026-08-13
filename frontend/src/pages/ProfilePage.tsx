import { useAuth } from "../store/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "../components/common/Skeleton";

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <main className="container"><Spinner /></main>;

  if (!isAuthenticated || !user) {
    return (
      <main className="container auth-page">
        <div className="empty-state">
          <h2>Not Logged In</h2>
          <p>Please login to view your profile.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main className="container" style={{ padding: "40px 0" }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div style={{ maxWidth: 600, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 700 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{user.name}</h2>
            <p style={{ color: "var(--text-muted)", marginTop: 4 }}>{user.email}</p>
            <span className={`badge ${user.role === "admin" ? "badge-in-stock" : ""}`} style={{ marginTop: 8, display: "inline-flex", background: user.role === "admin" ? "rgba(108,99,255,0.15)" : "var(--bg-elevated)", color: user.role === "admin" ? "var(--accent)" : "var(--text-muted)" }}>
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: "1.1rem" }}>Account Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Member Since</p>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Account ID</p>
              <p>#{user.id}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Link to="/orders" className="btn btn-primary">View My Orders</Link>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </main>
  );
}
