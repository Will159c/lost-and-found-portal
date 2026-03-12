import { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) return setError("Please enter your email.");

    try {
      const res = await api.post("/auth/forgot-password", { email });

      if (res.data.resetURL) {
        setMessage(`Reset Link: ${res.data.resetURL}`);
      } else {
        setMessage(res.data.message);
      }

    } catch {
      setError("Error generating reset link.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", maxWidth: 400, width: "100%", padding: 32, borderRadius: 12 }}>
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit">Generate Reset Link</button>
          {message && <div style={{ color: "green", wordBreak: "break-all" }}>{message}</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}