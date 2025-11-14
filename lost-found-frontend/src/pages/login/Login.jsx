import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios.js";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      return setError("Please enter both email and password.");
    }
    try {
      setSubmitting(true);
      const { data } = await api.post("/api/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/messages", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "2rem",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          color: "white",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? "#1e40af" : "#0f172a",
              border: "none",
              borderRadius: "6px",
              padding: "0.8rem",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>
            {error}
          </p>
        )}
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Don’t have an account?{" "}
          <Link to="/signup" style={{ color: "#60a5fa" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
