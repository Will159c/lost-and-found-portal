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
import styles from "../messages/messages.module.css";

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

export default function AdminMessages() {
  const { user } = useContext(AuthContext);
  const myEmail = normalizeEmail(user?.email);
  const isAdmin = user?.isAdmin === true;

  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [composeText, setComposeText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  const loadContacts = useCallback(async () => {
    try {
      const res = await getContacts();
      const list = (res.data || []).filter((contact) => !contact.isAdmin);
      setContacts(list);

      setSelectedUser((prev) => {
        if (
          prev &&
          list.some((contact) => normalizeEmail(contact.email) === normalizeEmail(prev))
        ) {
          return prev;
        }

        return list[0]?.email || "";
      });
    } catch {
      setError("Failed to load user conversations.");
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingContacts(true);
    setError("");
    loadContacts();
  }, [isAdmin, loadContacts]);

  useEffect(() => {
    if (!isAdmin || !myEmail) return;

    pingPresence().catch(() => {});
    const id = setInterval(() => {
      pingPresence().catch(() => {});
      loadContacts();
    }, 30000);

    return () => clearInterval(id);
  }, [isAdmin, loadContacts, myEmail]);

  useEffect(() => {
    if (!isAdmin || !myEmail) return;

    socketRef.current = io(getSocketURL());
    socketRef.current.emit("join", myEmail);

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => {
        return isConversationMessage(msg, myEmail, selectedUser)
          ? appendUnique(prev, msg)
          : prev;
      });

      loadContacts();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAdmin, loadContacts, myEmail, selectedUser]);

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
      const res = await sendMessage({
        to: selectedUser,
        text: composeText.trim(),
      });
      const savedMessage = res.data;

      setMessages((prev) => {
        return isConversationMessage(savedMessage, myEmail, selectedUser)
          ? appendUnique(prev, savedMessage)
          : prev;
      });

      setComposeText("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send message.");
    }
  }

  const activeContact = contacts.find((contact) => {
    return normalizeEmail(contact.email) === normalizeEmail(selectedUser);
  });

  if (!isAdmin) {
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
                  normalizeEmail(selectedUser) === normalizeEmail(contact.email)
                    ? styles.contactBtnActive
                    : ""
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
                  className={
                    normalizeEmail(msg.from) === normalizeEmail(selectedUser)
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
