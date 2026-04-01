import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminDashboard } from '../../hooks/useQueries';

const CHART = { contentStyle:{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }, axisProps:{ tick:{fill:'var(--t3)',fontSize:11}, axisLine:false, tickLine:false } };

const Stat = ({ icon, label, value, sub, color='var(--info)', prefix='' }) => (
  <div className="stat-card">
    <div style={{ width:46, height:46, borderRadius:'var(--r-md)', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:800, color, lineHeight:1 }}>{prefix}{typeof value==='number'?value.toLocaleString():value}</div>
    <div>
      <div style={{ fontSize:13, color:'var(--t2)' }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{sub}</div>}
    </div>
  </div>
);
const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton skeleton-avatar" style={{ width:46, height:46 }}/>
    <div className="skeleton" style={{ height:28, width:'55%', borderRadius:4 }}/>
    <div className="skeleton skeleton-text" style={{ width:'75%' }}/>
  </div>
);

export default function AdminDashboard() {
  const { data: dash, isLoading } = useAdminDashboard();

  const s = dash?.stats || {};
  const revenueChart = dash?.revenueChart || [];
  const userChart    = dash?.userChart    || [];
  const pendingTrainers = dash?.pendingTrainers || [];

  return (
    <div style={{ maxWidth:1200 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'clamp(22px,3vw,28px)', fontWeight:800, marginBottom:4 }}>Platform Overview 📊</h1>
          <p style={{ color:'var(--t2)', fontSize:14 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})}</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/admin/trainers" className="btn btn-ghost">Manage Trainers</Link>
          <Link to="/admin/notifications" className="btn btn-primary">Send Notification</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats mb-20">
        {isLoading ? Array(6).fill(0).map((_,i) => <SkeletonStat key={i}/>) : (
          <>
            <Stat icon="👥" label="Total Users"       value={s.totalUsers||0}       sub={`+${s.newUsersThisMonth||0} this month`} color="var(--lime)"/>
            <Stat icon="🏋️" label="Trainers"         value={s.totalTrainers||0}     sub={`${s.pendingApprovals||0} pending`} color="var(--orange)"/>
            <Stat icon="📅" label="Bookings"          value={s.totalBookings||0}     sub={`${s.bookingsThisMonth||0} this month`} color="var(--info)"/>
            <Stat icon="💰" label="Revenue"           value={s.revenueThisMonth||0}  prefix="₹" sub={`${s.revenueGrowth>0?'+':''}${s.revenueGrowth||0}% growth`} color="var(--success)"/>
            <Stat icon="🎯" label="Subscriptions"     value={s.activeSubscriptions||0} sub="active" color="var(--warning)"/>
            <Stat icon="✅" label="Completed Sessions" value={s.completedBookings||0} sub="all time" color="var(--t2)"/>
          </>
        )}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:16 }}>
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Monthly Revenue</h3>
          {isLoading ? <div className="skeleton" style={{ height:200, borderRadius:8 }}/> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
                <XAxis dataKey="month" {...CHART.axisProps}/>
                <YAxis {...CHART.axisProps} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={CHART.contentStyle} formatter={v=>[`₹${v.toLocaleString()}`,'Revenue']}/>
                <Bar dataKey="revenue" fill="var(--lime)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>User Growth</h3>
          {isLoading ? <div className="skeleton" style={{ height:200, borderRadius:8 }}/> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
                <XAxis dataKey="month" {...CHART.axisProps}/>
                <YAxis {...CHART.axisProps}/>
                <Tooltip contentStyle={CHART.contentStyle}/>
                <Line type="monotone" dataKey="users" stroke="var(--info)" strokeWidth={2} dot={{ fill:'var(--info)', r:3 }} name="Users"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pending trainer approvals */}
      {!isLoading && pendingTrainers.length > 0 && (
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>⏳ Pending Trainer Approvals ({pendingTrainers.length})</h3>
            <Link to="/admin/trainers" style={{ fontSize:12, color:'var(--lime)' }}>View all →</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {pendingTrainers.slice(0,5).map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--s2)', borderRadius:'var(--r-md)' }}>
                <div className="avatar-placeholder" style={{ width:40, height:40, fontSize:16, background:'rgba(255,95,31,.12)', color:'var(--orange)', flexShrink:0 }}>{t.name?.[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{t.name}</div>
                  <div style={{ fontSize:12, color:'var(--t3)' }}>{t.email} · {t.experience}yr exp</div>
                  <div style={{ display:'flex', gap:4, marginTop:4, flexWrap:'wrap' }}>
                    {(t.specializations||[]).slice(0,2).map(s=>(
                      <span key={s} className="badge badge-neutral" style={{ fontSize:10, textTransform:'capitalize' }}>{s.replace(/_/g,' ')}</span>
                    ))}
                  </div>
                </div>
                <Link to="/admin/trainers" className="btn btn-primary btn-sm" style={{ flexShrink:0 }}>Review →</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
