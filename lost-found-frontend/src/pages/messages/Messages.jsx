import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/AuthContext.jsx";
import { getSocketURL } from "../../api/axios.js";
import {
  sendMessage,
  getMessages,
  getContacts,
  pingPresence,
} from "../../api/messages.js";
import styles from "./messages.module.css";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function appendUnique(messages, nextMessage) {
  if (!nextMessage) return messages;

  const exists = messages.some((message) => {
    if (!message._id || !nextMessage._id) return false;
    return String(message._id) === String(nextMessage._id);
  });

  return exists ? messages : [...messages, nextMessage];
}

function isConversationMessage(message, myEmail, otherEmail) {
  if (!message) return false;

  const from = normalizeEmail(message.from);
  const to = normalizeEmail(message.to);
  const me = normalizeEmail(myEmail);
  const other = normalizeEmail(otherEmail);

  return (
    (from === me && to === other) ||
    (from === other && to === me)
  );
}

export default function Messages() {
  const { user } = useContext(AuthContext);
  const myEmail = normalizeEmail(user?.email);

  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [composeTo, setComposeTo] = useState("");
  const [composeText, setComposeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  const loadContacts = useCallback(async () => {
    try {
      const res = await getContacts();
      const list = (res.data || []).filter((contact) => contact.isAdmin);
      setContacts(list);

      setComposeTo((prev) => {
        if (
          prev &&
          list.some((contact) => normalizeEmail(contact.email) === normalizeEmail(prev))
        ) {
          return prev;
        }

        return list[0]?.email || "";
      });
    } catch {
      setError("Failed to load admin contacts.");
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    setLoadingContacts(true);
    setError("");
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (!myEmail) return;

    pingPresence().catch(() => {});
    const id = setInterval(() => {
      pingPresence().catch(() => {});
      loadContacts();
    }, 30000);

    return () => clearInterval(id);
  }, [loadContacts, myEmail]);

  useEffect(() => {
    if (!myEmail) return;

    socketRef.current = io(getSocketURL());
    socketRef.current.emit("join", myEmail);

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => {
        return isConversationMessage(msg, myEmail, composeTo)
          ? appendUnique(prev, msg)
          : prev;
      });

      loadContacts();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [composeTo, loadContacts, myEmail]);

  useEffect(() => {
    if (!composeTo) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError("");

    getMessages(composeTo)
      .then((res) => setMessages(res.data))
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  }, [composeTo]);

  async function onSend(e) {
    e.preventDefault();
    if (!composeTo || !composeText.trim()) return;

    setError("");

    try {
      const res = await sendMessage({ to: composeTo, text: composeText.trim() });
      const savedMessage = res.data;

      setMessages((prev) => {
        return isConversationMessage(savedMessage, myEmail, composeTo)
          ? appendUnique(prev, savedMessage)
          : prev;
      });

      setComposeText("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send message.");
    }
  }

  const selectedContact = contacts.find((contact) => {
    return normalizeEmail(contact.email) === normalizeEmail(composeTo);
  });

  return (
    <div className={styles.outerWrap}>
      <div className={styles.layout}>
        <div className={styles.chat}>
          <div className={styles.chatHeader}>
            <h1 className={styles.chatTitle}>Contact an Admin</h1>
            <div className={styles.chatSub}>
              Messaging is limited to admin accounts only
            </div>
          </div>

          <div className={styles.scroll}>
            {error && <div className={styles.error}>{error}</div>}

            {loadingContacts ? (
              <div className={styles.muted}>Loading admin contacts...</div>
            ) : loading ? (
              <div className={styles.muted}>Loading...</div>
            ) : messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={msg._id || i}
                  className={
                    normalizeEmail(msg.from) === normalizeEmail(composeTo)
                      ? styles.them
                      : styles.me
                  }
                >
                  <div className={styles.messageText}>{msg.text}</div>
                  <div className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.muted}>
                {composeTo ? "No messages yet." : "No admin selected."}
              </div>
            )}
          </div>

          <form className={styles.composeBar} onSubmit={onSend}>
            <div className={styles.composeGrid}>
              <select
                className={styles.input}
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                disabled={loadingContacts || contacts.length === 0}
              >
                {contacts.length === 0 ? (
                  <option value="">No admins available</option>
                ) : (
                  contacts.map((contact) => (
                    <option key={contact.email} value={contact.email}>
                      {contact.firstName
                        ? `${contact.firstName} (${contact.email}) - ${
                            contact.online ? "Online" : "Offline"
                          }`
                        : `${contact.email} - ${
                            contact.online ? "Online" : "Offline"
                          }`}
                    </option>
                  ))
                )}
              </select>

              <div className={styles.statusWrap}>
                <span
                  className={`${styles.statusDot} ${
                    selectedContact?.online ? styles.online : styles.offline
                  }`}
                />
                <span className={styles.statusText}>
                  {selectedContact?.online ? "Online" : "Offline"}
                </span>
              </div>

              <input
                className={styles.input}
                type="text"
                placeholder="Type your message..."
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                disabled={!composeTo || loadingContacts}
              />

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!composeTo || !composeText.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
