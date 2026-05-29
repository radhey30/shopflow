import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) clearError();
  }, [email, password]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {}
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcom back</h1>
        <p style={styles.subtitle}>Sign in to ShopFlow</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.footerLink}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    background: "white",
    padding: "2.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  title: { margin: 0, fontSize: "1.8rem", color: "#1a1a2e" },
  subtitle: { color: "#888", marginTop: "0.3rem", marginBottom: "1.5rem" },
  error: {
    background: "#fff0f0",
    color: "#e94560",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.875rem", fontWeight: 600, color: "#333" },
  input: {
    padding: "0.75rem 1rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "0.85rem",
    backgroundColor: "#e94560",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: 600,
    marginTop: "0.5rem",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#888",
    fontSize: "0.9rem",
  },
  footerLink: { color: "#e94560", textDecoration: "none", fontWeight: 600 },
};

export default LoginPage;
