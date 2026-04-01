import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { chatService } from '../../services/index';
import useSocket from '../../hooks/useSocket';

/* ── helpers ─────────────────────────────────────────── */
const fmtTime = (d) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return date.toLocaleDateString('en-IN', { weekday: 'short' });
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const Avatar = ({ name, size = 38, color = 'var(--lime)', bg = 'rgba(200,241,53,0.15)' }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
    {name?.[0]?.toUpperCase() || '?'}
  </div>
);

const EmptyState = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--t3)', padding: 40, textAlign: 'center' }}>
    <div style={{ fontSize: 48, opacity: 0.4 }}>{icon}</div>
    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--t2)' }}>{title}</div>
    {desc && <div style={{ fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>{desc}</div>}
  </div>
);

/* ── Conversation list item ──────────────────────────── */
const ConvoItem = ({ convo, active, onClick, currentUserId }) => {
  const other = (convo.participants || []).find(p => p.participantId !== currentUserId);
  const unread = (convo.unreadCounts || {})[currentUserId] || 0;
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: active ? 'rgba(200,241,53,0.07)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.15s', borderLeft: active ? '3px solid var(--lime)' : '3px solid transparent' }}>
      <Avatar name={other?.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: active ? 'var(--lime)' : 'var(--t1)' }}>{other?.name || 'Unknown'}</span>
          {convo.lastMessage && <span style={{ fontSize: 11, color: 'var(--t3)' }}>{fmtTime(convo.lastMessage.createdAt)}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            {convo.lastMessage?.content || 'No messages yet'}
          </span>
          {unread > 0 && (
            <span style={{ background: 'var(--lime)', color: '#060608', borderRadius: '50%', fontSize: 11, fontWeight: 800, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{unread}</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Message bubble ──────────────────────────────────── */
const Bubble = ({ msg, isMine }) => (
  <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
    <div style={{
      maxWidth: '72%', padding: '9px 13px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
      background: isMine ? 'var(--lime)' : 'var(--s2)',
      color: isMine ? '#060608' : 'var(--t1)',
      fontSize: 14, lineHeight: 1.5,
    }}>
      <div>{msg.content}</div>
      <div style={{ fontSize: 11, opacity: 0.65, marginTop: 3, textAlign: 'right' }}>{fmtTime(msg.createdAt)} {isMine && (msg.isRead ? '✓✓' : '✓')}</div>
    </div>
  </div>
);

/* ── Main Chat Component ─────────────────────────────── */
export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { socket } = useSocket();

  // Mobile responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const { data } = await chatService.getConversations();
      if (data.success) setConversations(data.conversations);
    } catch {
      toast.error('Could not load conversations');
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages when conversation selected
  const loadMessages = useCallback(async (convoId) => {
    if (!convoId) return;
    setLoadingMsgs(true);
    try {
      const { data } = await chatService.getMessages(convoId);
      if (data.success) setMessages(data.messages);
    } catch {
      toast.error('Could not load messages');
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (activeConvoId) {
      loadMessages(activeConvoId);
      // Reset unread count locally
      setConversations(c => c.map(cv =>
        cv.id === activeConvoId
          ? { ...cv, unreadCounts: { ...(cv.unreadCounts || {}), [user.id]: 0 } }
          : cv
      ));
    }
  }, [activeConvoId, loadMessages, user.id]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time incoming messages
  useEffect(() => {
    if (!socket?.on) return;
    const handler = ({ message, conversationId }) => {
      if (conversationId === activeConvoId) {
        setMessages(m => [...m, message]);
      }
      // Update conversation list
      setConversations(c => c.map(cv =>
        cv.id === conversationId
          ? {
              ...cv,
              lastMessage: message,
              unreadCounts: {
                ...(cv.unreadCounts || {}),
                [user.id]: conversationId === activeConvoId ? 0 : ((cv.unreadCounts || {})[user.id] || 0) + 1,
              },
            }
          : cv
      ));
    };
    socket.on('new_message', handler);
    return () => {
      if (socket.off) socket.off('new_message', handler);
      else if (socket.removeListener) socket.removeListener('new_message', handler);
    };
  }, [socket, activeConvoId, user.id]);

  const selectConvo = (convoId) => {
    setActiveConvoId(convoId);
    if (isMobile) setMobileView('chat');
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeConvoId || sending) return;
    setSending(true);
    setInput('');
    try {
      const { data } = await chatService.sendMessage({ conversationId: activeConvoId, content: text });
      if (data.success) {
        setMessages(m => [...m, data.message]);
        setConversations(c => c.map(cv =>
          cv.id === activeConvoId ? { ...cv, lastMessage: data.message } : cv
        ));
      }
    } catch {
      toast.error('Failed to send message');
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeConvo = conversations.find(c => c.id === activeConvoId);
  const otherParticipant = activeConvo
    ? (activeConvo.participants || []).find(p => p.participantId !== user.id)
    : null;

  const totalUnread = conversations.reduce((s, c) => s + ((c.unreadCounts || {})[user.id] || 0), 0);

  // Layout
  const showList = !isMobile || mobileView === 'list';
  const showChat = !isMobile || mobileView === 'chat';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', minHeight: 500, background: 'var(--s1)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>

      {/* ── Sidebar: Conversation list ─────────────── */}
      {showList && (
        <div style={{ width: isMobile ? '100%' : 300, borderRight: isMobile ? 'none' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Messages</div>
              {totalUnread > 0 && <div style={{ fontSize: 12, color: 'var(--lime)' }}>{totalUnread} unread</div>}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvos ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : conversations.length === 0 ? (
              <EmptyState icon="💬" title="No conversations yet" desc="Your trainer can start a conversation from their dashboard." />
            ) : (
              conversations.map(c => (
                <ConvoItem key={c.id} convo={c} active={c.id === activeConvoId} onClick={() => selectConvo(c.id)} currentUserId={user.id} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Main: Message area ────────────────────── */}
      {showChat && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s1)' }}>
            {isMobile && (
              <button onClick={() => setMobileView('list')} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: 20, padding: '0 8px 0 0' }}>←</button>
            )}
            {otherParticipant ? (
              <>
                <Avatar name={otherParticipant.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{otherParticipant.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                    Online
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--t3)', fontSize: 14 }}>Select a conversation</div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            {!activeConvoId ? (
              <EmptyState icon="💬" title="Select a conversation" desc="Choose a conversation from the list to start messaging." />
            ) : loadingMsgs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-lg" /></div>
            ) : messages.length === 0 ? (
              <EmptyState icon="👋" title="Start the conversation" desc="Send a message to get started." />
            ) : (
              <>
                {messages.map(msg => (
                  <Bubble key={msg.id} msg={msg} isMine={msg.senderId === user.id} />
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          {activeConvoId && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--s1)' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                style={{ flex: 1, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', color: 'var(--t1)', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'var(--font-body)', maxHeight: 120, lineHeight: 1.5, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--lime)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="btn btn-primary"
                style={{ flexShrink: 0, padding: '10px 16px' }}>
                {sending ? '…' : '↑'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
