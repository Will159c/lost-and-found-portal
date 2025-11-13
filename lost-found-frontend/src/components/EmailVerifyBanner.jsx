
import { useContext, useState } from "react";
import api from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";

export default function EmailVerifyBanner() {
  const { user } = useContext(AuthContext);
  const [msg, setMsg] = useState("");
  if (!user || user.emailVerified) return null;

  const resend = async () => {
    setMsg("");
    try {
      await api.post("/api/auth/resend-verification");
      setMsg("Verification email sent.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to send email.");
    }
  };

  return (
    <div style={{ background: "#FFF7E6", padding: 10, border: "1px solid #FACC15" }}>
      Please verify your email to enable messaging.
      <button onClick={resend} style={{ marginLeft: 8 }}>Resend link</button>
      {msg && <span style={{ marginLeft: 8 }}>{msg}</span>}
    </div>
  );
}
