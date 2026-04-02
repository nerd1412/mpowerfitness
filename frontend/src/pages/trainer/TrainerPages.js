import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import VideoCall from '../../components/shared/VideoCall';

const PH = ({ title, hl, sub, color='var(--orange)', action }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
    <div>
      <h1 style={{ fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, marginBottom:4 }}>{title}{hl&&<span style={{ color }}> {hl}</span>}</h1>
      {sub&&<p style={{ color:'var(--t2)', fontSize:13 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const SB = ({ s }) => {
  const m={pending:'badge-warning',confirmed:'badge-success',cancelled:'badge-error',completed:'badge-info'};
  return <span className={`badge ${m[s]||'badge-neutral'}`} style={{ textTransform:'capitalize' }}>{s}</span>;
};

/* ── CLIENTS ── */
export const TrainerClients = () => {
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ api.get('/trainers/my-clients').then(({data})=>{if(data.success)setClients(data.clients);}).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  return (
    <div>
      <PH title="My" hl="Clients" sub={`${clients.length} active client${clients.length!==1?'s':''}`}/>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner spinner-lg"/></div>:
       clients.length===0?<div className="card" style={{textAlign:'center',padding:60}}><div style={{fontSize:48,marginBottom:16}}>👥</div><p style={{color:'var(--t2)',fontSize:14}}>No clients yet.</p></div>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {clients.map((c,i)=>(
            <div key={c.id||c._id} className="card card-hover" style={{animation:`fadeIn .4s ease ${i*.06}s both`}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div className="avatar-placeholder" style={{width:46,height:46,fontSize:18,background:'rgba(255,95,31,.12)',color:'var(--orange)',flexShrink:0}}>{c.name?.[0]}</div>
                <div><div style={{fontWeight:600,fontSize:14}}>{c.name}</div><div style={{fontSize:12,color:'var(--t3)'}}>{c.email}</div><div style={{fontSize:12,color:'var(--t2)',marginTop:2,textTransform:'capitalize'}}>{(c.fitnessGoal||'').replace(/_/g,' ')} · {c.fitnessLevel}</div></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>
                {[['🔥',c.streak||0,'Streak'],['💪',c.totalWorkouts||0,'Workouts'],['⚖️',c.weight?`${c.weight}kg`:'—','Weight']].map(([icon,val,lbl],j)=>(
                  <div key={j} style={{background:'var(--s2)',borderRadius:'var(--r-sm)',padding:'7px 4px',textAlign:'center'}}><div style={{fontSize:13}}>{icon}</div><div style={{fontWeight:700,fontSize:12}}>{val}</div><div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.04em'}}>{lbl}</div></div>
                ))}
              </div>
              <button className="btn btn-orange btn-sm btn-full" onClick={async () => {
                try {
                  const { default: api } = await import('../../utils/api');
                  const { data } = await api.post('/chat/send', {
                    recipientId: c.id || c._id, recipientModel: 'User',
                    content: `Hi ${c.name}! Your trainer here. Feel free to message me anytime with questions about your training.`
                  });
                  if (data.success) toast.success(`Conversation started with ${c.name}!`);
                } catch { toast.error('Failed to start conversation'); }
              }}>Message</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── SCHEDULE ── */
const ALL_DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
// JS getDay() → day name mapping (0=Sunday)
const JS_DAY_MAP = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

/**
 * Returns the next upcoming Date object for a given day name.
 * Always returns a future date (never today).
 */
const nextOccurrence = (dayName) => {
  const target = JS_DAY_MAP.indexOf(dayName);
  const now = new Date(); now.setHours(0,0,0,0);
  let diff = target - now.getDay();
  if (diff <= 0) diff += 7; // always future
  return new Date(now.getTime() + diff * 86400000);
};

export const TrainerSchedule = () => {
  const [avail, setAvail] = useState(ALL_DAYS.map(d => ({ day: d, slots: [] })));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        if (data.user?.availability?.length) {
          setAvail(ALL_DAYS.map(d => data.user.availability.find(a => a.day === d) || { day: d, slots: [] }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addSlot = di => {
    const a = [...avail];
    a[di] = { ...a[di], slots: [...(a[di].slots || []), { startTime:'09:00', endTime:'10:00' }] };
    setAvail(a);
  };
  const removeSlot = (di, si) => {
    const a = [...avail];
    a[di] = { ...a[di], slots: a[di].slots.filter((_, j) => j !== si) };
    setAvail(a);
  };
  const updateSlot = (di, si, field, val) => {
    const a = [...avail];
    a[di] = { ...a[di], slots: a[di].slots.map((s, j) => j === si ? { ...s, [field]: val } : s) };
    setAvail(a);
  };
  const save = async () => {
    setSaving(true);
    try {
      await api.put('/trainers/availability', { availability: avail });
      toast.success('Schedule saved!');
    } catch { toast.error('Failed to save schedule'); }
    setSaving(false);
  };

  // Sort days by next occurrence so trainer always sees upcoming dates first
  const sortedAvail = [...avail].sort((a, b) => nextOccurrence(a.day) - nextOccurrence(b.day));

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-lg"/></div>;

  return (
    <div style={{ maxWidth:760 }}>
      <PH
        title="My" hl="Schedule"
        sub="Set your weekly recurring time slots — applied to all future dates of each day"
        action={<button className="btn btn-orange" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Schedule'}</button>}
      />

      {/* Upcoming preview strip */}
      <div style={{
        display:'flex', gap:7, overflowX:'auto', paddingBottom:6,
        marginBottom:18, scrollbarWidth:'none',
      }}>
        {sortedAvail.map(day => {
          const next = nextOccurrence(day.day);
          const hasSlots = day.slots.length > 0;
          return (
            <div key={day.day} style={{
              flexShrink:0, minWidth:58, padding:'8px 6px',
              borderRadius:'var(--r-md)', textAlign:'center',
              background: hasSlots ? 'rgba(255,95,31,.08)' : 'var(--s2)',
              border: `1.5px solid ${hasSlots ? 'rgba(255,95,31,.3)' : 'var(--border)'}`,
            }}>
              <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color: hasSlots ? 'var(--orange)' : 'var(--t3)', marginBottom:2 }}>
                {next.toLocaleDateString('en-IN', { weekday:'short' })}
              </div>
              <div style={{ fontSize:16, fontWeight:800, color: hasSlots ? 'var(--t1)' : 'var(--t3)', lineHeight:1.1 }}>
                {next.getDate()}
              </div>
              <div style={{ fontSize:8, color:'var(--t3)', marginTop:2 }}>
                {next.toLocaleDateString('en-IN', { month:'short' })}
              </div>
              <div style={{ fontSize:9, color: hasSlots ? 'var(--success)' : 'var(--t3)', marginTop:3, fontWeight:600 }}>
                {hasSlots ? `${day.slots.length} slot${day.slots.length !== 1 ? 's' : ''}` : 'off'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {sortedAvail.map((day) => {
          const di = avail.findIndex(a => a.day === day.day);
          const next = nextOccurrence(day.day);
          const nextLabel = next.toLocaleDateString('en-IN', { weekday:'long', month:'short', day:'numeric' });
          return (
            <div key={day.day} className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: day.slots.length ? 12 : 0, flexWrap:'wrap', gap:8 }}>
                <div>
                  <span style={{ fontWeight:700, fontSize:14, textTransform:'capitalize' }}>{day.day}</span>
                  <span style={{ fontSize:12, color:'var(--t3)', marginLeft:10 }}>Next: {nextLabel}</span>
                  {day.slots.length > 0 && (
                    <span className="badge badge-success" style={{ marginLeft:8, fontSize:9 }}>
                      {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => addSlot(di)}>+ Add slot</button>
              </div>
              {day.slots.length === 0 && (
                <div style={{ fontSize:13, color:'var(--t3)', fontStyle:'italic' }}>No slots set — marked as day off</div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {day.slots.map((slot, si) => (
                  <div key={si} style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                    <input type="time" className="form-input" style={{ width:130 }} value={slot.startTime}
                      onChange={e => updateSlot(di, si, 'startTime', e.target.value)}/>
                    <span style={{ color:'var(--t3)', fontSize:13 }}>to</span>
                    <input type="time" className="form-input" style={{ width:130 }} value={slot.endTime}
                      onChange={e => updateSlot(di, si, 'endTime', e.target.value)}/>
                    <button className="btn btn-danger btn-sm" onClick={() => removeSlot(di, si)}>✕ Remove</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── BOOKINGS ── */
export const TrainerBookings = () => {
  const { user } = useAuthStore();
  const [bookings,setBookings]=useState([]);
  const [filter,setFilter]=useState('all');
  const [loading,setLoading]=useState(true);
  const [activeCall, setActiveCall] = useState(null); // { bookingId, displayName }

  const load=()=>{setLoading(true);api.get('/bookings/trainer-schedule').then(({data})=>{if(data.success)setBookings(data.bookings);}).catch(()=>{}).finally(()=>setLoading(false));};
  useEffect(load,[]);
  const updateStatus=async(id,status)=>{try{await api.patch(`/bookings/${id}/status`,{status});toast.success(`Booking ${status}`);setBookings(b=>b.map(x=>(x.id||x._id)===id?{...x,status}:x));}catch(e){toast.error(e.response?.data?.message||'Failed');}};
  const filtered=filter==='all'?bookings:bookings.filter(b=>b.status===filter);
  return (
    <div>
      <PH title="My" hl="Bookings" sub="Manage session requests and appointments"/>
      <div style={{display:'flex',gap:6,marginBottom:18,flexWrap:'wrap'}}>
        {['all','pending','confirmed','completed','cancelled'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-orange':'btn-ghost'}`} style={{textTransform:'capitalize'}}>{f}</button>
        ))}
      </div>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner spinner-lg"/></div>:(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(b=>(
            <div key={b.id||b._id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div className="avatar-placeholder" style={{width:42,height:42,fontSize:16,background:'rgba(200,241,53,.1)',color:'var(--lime)',flexShrink:0}}>{b.user?.name?.[0]}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{b.user?.name}</div>
                    <div style={{fontSize:12,color:'var(--t3)'}}>{b.user?.email}</div>
                    <div style={{fontSize:13,color:'var(--t2)',marginTop:2}}>
                      📅 {new Date(b.sessionDate).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})} · ⏰ {b.startTime}
                      {b.sessionType && <span style={{marginLeft:8,color:'var(--t3)',fontSize:11}}>· {b.sessionType.replace(/_/g,' ')}</span>}
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><SB s={b.status}/><span style={{fontWeight:700,color:'var(--success)',fontSize:14}}>₹{b.amount}</span></div>
              </div>
              {b.notes&&<div style={{marginTop:10,padding:'8px 12px',background:'var(--s2)',borderRadius:'var(--r-sm)',fontSize:13,color:'var(--t2)'}}>📝 {b.notes}</div>}
              {b.status==='pending'&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
                  <button className="btn btn-primary btn-sm flex-1" onClick={()=>updateStatus(b.id||b._id,'confirmed')}>✓ Confirm</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>updateStatus(b.id||b._id,'cancelled')}>✕ Decline</button>
                </div>
              )}
              {b.status==='confirmed'&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',gap:8,flexWrap:'wrap'}}>
                  {b.sessionType === 'online_video' && (
                    <button className="btn btn-sm"
                      style={{ background:'rgba(200,241,53,0.12)', border:'1.5px solid rgba(200,241,53,0.3)', color:'var(--lime)', fontWeight:700, padding:'6px 14px' }}
                      onClick={() => setActiveCall({ bookingId: b.id || b._id, displayName: user?.name })}>
                      📹 Join Video Call
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={()=>updateStatus(b.id||b._id,'completed')}>Mark Complete</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>updateStatus(b.id||b._id,'cancelled')}>Cancel</button>
                </div>
              )}
            </div>
          ))}
          {activeCall && (
            <VideoCall
              bookingId={activeCall.bookingId}
              displayName={activeCall.displayName}
              onClose={() => setActiveCall(null)}
            />
          )}
          {filtered.length===0&&<div className="card" style={{textAlign:'center',padding:60}}><div style={{fontSize:40,marginBottom:12}}>📅</div><p style={{color:'var(--t3)',fontSize:14}}>No {filter!=='all'?filter:''} bookings</p></div>}
        </div>
      )}
    </div>
  );
};

const MealItemRow = ({ item, mi, ii, updateItem, removeItem }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 650);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 650);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const inputStyle = { fontSize: 13, padding: '6px 8px' };

  if (isMobile) {
    return (
      <div style={{ background: 'var(--s1)', padding: 12, borderRadius: 8, marginBottom: 12, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)' }}>ITEM {ii + 1}</span>
          <button type="button" onClick={() => removeItem(mi, ii)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ fontSize: 10 }}>Food</label>
            <input className="form-input" style={inputStyle} value={item.name} onChange={e => updateItem(mi, ii, 'name', e.target.value)} placeholder="Food name"/>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ fontSize: 10 }}>Qty</label>
            <input className="form-input" style={inputStyle} value={item.quantity} onChange={e => updateItem(mi, ii, 'quantity', e.target.value)} placeholder="Quantity"/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 10 }}>kcal</label>
            <input className="form-input" style={inputStyle} type="number" value={item.calories || ''} onChange={e => updateItem(mi, ii, 'calories', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 10 }}>P(g)</label>
            <input className="form-input" style={inputStyle} type="number" value={item.protein || ''} onChange={e => updateItem(mi, ii, 'protein', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 10 }}>C(g)</label>
            <input className="form-input" style={inputStyle} type="number" value={item.carbs || ''} onChange={e => updateItem(mi, ii, 'carbs', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 10 }}>F(g)</label>
            <input className="form-input" style={inputStyle} type="number" value={item.fat || ''} onChange={e => updateItem(mi, ii, 'fat', e.target.value)}/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 70px 55px 55px 55px 24px', gap: 5, marginBottom: 5, alignItems: 'center' }}>
      <input className="form-input" style={inputStyle} placeholder="Food" value={item.name} onChange={e => updateItem(mi, ii, 'name', e.target.value)}/>
      <input className="form-input" style={inputStyle} placeholder="Qty" value={item.quantity} onChange={e => updateItem(mi, ii, 'quantity', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="kcal" value={item.calories || ''} onChange={e => updateItem(mi, ii, 'calories', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="P" value={item.protein || ''} onChange={e => updateItem(mi, ii, 'protein', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="C" value={item.carbs || ''} onChange={e => updateItem(mi, ii, 'carbs', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="F" value={item.fat || ''} onChange={e => updateItem(mi, ii, 'fat', e.target.value)}/>
      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0, fontSize: 15 }} onClick={() => removeItem(mi, ii)}>✕</button>
    </div>
  );
};

/* ── NUTRITION ── */
export const TrainerNutrition = () => {
  const [plans,setPlans]=useState([]);
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showCreate,setShowCreate]=useState(false);
  const [form,setForm]=useState({title:'',description:'',goal:'weight_loss',caloriesPerDay:2000,proteinGrams:150,carbsGrams:200,fatGrams:65});
  const [saving,setSaving]=useState(false);
  // Meal builder state
  const [meals,setMeals]=useState([{name:'',time:'',items:[{name:'',quantity:'',calories:0,protein:0,carbs:0,fat:0}]}]);
  const [detailedMode,setDetailedMode]=useState(false);
  const load=async()=>{setLoading(true);try{const[pr,cr]=await Promise.all([api.get('/trainers/my-nutrition'),api.get('/trainers/my-clients')]);if(pr.data.success)setPlans(pr.data.plans);if(cr.data.success)setClients(cr.data.clients);}catch{}setLoading(false);};
  useEffect(() => { load(); }, []);
  // Meal builder helpers
  const TRAINER_TEMPLATES={weight_loss:[{name:'Breakfast',time:'07:30',items:[{name:'Oats + banana',quantity:'60g oats, 1 banana',calories:320,protein:12,carbs:58,fat:5}]},{name:'Lunch',time:'13:00',items:[{name:'Dal + sabzi + 2 roti',quantity:'standard',calories:430,protein:20,carbs:64,fat:8}]},{name:'Dinner',time:'19:30',items:[{name:'Grilled chicken/paneer + salad',quantity:'150g protein',calories:280,protein:38,carbs:10,fat:8}]}],muscle_gain:[{name:'Breakfast',time:'07:00',items:[{name:'Eggs + toast + milk',quantity:'4 eggs, 2 toast',calories:580,protein:40,carbs:48,fat:18}]},{name:'Pre-Workout',time:'11:00',items:[{name:'Banana + peanut butter',quantity:'2 banana + 2 tbsp',calories:380,protein:9,carbs:60,fat:14}]},{name:'Lunch',time:'13:30',items:[{name:'Chicken rice bowl',quantity:'200g chicken, 200g rice',calories:680,protein:52,carbs:76,fat:12}]},{name:'Dinner',time:'20:00',items:[{name:'Paneer/fish + roti',quantity:'200g + 3 roti',calories:560,protein:38,carbs:56,fat:16}]}]};
  const applyTemplate=goal=>{const t=TRAINER_TEMPLATES[goal]||TRAINER_TEMPLATES.weight_loss;setMeals(JSON.parse(JSON.stringify(t)));setDetailedMode(true);};
  const updateMeal=(mi,f,v)=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,[f]:v}:m));
  const addMeal=()=>setMeals(ms=>[...ms,{name:'',time:'',items:[{name:'',quantity:'',calories:0,protein:0,carbs:0,fat:0}]}]);
  const removeMeal=mi=>setMeals(ms=>ms.filter((_,i)=>i!==mi));
  const updateItem=(mi,ii,f,v)=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,items:m.items.map((it,j)=>j===ii?{...it,[f]:['calories','protein','carbs','fat'].includes(f)?parseInt(v)||0:v}:it)}:m));
  const addItem=mi=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,items:[...m.items,{name:'',quantity:'',calories:0,protein:0,carbs:0,fat:0}]}:m));
  const removeItem=(mi,ii)=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,items:m.items.filter((_,j)=>j!==ii)}:m));
  const mealTotals = meals.reduce((acc, m) => {
    (m.items || []).forEach(it => {
      acc.cal += it.calories || 0;
      acc.prot += it.protein || 0;
      acc.carbs += it.carbs || 0;
      acc.fat += it.fat || 0;
    }); return acc;
  }, { cal: 0, prot: 0, carbs: 0, fat: 0 });

  const createPlan = async () => {
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    const validMeals = detailedMode ? meals.filter(m => m.name?.trim()) : [];
    const payload = { ...form, isPublic: false, meals: validMeals };

    // Auto-calculate macros if they are zero / default
    if (detailedMode && validMeals.length > 0 && (form.caloriesPerDay === 0 || form.caloriesPerDay === 2000)) {
      payload.caloriesPerDay = mealTotals.cal;
      payload.proteinGrams = mealTotals.prot;
      payload.carbsGrams = mealTotals.carbs;
      payload.fatGrams = mealTotals.fat;
    }

    try {
      const res = await api.post('/nutrition', payload);
      if (res.data?.success) {
        toast.success('Plan created successfully!');
        setShowCreate(false);
        setDetailedMode(false);
        setMeals([{ name: '', time: '', items: [{ name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fat: 0 }] }]);
        load();
      } else {
        throw new Error(res.data?.message || 'Failed');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };
  const assignPlan=async(planId,userId)=>{try{await api.post('/trainers/assign-nutrition',{planId,userId});toast.success('Plan assigned!');}catch{toast.error('Failed');}};
  return (
    <div>
      <PH title="Nutrition" hl="Plans" sub="Create and assign meal plans to clients" action={<button className="btn btn-orange" onClick={()=>setShowCreate(s=>!s)}>+ Create Plan</button>}/>
      {showCreate&&(
        <div className="card" style={{marginBottom:18,borderColor:'var(--orange)'}}>
          <h3 style={{fontWeight:700,fontSize:15,marginBottom:16}}>New Nutrition Plan</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14}}>
            <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. High Protein Fat Loss"/></div>
            <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description…"/></div>
            <div className="form-group"><label className="form-label">Goal</label><select className="form-input" value={form.goal} onChange={e=>setForm(f=>({...f,goal:e.target.value}))}><option value="weight_loss">Weight Loss</option><option value="muscle_gain">Muscle Gain</option><option value="maintenance">Maintenance</option><option value="endurance">Endurance</option></select></div>
            {[['Daily Calories','caloriesPerDay','kcal'],['Daily Protein','proteinGrams','grams'],['Daily Carbs','carbsGrams','grams'],['Daily Fat','fatGrams','grams']].map(([label,field,unit])=>(
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <div style={{ position:'relative' }}>
                  <input className="form-input" type="number" value={form[field]} onChange={e=>setForm(f=>({...f,[field]:parseInt(e.target.value)||0}))} style={{ paddingRight: 45 }}/>
                  <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'var(--t3)', pointerEvents:'none' }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Meal builder */}
          <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid var(--border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontWeight:700,fontSize:13}}>🍽 Meal Breakdown <span style={{fontWeight:400,fontSize:11,color:'var(--t3)'}}>(optional)</span></span>
              <div style={{display:'flex',gap:8}}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={()=>applyTemplate(form.goal)}>Use Template</button>
                <button type="button" className={`btn btn-sm ${detailedMode?'btn-orange':'btn-ghost'}`} onClick={()=>setDetailedMode(d=>!d)}>{detailedMode?'Hide':'Add Meals'}</button>
              </div>
            </div>
            {detailedMode&&(<>
              {meals.some(m=>m.name)&&(
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', padding:'6px 10px', background:'rgba(255,95,31,.08)', borderRadius:6, marginBottom:10, fontSize:12 }}>
                  <span style={{ color:'var(--orange)', fontWeight:700 }}>Total: {mealTotals.cal} kcal</span>
                  <span style={{ color:'var(--lime)' }}>P:{mealTotals.prot}g</span>
                  <span style={{ color:'var(--info)' }}>C:{mealTotals.carbs}g</span>
                  <span style={{ color:'var(--warning)' }}>F:{mealTotals.fat}g</span>
                </div>
              )}
              {meals.map((meal,mi)=>(
                <div key={mi} style={{border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:12,marginBottom:10}}>
                  <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap',alignItems:'center'}}>
                    <input className="form-input" style={{flex:2,minWidth:120}} placeholder="Meal (e.g. Breakfast)" value={meal.name} onChange={e=>updateMeal(mi,'name',e.target.value)}/>
                    <input className="form-input" type="time" style={{width:110}} value={meal.time} onChange={e=>updateMeal(mi,'time',e.target.value)}/>
                    {meals.length>1&&<button type="button" className="btn btn-danger btn-sm" onClick={()=>removeMeal(mi)}>✕</button>}
                  </div>
                  {/* Food items headers */}
                  {window.innerWidth >= 650 && meal.items.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 70px 55px 55px 55px 24px', gap: 5, marginBottom: 4, padding: '0 4px' }}>
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>FOOD</span>
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>QTY</span>
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>KCAL</span>
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>P(g)</span>
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>C(g)</span>
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>F(g)</span>
                      <span></span>
                    </div>
                  )}
                  {meal.items.map((item,ii)=>(
                    <MealItemRow key={ii} item={item} mi={mi} ii={ii} updateItem={updateItem} removeItem={removeItem} />
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" style={{marginTop:4}} onClick={()=>addItem(mi)}>+ item</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={addMeal}>+ Add meal</button>
            </>)}
          </div>

          <div style={{display:'flex',gap:8,marginTop:16}}><button className="btn btn-primary flex-1" onClick={createPlan} disabled={saving||!form.title}>{saving?'Creating…':'Create Plan'}</button><button className="btn btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button></div>
        </div>
      )}
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner spinner-lg"/></div>:
       plans.length===0?<div className="card" style={{textAlign:'center',padding:60}}><div style={{fontSize:40,marginBottom:12}}>🥗</div><p style={{color:'var(--t3)',fontSize:14}}>No plans yet.</p></div>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {plans.map(p=>(
            <div key={p.id||p._id} className="card">
              <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{p.title}</div>
              <div style={{fontSize:13,color:'var(--t2)',marginBottom:10}}>{p.description}</div>
              <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                <span style={{fontSize:12,color:'var(--orange)'}}>{p.caloriesPerDay} kcal</span>
                <span style={{fontSize:12,color:'var(--lime)'}}>P:{p.proteinGrams}g</span>
                <span style={{fontSize:12,color:'var(--info)'}}>C:{p.carbsGrams}g</span>
                <span style={{fontSize:12,color:'var(--warning)'}}>F:{p.fatGrams}g</span>
              </div>
              {clients.length>0&&<div className="form-group"><label className="form-label">Assign to client</label><select className="form-input" defaultValue="" onChange={e=>{if(e.target.value){assignPlan(p.id||p._id,e.target.value);e.target.value='';}}}>
                <option value="" disabled>Select client…</option>
                {clients.map(c=><option key={c.id||c._id} value={c.id||c._id}>{c.name}</option>)}
              </select></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── WORKOUTS ── */
export const TrainerWorkouts = () => {
  const [workouts,setWorkouts]=useState([]);
  const [filter,setFilter]=useState('all');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.get('/workouts').then(({data})=>{if(data.success)setWorkouts(data.workouts);}).catch(()=>{}).finally(()=>setLoading(false));}, []);
  const catColors={hiit:'var(--error)',strength:'var(--lime)',cardio:'var(--info)',yoga:'var(--warning)',flexibility:'var(--success)',recovery:'var(--t2)'};
  const filtered=filter==='all'?workouts:workouts.filter(w=>w.category===filter);
  return (
    <div>
      <PH title="Workout" hl="Library" sub="Browse and share workouts with clients"/>
      <div style={{display:'flex',gap:6,marginBottom:18,flexWrap:'wrap'}}>
        {['all','strength','hiit','cardio','yoga','flexibility'].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-orange':'btn-ghost'}`} style={{textTransform:'capitalize'}}>{f}</button>))}
      </div>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner spinner-lg"/></div>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {filtered.map(w=>(
            <div key={w.id||w._id} className="card card-hover">
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:catColors[w.category]||'var(--t2)',textTransform:'uppercase',letterSpacing:'.06em'}}>{w.category}</span><span className="badge badge-neutral" style={{textTransform:'capitalize',fontSize:10}}>{w.difficulty}</span></div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{w.title}</div>
              <div style={{fontSize:13,color:'var(--t2)',marginBottom:10,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',lineHeight:1.5}}>{w.description}</div>
              <div style={{display:'flex',gap:12,fontSize:12,color:'var(--t3)'}}><span>⏱ {w.duration} min</span><span>🔥 ~{w.caloriesBurn} cal</span><span>💪 {(w.exercises||[]).length} ex</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── ANALYTICS ── */
export const TrainerAnalytics = () => {
  const { user } = useAuthStore();
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.get('/trainers/dashboard').then(({data})=>{if(data.success)setStats(data.data);}).catch(()=>{}).finally(()=>setLoading(false));}, []);
  const t=stats?.trainer||user||{};
  const earningsData=[{month:'Oct',earnings:28000},{month:'Nov',earnings:32000},{month:'Dec',earnings:41000},{month:'Jan',earnings:38000},{month:'Feb',earnings:45000},{month:'Mar',earnings:stats?.weeklyEarnings?stats.weeklyEarnings*4:42000}];
  return (
    <div>
      <PH title="My" hl="Analytics" sub="Performance metrics and earnings overview"/>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner spinner-lg"/></div>:(
        <>
          <div className="grid-stats" style={{marginBottom:18}}>
            {[['💰','Total Earnings',`₹${(t.totalEarnings||0).toLocaleString()}`,'var(--success)'],['👥','Clients',t.clients?.length||0,'var(--lime)'],['📅','Sessions',t.totalSessions||0,'var(--info)'],['⭐','Rating',`${(t.rating||0).toFixed(1)}/5`,'var(--warning)'],['💳','This Week',`₹${(stats?.weeklyEarnings||0).toLocaleString()}`,'var(--orange)']].map(([icon,label,val,color],i)=>(
              <div key={i} className="stat-card"><div style={{width:40,height:40,borderRadius:'var(--r-md)',background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{icon}</div><div style={{fontWeight:800,fontSize:22,color,lineHeight:1}}>{val}</div><div style={{fontSize:12,color:'var(--t2)'}}>{label}</div></div>
            ))}
          </div>
          <div className="card"><h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Monthly Earnings</h3>
            <ResponsiveContainer width="100%" height={200}><BarChart data={earningsData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/><XAxis dataKey="month" tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'var(--t3)',fontSize:11}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'var(--s2)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} formatter={v=>[`₹${v.toLocaleString()}`,'Earnings']}/><Bar dataKey="earnings" fill="var(--orange)" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

/* ── PROFILE ── */
export const TrainerProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [form,setForm]=useState({name:'',phone:'',bio:'',experience:0,sessionRate:500,monthlyRate:3000,upiId:''});
  const [saving,setSaving]=useState(false);
  useEffect(()=>{ if(user) setForm({name:user.name||'',phone:user.phone||'',bio:user.bio||'',experience:user.experience||0,sessionRate:user.sessionRate||500,monthlyRate:user.monthlyRate||3000,upiId:user.upiId||''}); },[user]);
  const save=async()=>{setSaving(true);try{const{data}=await api.put('/trainers/profile',form);if(data.success){updateUser(form);toast.success('Profile updated!');}}catch{toast.error('Failed');}setSaving(false);};
  return (
    <div style={{maxWidth:700}}>
      <PH title="My" hl="Profile" sub="Update your trainer information"/>
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
          <div className="avatar-placeholder" style={{width:56,height:56,fontSize:22,background:'rgba(255,95,31,.12)',color:'var(--orange)',flexShrink:0}}>{user?.name?.[0]}</div>
          <div><div style={{fontWeight:700,fontSize:17}}>{user?.name}</div><div style={{fontSize:13,color:'var(--t2)'}}>{user?.email}</div>
            <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
              <span className={`badge ${user?.isApproved?'badge-success':'badge-warning'}`}>{user?.isApproved?'✓ Approved':'Pending'}</span>
              <span className="badge badge-neutral">⭐ {(user?.rating||0).toFixed(1)}</span>
              <span className="badge badge-neutral">{user?.totalSessions||0} sessions</span>
            </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14}}>
          {[['Full Name','name','text'],['Phone','phone','tel'],['Experience (years)','experience','number'],['Session Rate (₹)','sessionRate','number'],['Monthly Rate (₹)','monthlyRate','number'],['UPI ID (for payments)','upiId','text']].map(([label,field,type])=>(
            <div key={field} className="form-group"><label className="form-label">{label}</label><input className="form-input" type={type} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}/></div>
          ))}
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Bio</label><textarea className="form-input" rows={4} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Tell clients about your expertise…"/></div>
        </div>
        <button className="btn btn-primary btn-full" style={{marginTop:16}} onClick={save} disabled={saving}>{saving?'Saving…':'Save Profile'}</button>
      </div>
      {user?.specializations?.length>0&&<div className="card"><h3 style={{fontWeight:700,fontSize:14,marginBottom:12}}>Specializations</h3><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{user.specializations.map(s=>(<span key={s} className="badge badge-neutral" style={{textTransform:'capitalize',fontSize:12}}>{s.replace(/_/g,' ')}</span>))}</div></div>}
    </div>
  );
};

/* ── CHAT ── */
export const TrainerChat = () => {
  const { user } = useAuthStore();
  const [convos,setConvos]=useState([]);
  const [clients,setClients]=useState([]);
  const [active,setActive]=useState(null);
  const [messages,setMessages]=useState([]);
  const [newMsg,setNewMsg]=useState('');
  const [loading,setLoading]=useState(true);
  const endRef=useRef(null);
  useEffect(()=>{
    Promise.all([
      api.get('/chat/conversations'),
      api.get('/trainers/my-clients'),
    ]).then(([cr,cl])=>{
      if(cr.data.success){setConvos(cr.data.conversations);if(cr.data.conversations.length)setActive(cr.data.conversations[0]);}
      if(cl.data.success)setClients(cl.data.clients);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  useEffect(()=>{ if(!active)return; api.get(`/chat/${active.id||active._id}/messages`).then(({data})=>{if(data.success)setMessages(data.messages);}).catch(()=>{}); },[active]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);
  const send=async()=>{
    if(!newMsg.trim()||!active)return;
    const other=(active.participants||[]).find(p=>p.participantId!==user?.id);
    try{const{data}=await api.post('/chat/send',{conversationId:active.id||active._id,recipientId:other?.participantId,recipientModel:other?.participantModel||'User',content:newMsg.trim()});if(data.success){setMessages(m=>[...m,data.message]);setNewMsg('');}}catch{toast.error('Failed to send');}
  };
  const otherName=c=>(c.participants||[]).find(p=>p.participantId!==user?.id)?.name||'Client';
  return (
    <div style={{display:'flex',flexDirection:'column'}}>
      <PH title="Messages" sub="Chat with your clients"/>
      <div className="chat-layout" style={{display:'flex',gap:14,minHeight:520,height:'calc(100vh - 220px)'}}>
        <div className="chat-sidebar" style={{width:220,flexShrink:0,display:'flex',flexDirection:'column',gap:6,overflowY:'auto'}}>
          {loading?<div className="spinner" style={{margin:'20px auto'}}/>:
           convos.length>0?convos.map(c=>{const a=(active?.id||active?._id)===(c.id||c._id);return(
            <div key={c.id||c._id} onClick={()=>setActive(c)} style={{padding:'11px 12px',borderRadius:'var(--r-md)',background:a?'rgba(255,95,31,.08)':'var(--s1)',border:`1px solid ${a?'var(--orange)':'var(--border)'}`,cursor:'pointer',transition:'all .13s'}}>
              <div style={{fontWeight:600,fontSize:13}}>{otherName(c)}</div>
              <div style={{fontSize:12,color:'var(--t3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.lastMessage?.content||'No messages'}</div>
            </div>
           );}):(<div>
              <div style={{fontSize:12,color:'var(--t3)',padding:'8px 0',marginBottom:8}}>Start a conversation:</div>
              {clients.map(c=>(
                <div key={c.id||c._id} style={{padding:'9px 10px',borderRadius:'var(--r-md)',background:'var(--s2)',border:'1px solid var(--border)',cursor:'pointer',marginBottom:5,fontSize:13,fontWeight:500}}
                  onClick={async()=>{
                    try{
                      const{data}=await api.post('/chat/send',{recipientId:c.id||c._id,recipientModel:'User',content:`Hi ${c.name}, your trainer here! Feel free to message me anytime.`});
                      if(data.success){
                        const r=await api.get('/chat/conversations');
                        if(r.data.success){setConvos(r.data.conversations);const nc=r.data.conversations.find(x=>x.id===data.conversationId||x._id===data.conversationId);if(nc)setActive(nc);}
                      }
                    }catch{toast.error('Failed');}
                  }}>
                  {c.name}
                </div>
              ))}
              {clients.length===0&&<div style={{fontSize:12,color:'var(--t3)'}}>No clients assigned yet</div>}
            </div>)
          }
        </div>
        <div className="card chat-window" style={{flex:1,display:'flex',flexDirection:'column',padding:0,overflow:'hidden',minWidth:0}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:600,fontSize:14}}>{active?otherName(active):'Select a conversation'}</div>
          <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
            {messages.map(m=>{const mine=m.senderId===user?.id;return(
              <div key={m.id||m._id} style={{display:'flex',justifyContent:mine?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'72%',padding:'10px 14px',borderRadius:mine?'14px 14px 4px 14px':'14px 14px 14px 4px',background:mine?'var(--orange)':'var(--s2)',color:mine?'#fff':'var(--t1)',fontSize:14,lineHeight:1.5}}>
                  {m.content}<div style={{fontSize:11,opacity:.6,marginTop:3,textAlign:'right'}}>{new Date(m.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            );})}
            {messages.length===0&&active&&<div style={{textAlign:'center',color:'var(--t3)',padding:40,fontSize:14}}>No messages yet</div>}
            <div ref={endRef}/>
          </div>
          {active&&(<div style={{padding:'10px 14px',borderTop:'1px solid var(--border)',display:'flex',gap:8}}><input className="form-input" placeholder="Type a message…" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} style={{flex:1}}/><button className="btn btn-orange" onClick={send} disabled={!newMsg.trim()}>Send</button></div>)}
        </div>
      </div>
    </div>
  );
};
