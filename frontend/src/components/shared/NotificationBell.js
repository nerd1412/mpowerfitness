import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io as ioClient } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

const BellIcon = ({ animate }) => (
  <svg
    width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={animate ? { animation: 'bellRing 0.5s ease 2' } : {}}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const TYPE_ICON = {
  booking_confirmed: '✅',
  booking_cancelled: '❌',
  session_reminder:  '⏰',
  workout_assigned:  '💪',
  achievement_earned:'🏅',
  system:            '📣',
  payment_success:   '💳',
  new_client:        '👤',
  new_booking:       '📅',
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const SOCKET_URL = (process.env.REACT_APP_SOCKET_URL || '').replace(/\/api$/, '') || 'http://localhost:5000';

const NotificationBell = () => {
  const { user, role, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [ringBell, setRingBell]           = useState(false);
  const ref     = useRef(null);
  const socketRef = useRef(null);

  /* ── Fetch on mount ─────────────────────────────────────────── */
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  /* ── Socket.io real-time ────────────────────────────────────── */
  useEffect(() => {
    if (!user?.id || !accessToken) return;

    const socket = ioClient(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('authenticate', { userId: user.id, role });
    });

    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 50));
      setUnreadCount(c => c + 1);
      setRingBell(true);
      setTimeout(() => setRingBell(false), 1200);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, role, accessToken]);

  /* ── Close on outside click ─────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    } catch {}
  };

  const markOneRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`);
      setNotifications(n => n.map(x => x.id === notifId ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const handleOpen = () => {
    setOpen(o => !o);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{
          background: open ? 'var(--s2)' : 'none',
          border: 'none', cursor: 'pointer', position: 'relative',
          padding: '8px', borderRadius: 8, color: open ? 'var(--t1)' : 'var(--t2)',
          display: 'flex', alignItems: 'center', transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = 'var(--t2)'; }}
      >
        <BellIcon animate={ringBell} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 3, right: 3,
            background: 'var(--error)', color: '#fff',
            borderRadius: '50%', minWidth: 16, height: 16,
            fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--carbon)', padding: '0 2px',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, maxHeight: 480, overflowY: 'auto',
          background: 'var(--charcoal)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          zIndex: 300, animation: 'fadeIn 0.15s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '13px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', top: 0, background: 'var(--charcoal)', zIndex: 1,
            borderRadius: '14px 14px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'var(--error)', color: '#fff',
                  borderRadius: 6, padding: '1px 6px', fontSize: 11, fontWeight: 700,
                }}>{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--lime)', fontSize: 12, fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
              <p style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 500 }}>All caught up!</p>
              <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 30).map((n, i) => (
              <div
                key={n.id || n._id || i}
                onClick={() => {
                  if (!n.isRead) markOneRead(n.id || n._id);
                  if (n.actionUrl) { setOpen(false); navigate(n.actionUrl); }
                }}
                style={{
                  padding: '11px 16px',
                  borderBottom: i < Math.min(notifications.length, 30) - 1 ? '1px solid var(--border)' : 'none',
                  background: n.isRead ? 'transparent' : 'rgba(200,241,53,0.04)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  cursor: (n.isRead && !n.actionUrl) ? 'default' : 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!n.isRead || n.actionUrl) e.currentTarget.style.background = n.isRead ? 'var(--s1)' : 'rgba(200,241,53,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(200,241,53,0.04)'; }}
              >
                <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>
                  {TYPE_ICON[n.type] || '📣'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: n.isRead ? 400 : 700, fontSize: 13, marginBottom: 2,
                    color: 'var(--t1)',
                  }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                {!n.isRead && (
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--lime)', flexShrink: 0, marginTop: 5,
                  }}/>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Bell ring keyframe (injected once) */}
      <style>{`
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          20%      { transform: rotate(-15deg); }
          40%      { transform: rotate(15deg); }
          60%      { transform: rotate(-10deg); }
          80%      { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
