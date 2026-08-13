import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../store/AuthContext";
import { showToast } from "../components/common/Toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        showToast({ message: "Registration successful!", type: "success" });
        navigate("/");
      } else if (res.errors) {
        // Format API validation errors
        const newErrs: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(res.errors)) {
          newErrs[key] = msgs[0];
        }
        setErrors(newErrs);
      } else {
        showToast({ message: res.message || "Registration failed", type: "error" });
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p>Join us today</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
