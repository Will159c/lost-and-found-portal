import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function useTokenFromQuery() {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);
}

export default function ResetPassword() {
  const token = useTokenFromQuery();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      return setError("Missing reset token.");
    }

    if (!password || !confirmPassword) {
      return setError("Please fill out both password fields.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setSubmitting(true);
      const res = await api.post("/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });

      setMessage(res.data?.message || "Password reset successful.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  }

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
          background: "white",
          maxWidth: 400,
          width: "100%",
          padding: 32,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,.07)",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Reset Password</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: 12,
              borderRadius: 6,
              background: submitting ? "#90a4ae" : "#304ffe",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>

          {message && <div style={{ color: "green" }}>{message}</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}