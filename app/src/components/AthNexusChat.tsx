import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────
// Rule-based response engine
// ─────────────────────────────────────────────────────────────
const RESPONSES: Record<string, string> = {
  register:
    "To register for an event, go to the Events page, find your event and click 'Register Now'. Fill in the registration form and submit. Your registration will be reviewed by a Verifier before confirmation.",
  status:
    "Check your registration status in My Events → My Registrations tab. Status can be: ⏳ Pending, ✅ Confirmed, or ❌ Rejected.",
  live:
    "Live events are shown at the top of the Events page with a pulsing red LIVE badge. You can also filter by level, type, and format.",
  approval:
    "After you register, a Verifier reviews your form. If approved, you'll receive a confirmation email. If rejected, you'll get an email with the reason.",
  create:
    "Athletes can create events from the Events page using the '+ Create Event' button. Your event goes to a Verifier for approval before it appears publicly.",
  deadline:
    "Events with deadlines within 72 hours show a 'CLOSING SOON' badge. Check the Deadline Nearby section on the Events page.",
  profile:
    "Your profile shows your sport, performance stats, and talent score. Go to Overview from the sidebar to see your full profile.",
  email:
    "You'll receive email notifications for: registration confirmation, event reminders, and result announcements from the AthNexus Verifier team.",
  verifier:
    "Verifiers manage event approvals, registration approvals, and send email alerts to athletes. They ensure all submissions meet platform standards.",
  default:
    "I'm not sure about that. Try asking about: registrations, events, approvals, deadlines, or your profile. I'm happy to help!",
};

function getBotResponse(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('register') || m.includes('how to') || m.includes('sign up'))
    return RESPONSES.register;
  if (m.includes('status') || m.includes('pending') || m.includes('approved'))
    return RESPONSES.status;
  if (m.includes('live') || m.includes('happening') || m.includes('now'))
    return RESPONSES.live;
  if (m.includes('approval') || m.includes('review') || m.includes('verifier'))
    return RESPONSES.approval;
  if (m.includes('create') || m.includes('add event') || m.includes('suggest'))
    return RESPONSES.create;
  if (m.includes('deadline') || m.includes('closing') || m.includes('expire'))
    return RESPONSES.deadline;
  if (m.includes('profile') || m.includes('analytics') || m.includes('score'))
    return RESPONSES.profile;
  if (m.includes('email') || m.includes('notification') || m.includes('alert'))
    return RESPONSES.email;
  if (m.includes('verif'))
    return RESPONSES.verifier;
  return RESPONSES.default;
}

const QUICK_QUESTIONS = [
  'How to register for an event?',
  'Check my registration status',
  'What events are live now?',
  'How does approval work?',
];

// ─────────────────────────────────────────────────────────────
// Inline styles for pulse animation (avoids any CSS file edits)
// ─────────────────────────────────────────────────────────────
const pulseKeyframes = `
@keyframes chatPulse {
  0%   { box-shadow: 0 0 0 0 rgba(168, 230, 61, 0.5); }
  70%  { box-shadow: 0 0 0 10px rgba(168, 230, 61, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 230, 61, 0); }
}
.chat-pulse { animation: chatPulse 2s ease-out infinite; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
.chat-slide-up { animation: slideUp 0.22s ease-out both; }
`;

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export function AthNexusChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "👋 Hi! I'm your AthNexus assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.filter(m => m.id !== 'welcome')
        })
      });
      const data = await response.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || getBotResponse(trimmed),
        sender: 'bot',
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to my central brain. " + getBotResponse(trimmed),
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage(input);
  };

  return (
    <>
      {/* Inject keyframe styles once */}
      <style>{pulseKeyframes}</style>

      {/* ── Floating Button ── */}
      <button
        id="athnexus-chat-btn"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open AthNexus Assistant'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#a8e63d',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(168,230,61,0.35)',
          transition: 'transform 0.18s ease, background 0.18s ease',
        }}
        className={isOpen ? '' : 'chat-pulse'}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen
          ? <X size={22} color="#0d1520" strokeWidth={2.5} />
          : <MessageCircle size={22} color="#0d1520" strokeWidth={2.5} />
        }
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          id="athnexus-chat-panel"
          className="chat-slide-up"
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            zIndex: 9998,
            width: 320,
            height: 420,
            background: '#111a28',
            border: '1px solid #1e2e40',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#0d1520',
            borderBottom: '1px solid #1e2e40',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#a8e63d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <MessageCircle size={15} color="#0d1520" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e0eaf5', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
                🤖 AthNexus Assistant
              </div>
              <div style={{ color: '#5a8aaa', fontSize: 10, marginTop: 2 }}>
                Ask me about events, registrations, or your profile
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#5a8aaa', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center',
              }}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 12px 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '82%',
                  padding: '9px 12px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.sender === 'user' ? '#a8e63d' : '#1e2e40',
                  color: msg.sender === 'user' ? '#0d1520' : '#e0eaf5',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  fontWeight: msg.sender === 'user' ? 600 : 400,
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                  <div style={{
                    fontSize: 9,
                    marginTop: 4,
                    color: msg.sender === 'user' ? 'rgba(13,21,32,0.5)' : '#3a5a7a',
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  background: '#1e2e40',
                  borderRadius: '14px 14px 14px 4px',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#5a8aaa',
                      animation: `chatPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick questions — show only after welcome message with no further conversation */}
            {messages.length === 1 && !isTyping && (
              <div style={{ marginTop: 4 }}>
                <div style={{ color: '#3a5a7a', fontSize: 10, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Quick Questions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: '#1e2e40',
                        border: '1px solid #2a3e52',
                        borderRadius: 20,
                        color: '#8aaabf',
                        fontSize: 11.5,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s, color 0.15s',
                        fontWeight: 500,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#2a3e52';
                        e.currentTarget.style.color = '#e0eaf5';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#1e2e40';
                        e.currentTarget.style.color = '#8aaabf';
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Row */}
          <div style={{
            borderTop: '1px solid #1e2e40',
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            background: '#0d1520',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{
                flex: 1,
                background: '#1e2e40',
                border: '1px solid #2a3e52',
                borderRadius: 10,
                color: '#e0eaf5',
                fontSize: 12.5,
                padding: '8px 12px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#a8e63d')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2a3e52')}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: input.trim() ? '#a8e63d' : '#1e2e40',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              aria-label="Send message"
            >
              <Send size={15} color={input.trim() ? '#0d1520' : '#3a5a7a'} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AthNexusChat;
