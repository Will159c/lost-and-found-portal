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
    if (!email) return setError("Please enter your email address.");
    try {
    
      await api.post('/api/auth/forgot-password', { email });
      setMessage("If an account exists, a password reset link has been sent.");
    } catch {
      setError("Failed to send password reset email.");
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', maxWidth: 400, width: '100%', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
        <h2 style={{ marginBottom: 16 }}>Forgot Password</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button type="submit" style={{ padding: 12, borderRadius: 6, background: '#304ffe', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Send Reset Link
          </button>
          {message && <div style={{ color: "green" }}>{message}</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
