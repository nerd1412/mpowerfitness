import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import UpiPaymentModal from '../../components/shared/UpiPaymentModal';

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

const SESSION_TYPES = [
  ['online_video',    '💻', 'Online Video'],
  ['trainer_at_home', '🏠', 'At My Home'],
  ['mpower_gym',      '🏋️', 'MPower Gym'],
  ['partner_gym',     '🤝', 'My Gym'],
  ['self_guided',     '📱', 'Self-Guided'],
];

export default function UserTrainers() {
  const { user } = useAuthStore();
  const [trainer, setTrainer] = useState(null);
  const [avail, setAvail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookDate, setBookDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('online_video');
  const [notes, setNotes] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);

  const assignedId = user?.assignedTrainerId;

  /* ── Load assigned trainer ── */
  useEffect(() => {
    if (!assignedId) { setLoading(false); return; }
    api.get(`/trainers/${assignedId}`)
      .then(({ data }) => { if (data.success || data.trainer) setTrainer(data.trainer || data); })
      .catch(() => {
        // fallback: fetch all and find the assigned one
        api.get('/trainers').then(({ data }) => {
          if (data.success) {
            const found = (data.trainers || []).find(t => (t.id || t._id) === assignedId);
            setTrainer(found || null);
          }
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [assignedId]);

  /* ── Load availability ── */
  useEffect(() => {
    if (!trainer) return;
    const tid = trainer.id || trainer._id;
    api.get(`/bookings/trainer/${tid}/availability`)
      .then(({ data }) => { if (data.success) setAvail(data.availability); })
      .catch(() => {});
  }, [trainer]);

  /* ── Load booked slots for selected date ── */
  useEffect(() => {
    if (!trainer || !bookDate) { setBookedSlots([]); setSelectedSlot(null); return; }
    const tid = trainer.id || trainer._id;
    api.get(`/bookings/trainer/${tid}/availability?date=${bookDate}`)
      .then(({ data }) => { if (data.success) setBookedSlots(data.bookedSlots || []); })
      .catch(() => {});
    setSelectedSlot(null);
  }, [bookDate, trainer]);

  const getSlotsForDate = () => {
    if (!bookDate || !avail) return [];
    const dayName = DAYS[new Date(bookDate + 'T12:00:00').getDay()];
    const dayAvail = avail.find(a => a.day === dayName);
    if (!dayAvail?.slots?.length) return [];
    return dayAvail.slots.filter(s => !bookedSlots.some(b => b.startTime === s.startTime));
  };

  const handleBook = () => {
    if (!selectedSlot || !bookDate) return toast.error('Select a date and time slot');
    const tid = trainer.id || trainer._id;
    setPendingBooking({ trainerId: tid, sessionDate: bookDate, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, sessionType, notes });
    setPaymentModal({ amount: trainer.sessionRate || 500, type:'session_booking', description:`Session with ${trainer.name} on ${bookDate} at ${selectedSlot.startTime}` });
  };

  const handlePaymentSuccess = async () => {
    if (!pendingBooking) return;
    try {
      const { data } = await api.post('/bookings', pendingBooking);
      if (data.success) {
        toast.success('Session booked! 🎉');
        setPaymentModal(null); setPendingBooking(null);
        setBookDate(''); setSelectedSlot(null);
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Booking failed'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const slotsForDate = getSlotsForDate();
  const hasAvail = avail?.some(a => (a.slots || []).length > 0);

  /* ── No trainer assigned ── */
  if (!loading && !assignedId) {
    return (
      <div style={{ maxWidth:640, margin:'0 auto', padding:'40px 24px', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🏋️</div>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:10 }}>Your Trainer Will Be Assigned</h2>
        <p style={{ color:'var(--text-secondary)', lineHeight:1.7, marginBottom:24, fontSize:15 }}>
          At MPower Fitness, we don't let you pick a random trainer. Our team personally reviews your
          health conditions, goals, and preferences to match you with the <strong style={{ color:'var(--neon-lime)' }}>right certified expert</strong>.
          This ensures your plan is safe, science-backed, and designed for your specific needs.
        </p>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14,
          padding:'24px', marginBottom:24, textAlign:'left' }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--text-muted)',
            textTransform:'uppercase', letterSpacing:'0.07em' }}>
            How trainer assignment works
          </div>
          {[
            ['1', 'You submit a free consultation request', 'Our team reviews your health conditions and goals'],
            ['2', 'Admin matches you with the right expert', 'Considering specialisation, location & your delivery preference'],
            ['3', 'Trainer assigned — you get notified', 'Then book sessions directly here in My Trainer'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display:'flex', gap:12, marginBottom:14, alignItems:'flex-start' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(200,241,53,0.15)',
                color:'var(--neon-lime)', fontWeight:800, fontSize:13, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center' }}>{num}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{title}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/user/dashboard" className="btn btn-primary">
            🎯 Request Free Consultation
          </Link>
          <Link to="/user/sessions" className="btn btn-ghost">View My Sessions</Link>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
        <div className="spinner spinner-lg"/>
      </div>
    );
  }

  /* ── Trainer assigned but not found (edge case) ── */
  if (!trainer) {
    return (
      <div style={{ maxWidth:480, margin:'40px auto', textAlign:'center', padding:24 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <h3 style={{ marginBottom:8 }}>Trainer details unavailable</h3>
        <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
          Your trainer is assigned but their profile couldn't be loaded. Please contact admin or try refreshing.
        </p>
      </div>
    );
  }

  /* ── Assigned trainer view ── */
  return (
    <div style={{ maxWidth:960 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, marginBottom:4 }}>
          My <span style={{ color:'var(--lime)' }}>Trainer</span>
        </h1>
        <p style={{ color:'var(--t2)', fontSize:13 }}>
          Personally assigned by MPower admin based on your health profile & goals
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,340px)', gap:16, alignItems:'start' }}>

        {/* Trainer profile card */}
        <div>
          <div className="card" style={{ borderColor:'rgba(200,241,53,0.25)', marginBottom:16 }}>
            {/* Header */}
            <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,95,31,0.12)',
                color:'var(--orange)', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:28, fontWeight:700, flexShrink:0 }}>
                {trainer.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>{trainer.name}</div>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:13, color:'var(--t2)' }}>
                  <span>⭐ {(trainer.rating || 0).toFixed(1)} rating</span>
                  <span>🏅 {trainer.experience || 0} yrs experience</span>
                  <span>👥 {trainer.totalSessions || 0} sessions</span>
                </div>
                {(trainer.city || trainer.state) && (
                  <div style={{ fontSize:12, color:'var(--t3)', marginTop:4 }}>
                    📍 {[trainer.city, trainer.state].filter(Boolean).join(', ')}
                    {trainer.isOnline && <span style={{ marginLeft:8, color:'var(--success)' }}>🌐 Online</span>}
                  </div>
                )}
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontWeight:800, fontSize:22, color:'var(--lime)' }}>₹{trainer.sessionRate || '—'}</div>
                <div style={{ fontSize:11, color:'var(--t3)' }}>per session</div>
              </div>
            </div>

            {/* Assigned badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px',
              background:'rgba(200,241,53,0.08)', border:'1px solid rgba(200,241,53,0.25)',
              borderRadius:20, marginBottom:14, fontSize:12, fontWeight:600, color:'var(--neon-lime)' }}>
              ✓ Assigned by MPower Admin · tailored for your health profile
            </div>

            {/* Specialisations */}
            {(trainer.specializations || []).length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase',
                  letterSpacing:'0.07em', fontWeight:700, marginBottom:8 }}>Specialisations</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {trainer.specializations.map(s => (
                    <span key={s} className="badge badge-neutral" style={{ textTransform:'capitalize', fontSize:12 }}>
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {trainer.bio && (
              <div>
                <div style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase',
                  letterSpacing:'0.07em', fontWeight:700, marginBottom:8 }}>About</div>
                <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.6, margin:0 }}>{trainer.bio}</p>
              </div>
            )}

            {/* Certifications */}
            {(trainer.certifications || []).length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, color:'var(--t3)', textTransform:'uppercase',
                  letterSpacing:'0.07em', fontWeight:700, marginBottom:8 }}>Certifications</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {trainer.certifications.map((c, i) => (
                    <span key={i} style={{ fontSize:12, background:'var(--surface-2)',
                      color:'var(--text-secondary)', border:'1px solid var(--border)',
                      borderRadius:6, padding:'3px 10px' }}>🏅 {c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message link */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:12, padding:'16px 18px', display:'flex',
            justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:14 }}>💬 Message {trainer.name?.split(' ')[0]}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>
                Ask questions, share progress, discuss your plan
              </div>
            </div>
            <Link to="/user/chat" className="btn btn-ghost btn-sm">Open Chat →</Link>
          </div>
        </div>

        {/* Booking panel */}
        <div className="card" style={{ position:'sticky', top:20 }}>
          <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:2 }}>Book a Session</div>
            <div style={{ fontSize:13, color:'var(--t2)' }}>₹{trainer.sessionRate || '—'} per session</div>
          </div>

          {/* Session type */}
          <div className="form-group" style={{ marginBottom:14 }}>
            <label className="form-label">Session Type</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:6 }}>
              {SESSION_TYPES.map(([val, icon, lbl]) => (
                <button key={val} type="button" onClick={() => setSessionType(val)} style={{
                  padding:'8px 12px', borderRadius:'var(--r-md)', cursor:'pointer', transition:'all .14s',
                  display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontFamily:'var(--font-body)',
                  fontWeight: sessionType === val ? 700 : 500,
                  border: `1.5px solid ${sessionType === val ? 'var(--lime)' : 'var(--border)'}`,
                  background: sessionType === val ? 'rgba(200,241,53,.08)' : 'var(--s2)',
                  color: sessionType === val ? 'var(--lime)' : 'var(--t2)',
                }}>
                  <span>{icon}</span>{lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group" style={{ marginBottom:14 }}>
            <label className="form-label">Select Date</label>
            <input type="date" className="form-input" value={bookDate}
              min={today} max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
              onChange={e => setBookDate(e.target.value)}/>
          </div>

          {/* Availability warnings */}
          {bookDate && !hasAvail && (
            <div style={{ padding:'10px 12px', background:'rgba(255,176,32,.06)',
              border:'1px solid rgba(255,176,32,.15)', borderRadius:'var(--r-md)',
              fontSize:13, color:'var(--warning)', marginBottom:14 }}>
              ⚠️ Trainer hasn't set availability yet. Contact them via chat.
            </div>
          )}
          {bookDate && hasAvail && slotsForDate.length === 0 && (
            <div style={{ padding:'10px 12px', background:'var(--s2)', borderRadius:'var(--r-md)',
              fontSize:13, color:'var(--t3)', marginBottom:14 }}>
              No available slots on this date
            </div>
          )}

          {/* Time slots */}
          {slotsForDate.length > 0 && (
            <div className="form-group" style={{ marginBottom:14 }}>
              <label className="form-label">Time Slot</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))', gap:6, marginTop:6 }}>
                {slotsForDate.map((s, si) => (
                  <button key={si} type="button" onClick={() => setSelectedSlot(s)} style={{
                    padding:'8px 4px', borderRadius:'var(--r-sm)', cursor:'pointer', transition:'all .12s',
                    fontFamily:'var(--font-body)', fontSize:13,
                    border: `1.5px solid ${selectedSlot?.startTime === s.startTime ? 'var(--lime)' : 'var(--border)'}`,
                    background: selectedSlot?.startTime === s.startTime ? 'rgba(200,241,53,.1)' : 'var(--s2)',
                    fontWeight: selectedSlot?.startTime === s.startTime ? 700 : 400,
                    color: selectedSlot?.startTime === s.startTime ? 'var(--lime)' : 'var(--t1)',
                  }}>
                    {s.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-input" rows={2}
              placeholder="Goals, health notes, or anything for your trainer…"
              value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight:60 }}/>
          </div>

          {/* Summary */}
          {selectedSlot && bookDate && (
            <div style={{ background:'rgba(200,241,53,.05)', border:'1px solid rgba(200,241,53,.12)',
              borderRadius:'var(--r-md)', padding:'10px 14px', marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span style={{ color:'var(--t2)' }}>Date</span>
                <span style={{ fontWeight:600 }}>{new Date(bookDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ color:'var(--t2)' }}>Time</span>
                <span style={{ fontWeight:600 }}>{selectedSlot.startTime} – {selectedSlot.endTime}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                <span style={{ color:'var(--t2)' }}>Total</span>
                <span style={{ fontWeight:800, color:'var(--lime)', fontSize:16 }}>₹{trainer.sessionRate}</span>
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-full" disabled={!selectedSlot || !bookDate} onClick={handleBook}>
            {selectedSlot && bookDate ? `Book & Pay ₹${trainer.sessionRate}` : 'Select a date & slot'}
          </button>
        </div>
      </div>

      {paymentModal && (
        <UpiPaymentModal {...paymentModal}
          onClose={() => { setPaymentModal(null); setPendingBooking(null); }}
          onSuccess={handlePaymentSuccess}/>
      )}
    </div>
  );
}
