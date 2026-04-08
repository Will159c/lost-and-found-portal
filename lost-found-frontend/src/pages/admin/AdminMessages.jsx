import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/AuthContext.jsx";
import {
  sendMessage,
  getMessages,
  getContacts,
  pingPresence,
} from "../../api/messages.js";
import styles from "../messages/messages.module.css";

export default function AdminMessages() {
  const { user } = useContext(AuthContext);

  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [composeText, setComposeText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  async function loadContacts() {
    try {
      const res = await getContacts();
      const list = (res.data || []).filter((c) => !c.isAdmin);
      setContacts(list);

      setSelectedUser((prev) => {
        if (prev && list.some((c) => c.email === prev)) return prev;
        return list[0]?.email || "";
      });
    } catch {
      setError("Failed to load user conversations.");
    } finally {
      setLoadingContacts(false);
    }
  }

  useEffect(() => {
    if (!user?.isAdmin) return;
    setLoadingContacts(true);
    setError("");
    loadContacts();
  }, [user]);

  useEffect(() => {
    pingPresence().catch(() => {});
    const id = setInterval(() => {
      pingPresence().catch(() => {});
      loadContacts();
    }, 30000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    socketRef.current = io("http://localhost:5050");
    socketRef.current.emit("join", user.email);

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(msg._id));
        if (exists) return prev;

        if (
          (msg.from === user.email && msg.to === selectedUser) ||
          (msg.from === selectedUser && msg.to === user.email)
        ) {
          return [...prev, msg];
        }

        return prev;
      });

      loadContacts();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, selectedUser]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError("");

    getMessages(selectedUser)
      .then((res) => setMessages(res.data))
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoadingMessages(false));
  }, [selectedUser]);

  async function onSend(e) {
    e.preventDefault();
    if (!selectedUser || !composeText.trim()) return;

    try {
      await sendMessage({
        to: selectedUser,
        text: composeText.trim(),
      });
      setComposeText("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send message.");
    }
  }

  const activeContact = contacts.find((c) => c.email === selectedUser);

  if (!user?.isAdmin) {
    return (
      <div className={styles.outerWrap}>
        <div className={styles.layout}>
          <div className={styles.chatHeader}>
            <h1 className={styles.chatTitle}>Access Denied</h1>
            <div className={styles.chatSub}>
              This page is for admin accounts only
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.outerWrap}>
      <div className={`${styles.layout} ${styles.adminLayout}`}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>User Conversations</div>

          {loadingContacts ? (
            <div className={styles.sidebarEmpty}>Loading...</div>
          ) : contacts.length === 0 ? (
            <div className={styles.sidebarEmpty}>
              No users have contacted you yet.
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.email}
                type="button"
                className={`${styles.contactBtn} ${
                  selectedUser === contact.email ? styles.contactBtnActive : ""
                }`}
                onClick={() => setSelectedUser(contact.email)}
              >
                <span
                  className={`${styles.statusDot} ${
                    contact.online ? styles.online : styles.offline
                  }`}
                />
                <div className={styles.contactInfo}>
                  <div className={styles.contactName}>
                    {contact.firstName || contact.email}
                  </div>
                  <div className={styles.contactEmail}>{contact.email}</div>
                </div>
              </button>
            ))
          )}
        </aside>

        <section className={styles.chat}>
          <div className={styles.chatHeader}>
            <h1 className={styles.chatTitle}>Admin Messages</h1>
            <div className={styles.chatSub}>
              {activeContact
                ? `Conversation with ${activeContact.firstName || activeContact.email}`
                : "Select a user to open messages"}
            </div>
          </div>

          <div className={styles.scroll}>
            {error && <div className={styles.error}>{error}</div>}

            {loadingMessages ? (
              <div className={styles.muted}>Loading...</div>
            ) : messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={msg._id || i}
                  className={msg.from === selectedUser ? styles.them : styles.me}
                >
                  <div className={styles.messageText}>{msg.text}</div>
                  <div className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.muted}>
                {selectedUser ? "No messages yet." : "Select a user on the left."}
              </div>
            )}
          </div>

          <form className={styles.composeBar} onSubmit={onSend}>
            <div className={styles.composeGridAdmin}>
              <div className={styles.statusWrap}>
                <span
                  className={`${styles.statusDot} ${
                    activeContact?.online ? styles.online : styles.offline
                  }`}
                />
                <span className={styles.statusText}>
                  {activeContact?.online ? "Online" : "Offline"}
                </span>
              </div>

              <input
                className={styles.input}
                type="text"
                placeholder="Type your message..."
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                disabled={!selectedUser}
              />

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!selectedUser || !composeText.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}