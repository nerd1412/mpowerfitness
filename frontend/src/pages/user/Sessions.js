import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import VideoCall from '../../components/shared/VideoCall';

const STATUS_COLOR = {
  confirmed: 'var(--success)',
  pending:   'var(--warning)',
  completed: 'var(--lime)',
  cancelled: 'var(--error)',
};

const STATUS_ICON = {
  confirmed: '✓',
  pending:   '⏳',
  completed: '🏅',
  cancelled: '✕',
};

const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-IN', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});

const fmtRelative = (d) => {
  const diff = Math.round((new Date(d + 'T12:00:00') - Date.now()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 0) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};

const isToday = (d) => new Date(d + 'T12:00:00').toDateString() === new Date().toDateString();
const isFuture = (d) => new Date(d + 'T23:59:59') > Date.now();
const isPast   = (d) => !isFuture(d);

/* ── Session card ─────────────────────────────────────────────── */
const SessionCard = ({ booking, onCancel, onJoinCall }) => {
  const today = isToday(booking.sessionDate);
  const future = isFuture(booking.sessionDate);
  const statusColor = STATUS_COLOR[booking.status] || 'var(--t3)';
  const isVideoSession = booking.sessionType === 'online_video';
  const canJoinCall = isVideoSession && booking.status === 'confirmed';

  return (
    <div style={{
      background: today ? 'rgba(200,241,53,0.04)' : 'var(--charcoal)',
      border: `1px solid ${today ? 'rgba(200,241,53,0.25)' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)',
      padding: '16px 20px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Date column */}
      <div style={{ textAlign: 'center', minWidth: 48, flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: today ? 'var(--lime)' : 'var(--t1)', lineHeight: 1 }}>
          {new Date(booking.sessionDate + 'T12:00:00').getDate()}
        </div>
        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {new Date(booking.sessionDate + 'T12:00:00').toLocaleString('en-IN', { month: 'short' })}
        </div>
      </div>

      <div style={{ width: 1, height: 48, background: 'var(--border)', flexShrink: 0, marginTop: 4 }}/>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            {booking.trainer?.name || 'Trainer Session'}
          </span>
          {today && (
            <span style={{ background: 'rgba(200,241,53,0.15)', color: 'var(--lime)',
              borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>TODAY</span>
          )}
          <span style={{
            background: `${statusColor}18`, color: statusColor,
            borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {STATUS_ICON[booking.status]} {booking.status}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 6 }}>
          {booking.startTime} – {booking.endTime}
          {' · '}
          <span style={{ textTransform: 'capitalize' }}>{booking.sessionType?.replace('_', ' ')}</span>
          {booking.paymentStatus === 'paid' && (
            <span style={{ marginLeft: 8, color: 'var(--success)', fontSize: 11 }}>· ₹ Paid</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--t3)' }}>
          {fmtRelative(booking.sessionDate)} · {fmtDate(booking.sessionDate)}
        </div>
        {booking.notes && (
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6, fontStyle: 'italic', lineHeight: 1.4 }}>
            "{booking.notes}"
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        {canJoinCall && (
          <button
            className="btn btn-sm"
            style={{ fontSize: 11, fontWeight: 700,
              background: 'rgba(200,241,53,0.15)', border: '1.5px solid rgba(200,241,53,0.4)',
              color: 'var(--lime)' }}
            onClick={() => onJoinCall(booking)}
          >
            📹 Join Call
          </button>
        )}
        {booking.trainer?.id && (
          <Link to="/user/chat" state={{ trainerId: booking.trainer.id }}
            className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
            💬 Message
          </Link>
        )}
        {future && booking.status === 'confirmed' && onCancel && (
          <button className="btn btn-sm" style={{ fontSize: 11, color: 'var(--error)',
            background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)' }}
            onClick={() => onCancel(booking.id)}>
            Cancel
          </button>
        )}
        {booking.status === 'completed' && !booking.rating && (
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>Rate session</span>
        )}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="skeleton" style={{ height: 96, borderRadius: 'var(--r-lg)' }}/>
);

/* ── Main component ─────────────────────────────────────────────── */
export default function UserSessions() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('upcoming');
  const [activeCall, setActiveCall] = useState(null); // { bookingId, displayName }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      if (data.success) setBookings(data.bookings || []);
    } catch { toast.error('Failed to load sessions'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Session cancelled');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to cancel'); }
  };

  /* Categorise */
  const today     = bookings.filter(b => isToday(b.sessionDate) && b.status !== 'cancelled');
  const upcoming  = bookings.filter(b => isFuture(b.sessionDate) && !isToday(b.sessionDate) && b.status !== 'cancelled');
  const completed = bookings.filter(b => isPast(b.sessionDate) || b.status === 'completed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const tabData = { upcoming: [...today, ...upcoming], completed, cancelled };
  const display = tabData[tab] || [];

  const TABS = [
    { key:'upcoming',  label:'Upcoming', count: today.length + upcoming.length },
    { key:'completed', label:'Completed', count: completed.length },
    { key:'cancelled', label:'Cancelled', count: cancelled.length },
  ];

  return (
    <>
    {activeCall && (
      <VideoCall
        bookingId={activeCall.bookingId}
        displayName={activeCall.displayName}
        onClose={() => setActiveCall(null)}
      />
    )}
    <div style={{ maxWidth: 860 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My <span className="accent">Sessions</span></h1>
          <p className="page-subtitle">Track your current, upcoming and completed training sessions</p>
        </div>
        <Link to="/user/trainers" className="btn btn-primary">+ Book Session</Link>
      </div>

      {/* Today highlight */}
      {today.length > 0 && (
        <div style={{ background:'rgba(200,241,53,0.07)', border:'1px solid rgba(200,241,53,0.2)',
          borderRadius:'var(--r-lg)', padding:'14px 18px', marginBottom:20,
          display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>🏋️</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--lime)' }}>Session Today</div>
            <div style={{ fontSize:13, color:'var(--t2)' }}>
              {today[0].startTime} with {today[0].trainer?.name || 'your trainer'}
              {today[0].sessionType && ` · ${today[0].sessionType.replace('_',' ')}`}
            </div>
          </div>
        </div>
      )}

      {/* Admin-assigned trainer note */}
      {user?.assignedTrainerId && (
        <div style={{ background:'rgba(78,159,255,0.06)', border:'1px solid rgba(78,159,255,0.15)',
          borderRadius:'var(--r-md)', padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--info)' }}>
          📌 You have a dedicated trainer assigned by admin. Use <Link to="/user/chat" style={{ color:'var(--info)', fontWeight:600 }}>Messages</Link> to connect.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding:'9px 16px', background:'none', border:'none', cursor:'pointer',
              fontSize:14, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? 'var(--t1)' : 'var(--t3)',
              borderBottom: tab === t.key ? '2px solid var(--lime)' : '2px solid transparent',
              marginBottom: -1, transition:'all .14s', fontFamily:'var(--font-body)',
              display:'flex', alignItems:'center', gap:6 }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ background: tab === t.key ? 'var(--lime)' : 'var(--s2)',
                color: tab === t.key ? '#000' : 'var(--t3)',
                borderRadius: 'var(--r-full)', padding:'1px 7px', fontSize:11, fontWeight:700 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Session list */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {Array(3).fill(0).map((_,i) => <SkeletonCard key={i}/>)}
        </div>
      ) : display.length === 0 ? (
        <div className="empty-state" style={{ padding:'50px 0' }}>
          <div className="empty-state-icon">
            {tab === 'upcoming' ? '📅' : tab === 'completed' ? '🏅' : '✕'}
          </div>
          <p className="empty-state-title">
            {tab === 'upcoming' ? 'No upcoming sessions' : tab === 'completed' ? 'No completed sessions yet' : 'No cancelled sessions'}
          </p>
          {tab === 'upcoming' && (
            <Link to="/user/trainers" className="btn btn-primary" style={{ marginTop:14 }}>
              Find a Trainer →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {display.map(b => (
            <SessionCard
              key={b.id}
              booking={b}
              onCancel={tab === 'upcoming' ? handleCancel : null}
              onJoinCall={(booking) => setActiveCall({ bookingId: booking.id, displayName: user?.name })}
            />
          ))}
        </div>
      )}
    </div>
    </>
  );
}
