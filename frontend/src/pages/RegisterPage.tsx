import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");

  const { register, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    if (error || localError) {
      clearError();
      setLocalError("");
    }
  }, [name, email, password, confirm]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setLocalError("Password do not match");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    try {
      await register(name, email, password);
    } catch (error) {}
  };

  const displayError = localError || error;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join ShopFlow today</p>
        {displayError && <div style={styles.error}>{displayError}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            {
              label: "Name",
              value: name,
              setter: setName,
              type: "text",
              placeholder: "John Doe",
            },
            {
              label: "Email",
              value: email,
              setter: setEmail,
              type: "email",
              placeholder: "you@example.com",
            },
            {
              label: "Password",
              value: password,
              setter: setPassword,
              type: "password",
              placeholder: "Min 6 characters",
            },
            {
              label: "Confirm Password",
              value: confirm,
              setter: setConfirm,
              type: "password",
              placeholder: "Repeat password",
            },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                required
                style={styles.input}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            style={{ ...styles.button, opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
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
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#888",
    fontSize: "0.9rem",
  },
  footerLink: { color: "#e94560", textDecoration: "none", fontWeight: 600 },
};

export default RegisterPage;
