import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/authStore';
import { useTrainerSchedule, useMyClients } from '../../hooks/useQueries';

const Stat = ({ icon, label, value, color='var(--orange)' }) => (
  <div className="stat-card">
    <div style={{ width:44, height:44, borderRadius:'var(--r-md)', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:800, color, lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:13, color:'var(--t2)' }}>{label}</div>
  </div>
);
const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton skeleton-avatar" style={{ width:44, height:44 }}/>
    <div className="skeleton" style={{ height:28, width:'55%', borderRadius:4 }}/>
    <div className="skeleton skeleton-text" style={{ width:'75%' }}/>
  </div>
);

const SB = ({ s }) => {
  const m = { pending:'badge-warning', confirmed:'badge-success', cancelled:'badge-error', completed:'badge-info' };
  return <span className={`badge ${m[s]||'badge-neutral'}`} style={{ textTransform:'capitalize' }}>{s}</span>;
};

export default function TrainerDashboard() {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading: loadingBookings } = useTrainerSchedule();
  const { data: clients = [], isLoading: loadingClients } = useMyClients();

  const completed   = bookings.filter(b => b.status === 'completed');
  const pending     = bookings.filter(b => b.status === 'pending');
  const confirmed   = bookings.filter(b => b.status === 'confirmed');
  const upcoming    = confirmed.filter(b => new Date(b.sessionDate) >= new Date()).slice(0, 5);
  const totalEarn   = completed.reduce((s,b) => s + (b.amount||0), 0);

  const now = new Date();
  const weeklyChart = Array.from({ length:7 }, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i)); d.setHours(0,0,0,0);
    const end = new Date(d); end.setHours(23,59,59,999);
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const daySessions = completed.filter(b => {
      const t = new Date(b.sessionDate);
      return t >= d && t <= end;
    });
    return { day: days[d.getDay()], sessions: daySessions.length, earn: daySessions.reduce((s,b)=>s+(b.amount||0),0) };
  });

  const isLoading = loadingBookings || loadingClients;

  return (
    <div style={{ maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:28 }}>
        <div>
          {isLoading ? (
            <>
              <div className="skeleton skeleton-title" style={{ width:240, marginBottom:8 }}/>
              <div className="skeleton skeleton-text" style={{ width:160 }}/>
            </>
          ) : (
            <>
              <h1 style={{ fontSize:'clamp(22px,3vw,28px)', fontWeight:800, marginBottom:4 }}>
                Welcome back, <span style={{ color:'var(--orange)' }}>{user?.name?.split(' ')[0]||'Coach'}</span> 🏅
              </h1>
              <p style={{ color:'var(--t2)', fontSize:14 }}>
                {new Date().toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})}
              </p>
            </>
          )}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/trainer/schedule" className="btn btn-ghost">Edit Schedule</Link>
          <Link to="/trainer/clients"  className="btn btn-orange">View Clients</Link>
        </div>
      </div>

      {/* Approval banner */}
      {!isLoading && !user?.isApproved && (
        <div className="banner-card orange mb-20">
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>⏳ Awaiting Approval</div>
            <div style={{ fontSize:12, color:'var(--t2)' }}>Your profile is under review. You'll be notified once approved.</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid-stats mb-20">
        {isLoading ? Array(5).fill(0).map((_,i) => <SkeletonStat key={i}/>) : (
          <>
            <Stat icon="📅" label="Total Sessions"  value={completed.length} color="var(--lime)"/>
            <Stat icon="👥" label="Active Clients"  value={clients.length}   color="var(--info)"/>
            <Stat icon="⭐" label="Rating"          value={`${(user?.rating||0).toFixed(1)}/5`} color="var(--warning)"/>
            <Stat icon="💰" label="Total Earnings"  value={`₹${(totalEarn/1000).toFixed(0)}k`} color="var(--success)"/>
            <Stat icon="⏳" label="Pending"         value={pending.length} color="var(--orange)"/>
          </>
        )}
      </div>

      {/* Charts + Pending */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:16 }}>
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Weekly Sessions</h3>
          {isLoading ? <div className="skeleton" style={{ height:180, borderRadius:8 }}/> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
                <XAxis dataKey="day" tick={{ fill:'var(--t3)', fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'var(--t3)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}/>
                <Bar dataKey="sessions" fill="var(--orange)" radius={[4,4,0,0]} name="Sessions"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pending requests */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>Pending Requests</h3>
            {pending.length > 0 && <Link to="/trainer/bookings" style={{ fontSize:12, color:'var(--lime)' }}>View all →</Link>}
          </div>
          {isLoading ? Array(3).fill(0).map((_,i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton skeleton-avatar" style={{ width:36, height:36 }}/>
              <div style={{ flex:1 }}>
                <div className="skeleton skeleton-text" style={{ width:'60%', marginBottom:4 }}/>
                <div className="skeleton skeleton-text" style={{ width:'40%' }}/>
              </div>
            </div>
          )) : pending.length === 0 ? (
            <div className="empty-state" style={{ padding:'20px 0' }}>
              <div className="empty-state-icon" style={{ fontSize:28 }}>✅</div>
              <p style={{ fontSize:13, color:'var(--t2)' }}>No pending requests</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {pending.slice(0,4).map(b => (
                <div key={b.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="avatar-placeholder" style={{ width:36, height:36, fontSize:14, background:'rgba(200,241,53,.1)', color:'var(--lime)', flexShrink:0 }}>{b.user?.name?.[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{b.user?.name}</div>
                    <div style={{ fontSize:12, color:'var(--t3)' }}>{new Date(b.sessionDate).toLocaleDateString('en-IN',{month:'short',day:'numeric'})} · {b.startTime}</div>
                  </div>
                  <span style={{ fontWeight:700, fontSize:13, color:'var(--success)', flexShrink:0 }}>₹{b.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming sessions */}
      {!isLoading && upcoming.length > 0 && (
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>Upcoming Sessions</h3>
            <Link to="/trainer/bookings" style={{ fontSize:12, color:'var(--lime)' }}>View all →</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {upcoming.map(b => (
              <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--s2)', borderRadius:'var(--r-md)' }}>
                <div className="avatar-placeholder" style={{ width:38, height:38, fontSize:15, background:'rgba(255,95,31,.12)', color:'var(--orange)', flexShrink:0 }}>{b.user?.name?.[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{b.user?.name}</div>
                  <div style={{ fontSize:12, color:'var(--t3)' }}>{new Date(b.sessionDate).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})} · {b.startTime} · {b.sessionType==='online'?'🖥 Online':'📍 In Person'}</div>
                </div>
                <SB s={b.status}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
