import { useState } from "react";
import api from "../api/axios";

export default function ForgotUsername() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) return setError("Please enter your email.");

    try {
      const res = await api.post("/auth/forgot-username", { email });

      if (res.data.username) {
        setMessage(`Your username is: ${res.data.username}`);
      } else {
        setMessage(res.data.message);
      }

    } catch {
      setError("Error retrieving username.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", maxWidth: 400, width: "100%", padding: 32, borderRadius: 12 }}>
        <h2>Forgot Username</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit">Retrieve Username</button>
          {message && <div style={{ color: "green" }}>{message}</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}