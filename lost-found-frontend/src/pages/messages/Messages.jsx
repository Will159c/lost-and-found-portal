import { useEffect, useMemo, useRef, useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function whoIsOther(me, a, b) {
  const myId = me?._id;
  if (myId && a?._id === myId) return b;
  return a;
}
function threadKey(user) {
  return user?._id || user?.email || "unknown";
}

export default function Messages() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [composeTo, setComposeTo] = useState("");
  const [composeText, setComposeText] = useState("");
  const [error, setError] = useState("");
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setError("");
        setLoading(true);
        const { data } = await api.get("/api/messages/inbox");
        const msgs = data?.messages ?? [];
        const grouped = new Map();

        msgs.forEach((m) => {
          const other = whoIsOther(user, m.from, m.to);
          const key = threadKey(other);
          const title = other?.username || other?.email || "Unknown user";
          if (!grouped.has(key)) grouped.set(key, { id: key, title, lastText: "", messages: [] });
          grouped.get(key).messages.push(m);
        });

        const result = Array.from(grouped.values()).map((t) => {
          const sorted = [...t.messages].sort(
            (a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)
          );
          const last = sorted[sorted.length - 1];
          return { ...t, messages: sorted, lastText: last?.text ?? "", lastAt: last?.createdAt };
        });

        result.sort((a, b) => new Date(b.lastAt ?? 0) - new Date(a.lastAt ?? 0));
        setThreads(result);
        setActiveId((prev) => prev ?? result[0]?.id ?? null);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load messages.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) || null,
    [threads, activeId]
  );

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [activeId, active?.messages?.length]);

  const onSend = async (e) => {
    e.preventDefault();
    setError("");

    const toField = active ? active.id : composeTo.trim();
    if (!toField) return setError("Please choose a recipient (user id or email).");
    if (!composeText.trim()) return;

    try {
      await api.post("/api/messages/send", { to: toField, text: composeText.trim() });
      setComposeText("");

      const { data } = await api.get("/api/messages/inbox");
      const msgs = data?.messages ?? [];
      const grouped = new Map();
      msgs.forEach((m) => {
        const other = whoIsOther(user, m.from, m.to);
        const key = threadKey(other);
        const title = other?.username || other?.email || "Unknown user";
        if (!grouped.has(key)) grouped.set(key, { id: key, title, lastText: "", messages: [] });
        grouped.get(key).messages.push(m);
      });
      const result = Array.from(grouped.values()).map((t) => {
        const sorted = [...t.messages].sort(
          (a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)
        );
        const last = sorted[sorted.length - 1];
        return { ...t, messages: sorted, lastText: last?.text ?? "", lastAt: last?.createdAt };
      });
      result.sort((a, b) => new Date(b.lastAt ?? 0) - new Date(a.lastAt ?? 0));
      setThreads(result);

      if (!active) {
        const newKey = threadKey({ _id: composeTo.trim(), email: composeTo.trim() });
        const found = result.find((t) => t.id === newKey) ?? result[0];
        setActiveId(found?.id ?? null);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send message.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "900px",
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            borderRight: "1px solid #334155",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Messages</h2>
            <button
              style={{
                background: "#0f172a",
                color: "#fff",
                border: "1px solid #475569",
                borderRadius: "6px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
              onClick={() => {
                setActiveId(null);
                setComposeTo("");
                setComposeText("");
              }}
            >
              + New
            </button>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading…</p>
          ) : threads.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No conversations yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, overflowY: "auto" }}>
              {threads.map((t) => (
                <li
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: t.id === activeId ? "#334155" : "transparent",
                    cursor: "pointer",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#e2e8f0" }}>{t.title}</div>
                  <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>{t.lastText}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* CHAT AREA */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#0f172a",
            color: "white",
            padding: "1rem",
          }}
        >
          <div style={{ marginBottom: "1rem", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
            <h3 style={{ margin: 0 }}>
              {active ? active.title : "Start a new conversation"}
            </h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>
              {active ? "Secure, private messaging" : "Enter a user email or ID to begin"}
            </p>
          </div>

          <div
            ref={scrollerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "1rem",
              paddingRight: "6px",
            }}
          >
            {error && <p style={{ color: "red" }}>{error}</p>}

            {active ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {active.messages.map((m) => {
                  const mine = user?._id && m.from?._id === user._id;
                  return (
                    <li
                      key={m._id}
                      style={{
                        textAlign: mine ? "right" : "left",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          background: mine ? "#4f46e5" : "#334155",
                          color: "white",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          maxWidth: "80%",
                        }}
                      >
                        {m.text}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
                        {mine ? "You" : m.from?.username || m.from?.email || "User"}{" "}
                        {m.createdAt ? `• ${new Date(m.createdAt).toLocaleString()}` : ""}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div>
                <input
                  placeholder="To: user id or email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    background: "#1e293b",
                    color: "#f8fafc",
                    marginBottom: "8px",
                  }}
                />
                <p style={{ color: "#94a3b8" }}>
                  You can also pick an existing conversation on the left.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={onSend} style={{ display: "flex", gap: "8px" }}>
            {!active && (
              <input
                placeholder="Recipient (user id or email)"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                style={{
                  flex: "0 0 200px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #475569",
                  background: "#1e293b",
                  color: "#f8fafc",
                }}
              />
            )}
            <textarea
              placeholder="Write a message..."
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #475569",
                background: "#1e293b",
                color: "#f8fafc",
                resize: "none",
              }}
            />
            <button
              type="submit"
              disabled={!composeText.trim()}
              style={{
                background: "#4f46e5",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
