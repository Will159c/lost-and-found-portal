import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      return setError("Please fill out both fields.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message || "Password updated successfully.");

      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Reset link is invalid or expired."
      );
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "white",
        maxWidth: 400,
        width: "100%",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,.07)",
      }}>
        <h2 style={{ marginBottom: 16 }}>Reset Password</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />

          <button
            type="submit"
            style={{
              padding: 12,
              borderRadius: 6,
              background: "#304ffe",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Update Password
          </button>

          {message && (
            <div style={{ color: "green" }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ color: "red" }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}