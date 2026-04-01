import React, { useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/authStore';
import { useProgress, useLogProgress, useDeleteProgress } from '../../hooks/useQueries';
import BluetoothSync from '../../components/shared/BluetoothSync';

const CHART = { contentStyle:{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }, axisProps:{ tick:{fill:'var(--t3)',fontSize:11}, axisLine:false, tickLine:false } };

const Stat = ({ icon, label, value, color='var(--lime)' }) => (
  <div className="stat-card">
    <div style={{ width:44, height:44, borderRadius:'var(--r-md)', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{icon}</div>
    <div style={{ fontWeight:800, fontSize:24, color, lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:12, color:'var(--t2)' }}>{label}</div>
  </div>
);

const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton" style={{ width:44, height:44, borderRadius:'var(--r-md)' }}/>
    <div className="skeleton" style={{ height:24, width:'60%', borderRadius:4 }}/>
    <div className="skeleton" style={{ height:12, width:'80%', borderRadius:4 }}/>
  </div>
);

export default function UserProgress() {
  const { user } = useAuthStore();
  const { data: progress = [], isLoading } = useProgress({ limit:90 });
  const { mutate: logProgress, isPending: saving } = useLogProgress();
  const { mutate: deleteEntry } = useDeleteProgress();

  const [showLog, setShowLog] = useState(false);
  const [activeChart, setActiveChart] = useState('weight');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight:'', bodyFat:'', muscleMass:'',
    waist:'', chest:'', hips:'',
    caloriesConsumed:'', waterIntake:'', sleepHours:'',
    mood:'good', energyLevel:7, notes:''
  });

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  // Called by BluetoothSync when user taps "Use This Data"
  const handleBluetoothData = useCallback((metrics) => {
    setForm(f => ({
      ...f,
      ...(metrics.weight        != null ? { weight:       String(metrics.weight)        } : {}),
      ...(metrics.bodyFat       != null ? { bodyFat:      String(metrics.bodyFat)       } : {}),
      ...(metrics.caloriesBurned!= null ? { caloriesConsumed: String(metrics.caloriesBurned) } : {}),
    }));
    setShowLog(true);
  }, []);

  const handleLog = () => {
    const payload = {
      date: form.date,
      weight:          form.weight     ? +form.weight     : undefined,
      bodyFat:         form.bodyFat    ? +form.bodyFat    : undefined,
      muscleMass:      form.muscleMass ? +form.muscleMass : undefined,
      measurements:    { waist: form.waist?+form.waist:undefined, chest:form.chest?+form.chest:undefined, hips:form.hips?+form.hips:undefined },
      caloriesConsumed:form.caloriesConsumed ? +form.caloriesConsumed : undefined,
      waterIntake:     form.waterIntake ? +form.waterIntake : undefined,
      sleepHours:      form.sleepHours  ? +form.sleepHours  : undefined,
      mood:            form.mood,
      energyLevel:     form.energyLevel,
      notes:           form.notes||undefined,
    };
    logProgress(payload, {
      onSuccess: () => {
        setShowLog(false);
        setForm({ date: new Date().toISOString().split('T')[0], weight:'', bodyFat:'', muscleMass:'', waist:'', chest:'', hips:'', caloriesConsumed:'', waterIntake:'', sleepHours:'', mood:'good', energyLevel:7, notes:'' });
      }
    });
  };

  const latest   = progress[0] || {};
  const earliest = progress[progress.length-1] || {};
  const weightChange = latest.weight && earliest.weight ? (latest.weight - earliest.weight).toFixed(1) : null;

  const chartData = [...progress].reverse().map(p => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { month:'short', day:'numeric' }),
    weight: p.weight,
    bodyFat: p.bodyFat,
    calories: p.caloriesBurned,
    sleep: p.sleepHours,
    energy: p.energyLevel,
  }));

  const charts = [
    { key:'weight', label:'Weight', dataKey:'weight', color:'var(--lime)', unit:'kg' },
    { key:'bodyFat', label:'Body Fat', dataKey:'bodyFat', color:'var(--orange)', unit:'%' },
    { key:'energy', label:'Energy', dataKey:'energy', color:'var(--info)', unit:'/10' },
    { key:'sleep', label:'Sleep', dataKey:'sleep', color:'var(--warning)', unit:'hrs' },
  ];
  const activeChartData = charts.find(c => c.key === activeChart);

  const MOODS = ['great','good','okay','tired','bad'];

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress <span className="accent">Tracking</span></h1>
          <p className="page-subtitle">Your transformation journey, visualised</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLog(true)}>+ Log Progress</button>
      </div>

      {/* Bluetooth Device Sync — auto-fill progress data from fitness devices */}
      <div style={{ marginBottom: 20 }}>
        <BluetoothSync onDataSync={handleBluetoothData} />
      </div>

      {/* Stats */}
      <div className="grid-stats mb-20">
        {isLoading ? Array(4).fill(0).map((_,i) => <SkeletonStat key={i}/>) : (
          <>
            <Stat icon="⚖️" label="Current Weight" value={latest.weight ? `${latest.weight} kg` : '—'} color="var(--lime)"/>
            <Stat icon="🎯" label="Target Weight"  value={user?.targetWeight ? `${user.targetWeight} kg` : '—'} color="var(--info)"/>
            <Stat icon="📉" label="Total Change"   value={weightChange ? `${weightChange > 0?'+':''}${weightChange} kg` : '—'} color={Number(weightChange) < 0 ? 'var(--success)' : 'var(--warning)'}/>
            <Stat icon="💪" label="Body Fat"       value={latest.bodyFat ? `${latest.bodyFat}%` : '—'} color="var(--orange)"/>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="card mb-20">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
          <h3 style={{ fontWeight:700, fontSize:15 }}>Progress Chart</h3>
          <div style={{ display:'flex', gap:6 }}>
            {charts.map(c => (
              <button key={c.key} onClick={() => setActiveChart(c.key)}
                className={`btn btn-sm ${activeChart===c.key?'btn-primary':'btn-ghost'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="skeleton" style={{ height:220, borderRadius:8 }}/> :
         chartData.length < 2 ? (
          <div className="empty-state" style={{ padding:'40px 0' }}>
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-title">Not enough data yet</p>
            <p className="empty-state-desc">Log at least 2 entries to see your progress chart</p>
          </div>
         ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeChartData.color} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={activeChartData.color} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
              <XAxis dataKey="date" {...CHART.axisProps}/>
              <YAxis {...CHART.axisProps} tickFormatter={v => `${v}${activeChartData.unit}`}/>
              <Tooltip contentStyle={CHART.contentStyle} formatter={v => [`${v}${activeChartData.unit}`, activeChartData.label]}/>
              <Area type="monotone" dataKey={activeChartData.dataKey} stroke={activeChartData.color} strokeWidth={2} fill="url(#pg)" dot={{ fill:activeChartData.color, r:3 }}/>
            </AreaChart>
          </ResponsiveContainer>
         )
        }
      </div>

      {/* History */}
      <div className="card">
        <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>History</h3>
        {isLoading ? (
          Array(4).fill(0).map((_,i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton" style={{ width:60, height:14, borderRadius:4 }}/>
              <div className="skeleton" style={{ width:80, height:14, borderRadius:4 }}/>
              <div className="skeleton" style={{ width:60, height:14, borderRadius:4 }}/>
            </div>
          ))
        ) : progress.length === 0 ? (
          <div className="empty-state" style={{ padding:'30px 0' }}>
            <div className="empty-state-icon">📝</div>
            <p className="empty-state-title">No entries yet</p>
            <p className="empty-state-desc">Start logging to track your progress over time</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Date</th><th>Weight</th><th>Body Fat</th><th>Calories</th><th>Sleep</th><th>Mood</th><th></th></tr>
              </thead>
              <tbody>
                {progress.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight:600 }}>{new Date(p.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    <td>{p.weight ? `${p.weight} kg` : '—'}</td>
                    <td>{p.bodyFat ? `${p.bodyFat}%` : '—'}</td>
                    <td>{p.caloriesConsumed ? `${p.caloriesConsumed} kcal` : '—'}</td>
                    <td>{p.sleepHours ? `${p.sleepHours}h` : '—'}</td>
                    <td style={{ textTransform:'capitalize' }}>{p.mood||'—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => { if(window.confirm('Delete this entry?')) deleteEntry(p.id); }}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log modal */}
      {showLog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
          onClick={e => e.target===e.currentTarget && setShowLog(false)}>
          <div className="card" style={{ maxWidth:540, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:800, fontSize:18 }}>Log Progress</h3>
              <button onClick={() => setShowLog(false)} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:22 }}>×</button>
            </div>

            <div style={{ display:'grid', gap:14 }}>
              {/* Bluetooth sync inside the modal */}
              <BluetoothSync onDataSync={(m) => {
                if (m.weight)        set('weight',       String(m.weight));
                if (m.bodyFat)       set('bodyFat',      String(m.bodyFat));
                if (m.caloriesBurned)set('caloriesConsumed', String(m.caloriesBurned));
              }} />

              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => set('date',e.target.value)} max={new Date().toISOString().split('T')[0]}/>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
                {[['Weight (kg)','weight'],['Body Fat (%)','bodyFat'],['Muscle Mass (kg)','muscleMass']].map(([l,k]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" type="number" step="0.1" placeholder="—" value={form[k]} onChange={e => set(k,e.target.value)}/>
                  </div>
                ))}
              </div>

              <div style={{ fontSize:12, fontWeight:600, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:-6 }}>Measurements (cm)</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {[['Waist','waist'],['Chest','chest'],['Hips','hips']].map(([l,k]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" type="number" step="0.5" placeholder="—" value={form[k]} onChange={e => set(k,e.target.value)}/>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
                {[['Calories In','caloriesConsumed'],['Water (L)','waterIntake'],['Sleep (hrs)','sleepHours']].map(([l,k]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" type="number" step="0.1" placeholder="—" value={form[k]} onChange={e => set(k,e.target.value)}/>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Mood</label>
                <div style={{ display:'flex', gap:6 }}>
                  {MOODS.map(m => (
                    <button key={m} onClick={() => set('mood',m)} style={{ flex:1, padding:'8px 4px', borderRadius:'var(--r-sm)', border:`1px solid ${form.mood===m?'var(--lime)':'var(--border)'}`, background: form.mood===m ? 'rgba(200,241,53,.1)' : 'transparent', color: form.mood===m ? 'var(--lime)' : 'var(--t2)', cursor:'pointer', fontSize:12, fontWeight: form.mood===m?700:400, fontFamily:'var(--font-body)', textTransform:'capitalize' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Energy Level: {form.energyLevel}/10</label>
                <input type="range" min="1" max="10" step="1" value={form.energyLevel} onChange={e => set('energyLevel',+e.target.value)} style={{ width:'100%' }}/>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes',e.target.value)} placeholder="How did today feel?"/>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={handleLog} disabled={saving}>{saving?'Saving…':'Save Entry'}</button>
              <button className="btn btn-ghost" onClick={() => setShowLog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
