import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import UpiPaymentModal from '../../components/shared/UpiPaymentModal';

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

export default function UserTrainers() {
  const { user } = useAuthStore();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [avail, setAvail] = useState(null);
  const [bookDate, setBookDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('online');
  const [notes, setNotes] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);

  useEffect(() => {
    api.get('/trainers')
      .then(({ data }) => { if (data.success) setTrainers(data.trainers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/bookings/trainer/${selected.id||selected._id}/availability`)
      .then(({ data }) => { if (data.success) setAvail(data.availability); })
      .catch(() => {});
  }, [selected]);

  useEffect(() => {
    if (!selected || !bookDate) { setBookedSlots([]); setSelectedSlot(null); return; }
    api.get(`/bookings/trainer/${selected.id||selected._id}/availability?date=${bookDate}`)
      .then(({ data }) => { if (data.success) setBookedSlots(data.bookedSlots||[]); })
      .catch(() => {});
    setSelectedSlot(null);
  }, [bookDate, selected]);

  const getSlotsForDate = () => {
    if (!bookDate || !avail) return [];
    const dayName = DAYS[new Date(bookDate+'T12:00:00').getDay()];
    const dayAvail = avail.find(a => a.day===dayName);
    if (!dayAvail?.slots?.length) return [];
    return dayAvail.slots.filter(s => !bookedSlots.some(b => b.startTime===s.startTime));
  };

  const handleBook = () => {
    if (!selectedSlot || !bookDate) return toast.error('Select a date and time slot');
    setPendingBooking({ trainerId: selected.id||selected._id, sessionDate: bookDate, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, sessionType, notes });
    setPaymentModal({ amount: selected.sessionRate||500, type:'session_booking', description:`Session with ${selected.name} on ${bookDate} at ${selectedSlot.startTime}` });
  };

  const handlePaymentSuccess = async () => {
    if (!pendingBooking) return;
    try {
      const { data } = await api.post('/bookings', pendingBooking);
      if (data.success) { toast.success('Session booked! 🎉'); setSelected(null); setPaymentModal(null); setPendingBooking(null); setBookDate(''); setSelectedSlot(null); }
    } catch (e) { toast.error(e.response?.data?.message||'Booking failed'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const slotsForDate = getSlotsForDate();
  const hasAvail = avail?.some(a => (a.slots||[]).length > 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const filteredTrainers = trainers.filter(t => {
    // Exclude the admin-assigned trainer (user already has dedicated trainer)
    const tid = t.id || t._id;
    if (user?.assignedTrainerId && user.assignedTrainerId === tid) return false;
    // Only show trainers who have configured at least one availability slot
    const hasSlots = (t.availability || []).some(day => (day.slots || []).length > 0);
    if (!hasSlots) return false;
    if (searchQuery && !`${t.name} ${t.bio || ''} ${(t.specializations||[]).join(' ')}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (cityFilter && !(t.city || '').toLowerCase().includes(cityFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h1 style={{ fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, marginBottom:4 }}>Find a <span style={{ color:'var(--lime)' }}>Trainer</span></h1>
        <p style={{ color:'var(--t2)', fontSize:13 }}>Book a session with a certified personal trainer</p>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <input className="form-input" placeholder="🔍 Search by name, specialization…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ flex:'1 1 200px', maxWidth:340 }}/>
        <input className="form-input" placeholder="📍 Filter by city" value={cityFilter} onChange={e=>setCityFilter(e.target.value)} style={{ flex:'1 1 140px', maxWidth:200 }}/>
        {(searchQuery||cityFilter) && <button className="btn btn-ghost btn-sm" onClick={()=>{setSearchQuery('');setCityFilter('');}}>Clear</button>}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
      ) : (
        <div className="trainer-layout" style={{ display:'grid', gridTemplateColumns: selected ? 'minmax(0,1fr) minmax(0,340px)' : 'repeat(auto-fill,minmax(300px,1fr))', gap:16, alignItems:'start' }}>

          {/* Trainer cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filteredTrainers.map((t,i) => {
              const isActive = (selected?.id||selected?._id)===(t.id||t._id);
              return (
                <div key={t.id||t._id||i} className="card card-hover"
                  style={{ cursor:'pointer', borderColor: isActive?'var(--lime)':'var(--border)', background: isActive?'rgba(200,241,53,.03)':undefined, animation:`fadeIn .4s ease ${i*.06}s both` }}
                  onClick={() => { setSelected(isActive?null:t); setBookDate(''); setSelectedSlot(null); }}>
                  <div style={{ display:'flex', gap:12, marginBottom:12 }}>
                    <div className="avatar-placeholder" style={{ width:52, height:52, fontSize:20, background:'rgba(255,95,31,.12)', color:'var(--orange)', flexShrink:0 }}>{t.name?.[0]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>{t.name}</div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                        <span style={{ color:'var(--warning)', fontSize:13 }}>⭐ {(t.rating||0).toFixed(1)}</span>
                        <span style={{ color:'var(--t3)', fontSize:11 }}>·</span>
                        <span style={{ color:'var(--t2)', fontSize:13 }}>{t.experience}yr exp</span>
                        <span style={{ color:'var(--t3)', fontSize:11 }}>·</span>
                        <span style={{ color:'var(--t2)', fontSize:13 }}>{t.totalSessions||0} sessions</span>
                      </div>
                      {(t.city||t.state) && (
                        <div style={{ fontSize:12, color:'var(--t3)', marginBottom:4 }}>
                          📍 {[t.city,t.state].filter(Boolean).join(', ')}
                          {t.isOnline && <span style={{ marginLeft:8, color:'var(--success)' }}>🌐 Online</span>}
                        </div>
                      )}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {(t.specializations||[]).slice(0,3).map(s => (
                          <span key={s} className="badge badge-neutral" style={{ fontSize:10, textTransform:'capitalize' }}>{s.replace(/_/g,' ')}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontWeight:800, fontSize:18, color:'var(--lime)' }}>₹{t.sessionRate}</div>
                      <div style={{ fontSize:11, color:'var(--t3)' }}>/session</div>
                    </div>
                  </div>
                  {t.bio && <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom:10 }}>{t.bio}</p>}
                  <button className={`btn btn-sm ${isActive?'btn-primary':'btn-ghost'}`} style={{ width:'100%' }}>
                    {isActive ? 'Booking ▲' : 'Book Session →'}
                  </button>
                </div>
              );
            })}
            {filteredTrainers.length===0 && (
              <div style={{ textAlign:'center', padding:60, color:'var(--t3)' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🏋️</div>
                <p>{trainers.length===0?'No trainers available yet':'No trainers match your search'}</p>
                {(searchQuery||cityFilter) && <button className="btn btn-ghost btn-sm" style={{ marginTop:12 }} onClick={()=>{setSearchQuery('');setCityFilter('');}}>Clear filters</button>}
              </div>
            )}
          </div>

          {/* Booking panel */}
          {selected && (
            <div className="card trainer-booking-panel" style={{ position:'sticky', top:20 }}>
              <div style={{ marginBottom:18, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:2 }}>Book with {selected.name}</div>
                <div style={{ fontSize:13, color:'var(--t2)' }}>₹{selected.sessionRate} per session</div>
              </div>

              {/* Session type */}
              <div className="form-group" style={{ marginBottom:14 }}>
                <label className="form-label">Session Type</label>
                <div style={{ display:'flex', gap:8 }}>
                  {[['online','🖥 Online'],['in_person','📍 In Person']].map(([val,lbl]) => (
                    <button key={val} type="button" onClick={() => setSessionType(val)}
                      style={{ flex:1, padding:'9px 8px', borderRadius:'var(--r-md)', border:`1.5px solid ${sessionType===val?'var(--lime)':'var(--border)'}`, background:sessionType===val?'rgba(200,241,53,.08)':'var(--s2)', cursor:'pointer', fontSize:13, fontWeight:sessionType===val?700:500, color:sessionType===val?'var(--lime)':'var(--t2)', transition:'all .14s', fontFamily:'var(--font-body)' }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="form-group" style={{ marginBottom:14 }}>
                <label className="form-label">Select Date</label>
                <input type="date" className="form-input" value={bookDate}
                  min={today} max={new Date(Date.now()+30*86400000).toISOString().split('T')[0]}
                  onChange={e => setBookDate(e.target.value)}/>
              </div>

              {/* Slots */}
              {bookDate && !hasAvail && (
                <div style={{ padding:'10px 12px', background:'rgba(255,176,32,.06)', border:'1px solid rgba(255,176,32,.15)', borderRadius:'var(--r-md)', fontSize:13, color:'var(--warning)', marginBottom:14 }}>
                  ⚠️ Trainer hasn't set availability yet
                </div>
              )}
              {bookDate && hasAvail && slotsForDate.length===0 && (
                <div style={{ padding:'10px 12px', background:'var(--s2)', borderRadius:'var(--r-md)', fontSize:13, color:'var(--t3)', marginBottom:14 }}>
                  No available slots for this date
                </div>
              )}
              {slotsForDate.length > 0 && (
                <div className="form-group" style={{ marginBottom:14 }}>
                  <label className="form-label">Time Slot</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(88px,1fr))', gap:6 }}>
                    {slotsForDate.map((s,si) => (
                      <button key={si} type="button" onClick={() => setSelectedSlot(s)}
                        style={{ padding:'8px 4px', borderRadius:'var(--r-sm)', border:`1.5px solid ${selectedSlot?.startTime===s.startTime?'var(--lime)':'var(--border)'}`, background:selectedSlot?.startTime===s.startTime?'rgba(200,241,53,.1)':'var(--s2)', cursor:'pointer', fontSize:13, fontWeight:selectedSlot?.startTime===s.startTime?700:400, color:selectedSlot?.startTime===s.startTime?'var(--lime)':'var(--t1)', fontFamily:'var(--font-body)', transition:'all .12s' }}>
                        {s.startTime}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="form-group" style={{ marginBottom:16 }}>
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-input" rows={2} placeholder="Goals or notes for trainer…" value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight:60 }}/>
              </div>

              {/* Summary */}
              {selectedSlot && bookDate && (
                <div style={{ background:'rgba(200,241,53,.05)', border:'1px solid rgba(200,241,53,.12)', borderRadius:'var(--r-md)', padding:'10px 14px', marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                    <span style={{ color:'var(--t2)' }}>Date</span>
                    <span style={{ fontWeight:600 }}>{new Date(bookDate+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                    <span style={{ color:'var(--t2)' }}>Time</span>
                    <span style={{ fontWeight:600 }}>{selectedSlot.startTime} – {selectedSlot.endTime}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--t2)' }}>Total</span>
                    <span style={{ fontWeight:800, color:'var(--lime)', fontSize:16 }}>₹{selected.sessionRate}</span>
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-full" disabled={!selectedSlot||!bookDate} onClick={handleBook}>
                {selectedSlot&&bookDate ? `Book & Pay ₹${selected.sessionRate}` : 'Select a slot to book'}
              </button>
            </div>
          )}
        </div>
      )}

      {paymentModal && (
        <UpiPaymentModal {...paymentModal}
          onClose={() => { setPaymentModal(null); setPendingBooking(null); }}
          onSuccess={handlePaymentSuccess}/>
      )}
    </div>
  );
}
