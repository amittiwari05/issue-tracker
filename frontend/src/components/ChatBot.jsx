import { useState, useRef, useEffect } from "react";
import { X, Send, RotateCcw } from "lucide-react";

/* ─────────────────────────────────────────────
   Call our own backend → POST /chat
   API key stays safe on the server
   ───────────────────────────────────────────── */
const callChat = async (messages) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Server error");
  }

  return data.reply;
};

/* ─────────────────────────────────────────────
   Quick-reply suggestion chips
   ───────────────────────────────────────────── */
const SUGGESTIONS = [
  "How do I report an issue?",
  "How to contact authorities?",
  "How does voting work?",
  "I can't upload my photo",
  "What categories are available?",
  "How to track my issue?",
];

/* ─────────────────────────────────────────────
   Single message bubble
   ───────────────────────────────────────────── */
const Bubble = ({ msg }) => {
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex gap-2 mb-3 ${isBot ? "items-start" : "items-end flex-row-reverse"}`}>
      {isBot && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm"
          style={{ background: "var(--saffron)", color: "var(--bg-base)" }}
        >
          🪔
        </div>
      )}
      <div
        className="max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed"
        style={{
          background:   isBot ? "var(--bg-elevated)" : "var(--saffron)",
          color:        isBot ? "var(--text-primary)"  : "var(--bg-base)",
          borderRadius: isBot ? "4px 16px 16px 16px"   : "16px 4px 16px 16px",
          border:       isBot ? "1px solid var(--border-subtle)" : "none",
          boxShadow:    isBot ? "var(--shadow-sm)" : "0 2px 8px rgba(232,101,10,0.3)",
          whiteSpace: "pre-wrap",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Typing indicator (three bouncing dots)
   ───────────────────────────────────────────── */
const TypingDots = () => (
  <div className="flex gap-2 mb-3 items-start">
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm"
      style={{ background: "var(--saffron)", color: "var(--bg-base)" }}
    >
      🪔
    </div>
    <div
      className="flex items-center gap-1 px-4 py-3"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "4px 16px 16px 16px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "var(--saffron)",
            animation: "chatDot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN CHATBOT COMPONENT
   ═══════════════════════════════════════════════ */
const GREETING = {
  role: "assistant",
  content:
    "नमस्ते! 🙏 I'm Seva Bot, your Issue Tracker help assistant.\n\nI can help you report civic issues, track their status, understand how to connect with authorities, and navigate the platform. What can I help you with today?",
};

const ChatBot = () => {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState([GREETING]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [unread,   setUnread]   = useState(false);
  const [pulse,    setPulse]    = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const hasOpened = useRef(false);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on open; clear unread
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setUnread(false);
      if (!hasOpened.current) {
        hasOpened.current = true;
        setPulse(false);
      }
    }
  }, [open]);

  // Stop pulse tooltip after 7s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 7000);
    return () => clearTimeout(t);
  }, []);

  /* ── Send a message ── */
  const sendMessage = async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setInput("");
    setError("");

    const userMsg  = { role: "user",      content: userText };
    const updated  = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      // Build the API messages array:
      // Skip the initial greeting (index 0) — it's UI-only, not part of the conversation
      const apiMessages = updated
        .slice(messages[0] === GREETING ? 1 : 0)
        .map(({ role, content }) => ({ role, content }));

      const reply = await callChat(apiMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!open) setUnread(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([GREETING]);
    setInput("");
    setError("");
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <>
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes chatPulse {
          0%   { box-shadow: 0 0 0 0    rgba(232,101,10,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(232,101,10,0);    }
          100% { box-shadow: 0 0 0 0    rgba(232,101,10,0);    }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .chat-window { animation: chatSlideUp 0.28s cubic-bezier(0.4,0,0.2,1) both; }
        .fab-pulse   { animation: chatPulse 1.8s ease-out 3; }
      `}</style>

      {/* ══════════════════════════════════════
          CHAT WINDOW
          ══════════════════════════════════════ */}
      {open && (
        <div
          className="chat-window fixed z-[9999] flex flex-col overflow-hidden"
          style={{
            bottom: "88px",
            right:  "20px",
            width:  "340px",
            height: "520px",
            maxHeight: "calc(100vh - 110px)",
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border-medium)",
            borderRadius: "20px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(232,101,10,0.12)",
          }}
        >
          {/* Tricolor bar */}
          <div
            className="h-1 w-full shrink-0"
            style={{ background: "linear-gradient(90deg,#FF9933 0% 33.33%,#FFFFFF 33.33% 66.66%,#138808 66.66% 100%)" }}
          />

          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg relative"
                style={{ background: "var(--saffron)", boxShadow: "0 2px 8px rgba(232,101,10,0.35)" }}
              >
                🪔
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: "var(--status-done)", borderColor: "var(--bg-card)" }}
                />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                  Seva Bot
                </p>
                <p className="text-xs" style={{ color: "var(--status-done)" }}>● Online — सेवा में हाज़िर</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg"
                style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--saffron-lt)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg"
                style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--crimson-lt)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto px-3.5 py-4 custom-scrollbar"
            style={{ background: "var(--bg-base)" }}
          >
            {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
            {loading && <TypingDots />}

            {/* Inline error */}
            {error && !loading && (
              <div
                className="text-xs px-3 py-2 rounded-xl mb-2"
                style={{ background: "var(--crimson-dim)", color: "var(--crimson-lt)", border: "1px solid var(--crimson)" }}
              >
                ⚠ {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — only on fresh chat */}
          {showSuggestions && (
            <div
              className="px-3 py-2 flex flex-wrap gap-1.5 shrink-0"
              style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1.5 rounded-full font-medium"
                  style={{
                    background: "var(--saffron-dim)",
                    color:      "var(--saffron-lt)",
                    border:     "1px solid var(--border-medium)",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--saffron)"; e.currentTarget.style.color = "var(--bg-base)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--saffron-dim)"; e.currentTarget.style.color = "var(--saffron-lt)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div
            className="flex items-end gap-2 px-3 py-3 shrink-0"
            style={{
              background:  "var(--bg-card)",
              borderTop:   showSuggestions ? "none" : "1px solid var(--border-subtle)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a question… (Enter to send)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm focus:outline-none custom-scrollbar"
              style={{
                background:  "var(--bg-elevated)",
                border:      "1px solid var(--border-medium)",
                color:       "var(--text-primary)",
                maxHeight:   "80px",
                lineHeight:  "1.5",
                fontFamily:  "var(--font-body)",
                transition:  "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--saffron)"}
              onBlur={e  => e.target.style.borderColor = "var(--border-medium)"}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: input.trim() && !loading ? "var(--saffron)"   : "var(--bg-elevated)",
                color:      input.trim() && !loading ? "var(--bg-base)"    : "var(--text-muted)",
                border:     "1px solid var(--border-medium)",
                cursor:     input.trim() && !loading ? "pointer"           : "not-allowed",
                boxShadow:  input.trim() && !loading ? "0 2px 8px rgba(232,101,10,0.3)" : "none",
                transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
              }}
            >
              <Send size={15} />
            </button>
          </div>

          {/* Footer */}
          <div
            className="text-center py-1.5 text-xs shrink-0"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", borderTop: "1px solid var(--border-subtle)" }}
          >
            Powered by AI &nbsp;•&nbsp; Emergencies: <strong style={{ color: "var(--crimson-lt)" }}>112</strong>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          FAB (floating action button)
          ══════════════════════════════════════ */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed z-[9999] flex items-center justify-center rounded-full ${pulse && !open ? "fab-pulse" : ""}`}
        style={{
          bottom: "20px",
          right:  "20px",
          width:  "58px",
          height: "58px",
          background: open ? "var(--bg-elevated)" : "var(--saffron)",
          border: "2px solid var(--border-medium)",
          boxShadow: open
            ? "var(--shadow-md)"
            : "0 4px 20px rgba(232,101,10,0.45), 0 2px 8px rgba(0,0,0,0.2)",
          color:      open ? "var(--text-primary)" : "var(--bg-base)",
          transition: "background 0.25s, box-shadow 0.25s, transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        aria-label={open ? "Close help desk" : "Open Seva Bot help desk"}
        title={open ? "Close help desk" : "Seva Bot — Help Desk"}
      >
        {open
          ? <X size={22} />
          : <span style={{ fontSize: "26px", lineHeight: 1 }}>🪔</span>
        }

        {/* Unread dot */}
        {unread && !open && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--crimson)", color: "white", border: "2px solid var(--bg-base)" }}
          >
            1
          </div>
        )}
      </button>

      {/* Tooltip — shown for 7s on first load */}
      {pulse && !open && (
        <div
          className="fixed z-[9998] pointer-events-none"
          style={{
            bottom:     "28px",
            right:      "88px",
            background: "var(--bg-card)",
            border:     "1px solid var(--border-medium)",
            color:      "var(--text-primary)",
            padding:    "6px 12px",
            borderRadius: "10px",
            fontSize:   "12px",
            fontWeight: 600,
            boxShadow:  "var(--shadow-sm)",
            whiteSpace: "nowrap",
            animation:  "chatSlideUp 0.3s ease both",
          }}
        >
          💬 Need help? Ask Seva Bot!
          {/* Arrow */}
          <div
            className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
            style={{
              background:   "var(--bg-card)",
              borderRight:  "1px solid var(--border-medium)",
              borderTop:    "1px solid var(--border-medium)",
            }}
          />
        </div>
      )}
    </>
  );
};

export default ChatBot;