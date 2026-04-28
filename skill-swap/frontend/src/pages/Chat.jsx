// src/pages/Chat.jsx — PHASE 7: Real-time chat with Socket.io
import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Avatar, LoadingPage } from "../components/Navbar";

export default function Chat() {
  const { user } = useAuth();
  const { sendMessage, onMessage, onMessageSent, emitTyping, onTyping, isOnline } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load contacts from accepted swaps
  useEffect(() => {
    api.get("/swaps").then((res) => {
      const sent = res.data.sent.filter((s) => s.status === "accepted").map((s) => s.to);
      const received = res.data.received.filter((s) => s.status === "accepted").map((s) => s.from);
      // Deduplicate
      const seen = new Set();
      const all = [...sent, ...received].filter((u) => { if (!u || seen.has(u._id)) return false; seen.add(u._id); return true; });
      setContacts(all);
      if (all.length > 0) setActiveUser(all[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Load messages when active user changes
  useEffect(() => {
    if (!activeUser) return;
    api.get(`/messages/${activeUser._id}`)
      .then((res) => setMessages(res.data.messages))
      .catch(console.error);
  }, [activeUser]);

  // Socket listeners
  useEffect(() => {
    const offMsg = onMessage((msg) => {
      if (msg.sender._id === activeUser?._id || msg.sender === activeUser?._id) {
        setMessages((m) => [...m, msg]);
        setIsTyping(false);
      }
    });
    const offSent = onMessageSent((msg) => {
      setMessages((m) => [...m, msg]);
    });
    const offTyping = onTyping(({ senderId }) => {
      if (senderId === activeUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });
    return () => { offMsg?.(); offSent?.(); offTyping?.(); };
  }, [activeUser, onMessage, onMessageSent, onTyping]);

  // Scroll to bottom on new messages
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const handleSend = () => {
    if (!text.trim() || !activeUser) return;
    sendMessage({ senderId: user.id, receiverId: activeUser._id, text: text.trim() });
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    emitTyping(activeUser?._id, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(activeUser?._id, false), 1500);
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (loading) return <LoadingPage />;

  return (
    <div className="chat-layout" style={{ height: `calc(100vh - 64px)` }}>
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">💬 Messages</div>
        {contacts.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            Accept a swap request to start chatting!
          </div>
        ) : contacts.map((c) => (
          <div key={c._id} className={`chat-user-item ${activeUser?._id === c._id ? "active" : ""}`} onClick={() => setActiveUser(c)}>
            <div style={{ position: "relative" }}>
              <Avatar name={c.name} size="sm" />
              {isOnline(c._id) && <span className="online-dot" style={{ position: "absolute", bottom: 0, right: 0, border: "2px solid var(--bg-card)" }} />}
            </div>
            <div>
              <div className="chat-user-name">{c.name}</div>
              <div className="chat-user-preview">{isOnline(c._id) ? "● Online" : "Offline"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main chat */}
      {activeUser ? (
        <div className="chat-main">
          <div className="chat-header">
            <div style={{ position: "relative" }}>
              <Avatar name={activeUser.name} size="sm" />
              {isOnline(activeUser._id) && <span className="online-dot" style={{ position: "absolute", bottom: 0, right: 0, border: "2px solid var(--bg-card)" }} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{activeUser.name}</div>
              <div style={{ fontSize: 12, color: isOnline(activeUser._id) ? "var(--success)" : "var(--text-muted)" }}>
                {isOnline(activeUser._id) ? "● Online" : "Offline"}
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, marginTop: 40 }}>
                Start the conversation with {activeUser.name}!
              </div>
            )}
            {messages.map((msg) => {
              const mine = (msg.sender?._id || msg.sender) === user.id;
              return (
                <div key={msg._id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                  <div className={`chat-bubble ${mine ? "chat-bubble-mine" : "chat-bubble-other"}`}>
                    {msg.text}
                    <div className="chat-bubble-time">{fmtTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            {isTyping && <div className="typing-indicator">{activeUser.name} is typing…</div>}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <input className="chat-input" value={text} onChange={handleTyping} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} placeholder={`Message ${activeUser.name}…`} />
            <button className="btn btn-primary" onClick={handleSend} disabled={!text.trim()}>Send</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 15 }}>
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
}
