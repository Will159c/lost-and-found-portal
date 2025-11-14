import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios.js";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password } = form;
    if (!name.trim() || !email.trim() || !password.trim()) {
      return setError("All fields are required.");
    }
    try {
      setSubmitting(true);
      const { data } = await api.post("/api/auth/register", form);
      login(data.token, data.user);
      navigate("/messages", { replace: true });
    } catch (e2) {
      const s = e2?.response?.status;
      setError(
        s === 409
          ? "Email already registered. Please log in."
          : e2?.response?.data?.message || "Signup failed."
      );
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
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            style={{
              padding: "0.7rem",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
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
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
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
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>
        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>
            {error}
          </p>
        )}
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#60a5fa" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
