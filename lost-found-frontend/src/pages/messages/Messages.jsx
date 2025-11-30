import { useState, useEffect } from "react";
import { sendMessage, getMessages } from "../../api/messages.js";

import styles from "./messages.module.css"; 

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [composeTo, setComposeTo] = useState("");  
  const [composeText, setComposeText] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!composeTo) return setMessages([]);
    setLoading(true);
    setError("");
    getMessages(composeTo)
      .then(res => {
        setMessages(res.data);
      })
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  }, [composeTo]);

 
  async function onSend(e) {
    e.preventDefault();
    if (!composeTo || !composeText) return;
    setLoading(true);
    setError("");
    try {
      await sendMessage({ to: composeTo, text: composeText });
      setMessages([
        ...messages,
        { from: "me", text: composeText, createdAt: new Date().toISOString() }
      ]);
      setComposeText("");
    } catch {
      setError("Failed to send message.");
    }
    setLoading(false);
  }

  return (
    <div className={styles.outerWrap}>
      <div className={styles.layout}>
        <div className={styles.chat}>
          <div className={styles.chatHeader}>
            <h1 className={styles.chatTitle}>Start a Conversation</h1>
            <div className={styles.chatSub}>Enter a user email or ID to begin</div>
          </div>
          <div className={styles.scroll}>
            {error && <div className={styles.error}>{error}</div>}
            {loading ? (
              <div className={styles.muted}>Loading…</div>
            ) : messages.length > 0 ? (
              messages.map((msg, i) => (
                <div key={i} className={msg.from === "me" ? styles.me : styles.them}>
                  <div style={{ fontWeight: 600 }}>{msg.text}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.muted}>No messages yet.</div>
            )}
          </div>
          <form className={styles.composeBar} onSubmit={onSend}>
            <input
              className={styles.input}
              type="text"
              placeholder="User email or ID"
              value={composeTo}
              onChange={e => setComposeTo(e.target.value)}
              aria-label="Recipient"
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Type your message…"
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              aria-label="Message"
            />
            <button type="submit" className={styles.sendBtn} disabled={loading}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
