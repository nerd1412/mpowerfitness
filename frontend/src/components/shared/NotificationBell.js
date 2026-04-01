import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data.success) { setNotifications(data.notifications || []); setUnreadCount(data.unreadCount || 0); }
    } catch {}
  };

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all'); setUnreadCount(0); setNotifications(n => n.map(x => ({...x, isRead:true}))); } catch {}
  };

  const typeIcon = { booking_confirmed:'✅', booking_cancelled:'❌', session_reminder:'⏰', workout_assigned:'💪', achievement_earned:'🏅', system:'📣', payment_success:'💳', new_client:'👤' };
  const timeAgo = (d) => { const s = Math.floor((Date.now() - new Date(d))/1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

  return (
    <div style={{ position:'relative' }} ref={ref}>
      <button onClick={() => setOpen(o => !o)} style={{
        background:'none', border:'none', cursor:'pointer', position:'relative',
        padding:'8px', borderRadius:8, color:'var(--text-secondary)',
        display:'flex', alignItems:'center', transition:'color 0.15s'
      }}
        onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}
      >
        <BellIcon/>
        {unreadCount > 0 && (
          <span style={{
            position:'absolute', top:3, right:3,
            background:'var(--error)', color:'#fff',
            borderRadius:'50%', width:15, height:15,
            fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
            border:'2px solid var(--carbon)'
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 8px)', right:0,
          width:320, maxHeight:440, overflowY:'auto',
          background:'var(--charcoal)', border:'1px solid var(--border)',
          borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
          zIndex:200, animation:'fadeIn 0.18s ease'
        }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:600, fontSize:14 }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--neon-lime)', fontSize:12, fontFamily:'var(--font-body)' }}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding:'32px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No notifications</div>
          ) : notifications.slice(0,15).map((n, i) => (
            <div key={n._id || i} style={{
              padding:'11px 16px', borderBottom:'1px solid var(--border)',
              background: n.isRead ? 'none' : 'rgba(200,241,53,0.03)',
              display:'flex', gap:10, alignItems:'flex-start',
              transition:'background 0.15s', cursor:'default'
            }}>
              <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{typeIcon[n.type] || '📣'}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize:13, marginBottom:2 }}>{n.title}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.4 }}>{n.message}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{timeAgo(n.createdAt)}</div>
              </div>
              {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--neon-lime)', flexShrink:0, marginTop:4 }}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
