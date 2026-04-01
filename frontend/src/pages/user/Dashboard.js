import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/authStore';
import { useUserDashboard } from '../../hooks/useQueries';

const GOAL_MAP = {
  weight_loss:        { label:'Weight Loss',       icon:'🔥' },
  muscle_gain:        { label:'Muscle Gain',        icon:'💪' },
  endurance:          { label:'Endurance',          icon:'🏃' },
  flexibility:        { label:'Flexibility',        icon:'🧘' },
  general_fitness:    { label:'General Fitness',    icon:'⚡' },
  sports_performance: { label:'Sports Performance', icon:'🏅' },
};

const Stat = ({ icon, label, value, sub, color='var(--info)' }) => (
  <div className="stat-card">
    <div style={{ width:46, height:46, borderRadius:'var(--r-md)', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:800, color, lineHeight:1 }}>{typeof value==='number'?value.toLocaleString():value}</div>
    <div>
      <div style={{ fontSize:13, color:'var(--t2)' }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>{sub}</div>}
    </div>
  </div>
);

const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton skeleton-avatar" style={{ width:46, height:46 }}/>
    <div className="skeleton" style={{ height:28, width:'60%', borderRadius:4 }}/>
    <div className="skeleton skeleton-text" style={{ width:'80%' }}/>
  </div>
);

export default function UserDashboard() {
  const { user: authUser } = useAuthStore();
  const { data: dash, isLoading } = useUserDashboard();

  const u = dash?.user || authUser || {};
  const goal = GOAL_MAP[u.fitnessGoal] || { label:'General Fitness', icon:'⚡' };
  const trainer = dash?.user?.assignedTrainer || null;
  const sub = { plan: u.subscriptionPlan||'free', isActive: u.subscriptionActive||false };
  const badges = u.badges || [];
  const weeklyData = dash?.weeklyChart || [];

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div style={{ maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:28 }}>
        <div>
          {isLoading ? (
            <>
              <div className="skeleton skeleton-title" style={{ width:260, marginBottom:8 }}/>
              <div className="skeleton skeleton-text" style={{ width:180 }}/>
            </>
          ) : (
            <>
              <h1 style={{ fontSize:'clamp(22px,3vw,28px)', fontWeight:800, marginBottom:4 }}>
                {greeting()}, <span style={{ color:'var(--lime)' }}>{u.name?.split(' ')[0]||'Champ'}</span> 👋
              </h1>
              <p style={{ color:'var(--t2)', fontSize:14 }}>
                {new Date().toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})}
              </p>
            </>
          )}
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {!isLoading && u.streak > 0 && (
            <div style={{ background:'rgba(255,95,31,.1)', border:'1px solid rgba(255,95,31,.25)', borderRadius:'var(--r-md)', padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:22 }}>🔥</span>
              <div>
                <div style={{ fontWeight:800, fontSize:20, color:'var(--orange)', lineHeight:1 }}>{u.streak}</div>
                <div style={{ fontSize:11, color:'var(--t3)' }}>day streak</div>
              </div>
            </div>
          )}
          <Link to="/user/workouts" className="btn btn-primary">Start Workout ⚡</Link>
        </div>
      </div>

      {/* Upgrade banner */}
      {!isLoading && !sub.isActive && (
        <div className="banner-card">
          <div>
            <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Upgrade to unlock all features</div>
            <div style={{ fontSize:12, color:'var(--t2)' }}>Get access to trainer sessions, nutrition plans & more</div>
          </div>
          <Link to="/user/programs" className="btn btn-primary btn-sm">View Plans →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid-stats mb-20">
        {isLoading ? Array(4).fill(0).map((_,i) => <SkeletonStat key={i}/>) : (
          <>
            <Stat icon="💪" label="Total Workouts"  value={u.totalWorkouts||0} sub="lifetime sessions" color="var(--lime)"/>
            <Stat icon="🔥" label="Calories Burned" value={`${((u.totalCaloriesBurned||0)/1000).toFixed(1)}k`} sub="all-time" color="var(--orange)"/>
            <Stat icon="⭐" label="Points Earned"   value={(u.points||0).toLocaleString()} sub="keep earning!" color="var(--warning)"/>
            <Stat icon="🏅" label="Badges"          value={badges.length} sub="achievements" color="var(--info)"/>
          </>
        )}
      </div>

      {/* Charts + Quick links */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:16 }}>
        {/* Weekly activity */}
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Weekly Activity</h3>
          {isLoading ? <div className="skeleton" style={{ height:180, borderRadius:8 }}/> : (
            weeklyData.length === 0 ? (
              <div className="empty-state" style={{ padding:'30px 0' }}>
                <div className="empty-state-icon" style={{ fontSize:32 }}>📊</div>
                <p className="empty-state-title">No activity this week</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
                  <XAxis dataKey="day" tick={{ fill:'var(--t3)', fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:'var(--t3)', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>v>0?`${v}`:''}/>
                  <Tooltip contentStyle={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} formatter={v=>[`${v} kcal`,'Burned']}/>
                  <Bar dataKey="cal" fill="var(--lime)" radius={[4,4,0,0]} name="Calories"/>
                </BarChart>
              </ResponsiveContainer>
            )
          )}
        </div>

        {/* Goal + Quick actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {!isLoading && (
            <div className="card card-neon" style={{ flexShrink:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Current Goal</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:32 }}>{goal.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{goal.label}</div>
                  <div style={{ fontSize:12, color:'var(--t3)', textTransform:'capitalize' }}>
                    {u.fitnessLevel||'beginner'} · {(u.workoutDaysPerWeek||3)}×/week
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { to:'/user/workouts', icon:'💪', label:'Workouts', color:'var(--lime)' },
              { to:'/user/trainers', icon:'🧑‍🏫', label:'Trainers', color:'var(--orange)' },
              { to:'/user/progress', icon:'📊', label:'Progress', color:'var(--info)' },
              { to:'/user/nutrition', icon:'🥗', label:'Nutrition', color:'var(--success)' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ textDecoration:'none' }}>
                <div className="card card-hover" style={{ textAlign:'center', padding:'16px 12px' }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{l.icon}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:l.color }}>{l.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Trainer */}
      {!isLoading && trainer && (
        <div className="card" style={{ marginBottom:16, borderColor:'rgba(255,95,31,.2)' }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--orange)' }}>🏋️ Your Trainer</div>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div className="avatar-placeholder" style={{ width:50, height:50, fontSize:20, background:'rgba(255,95,31,.12)', color:'var(--orange)' }}>{trainer.name?.[0]}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{trainer.name}</div>
              <div style={{ fontSize:12, color:'var(--warning)' }}>⭐ {(trainer.rating||0).toFixed(1)}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:4 }}>
                {(trainer.specializations||[]).slice(0,3).map(s=>(
                  <span key={s} className="badge badge-neutral" style={{ fontSize:10, textTransform:'capitalize' }}>{s.replace(/_/g,' ')}</span>
                ))}
              </div>
            </div>
            <Link to="/user/bookings" className="btn btn-orange btn-sm">Book Session</Link>
          </div>
        </div>
      )}

      {/* Badges */}
      {!isLoading && badges.length > 0 && (
        <div className="card">
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>🏅 Recent Badges</div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {badges.slice(0,6).map((b,i) => (
              <div key={i} title={b.description} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 14px', background:'var(--s2)', borderRadius:'var(--r-md)', cursor:'default' }}>
                <span style={{ fontSize:24 }}>{b.icon}</span>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--t2)', textAlign:'center', maxWidth:72 }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
