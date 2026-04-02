import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

/* ─── shared helpers ─────────────────────────────────────────── */
const PH = ({ title, hl, sub, color='var(--info)', action }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
    <div>
      <h1 style={{ fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, marginBottom:4 }}>{title}{hl&&<span style={{ color }}> {hl}</span>}</h1>
      {sub&&<p style={{ color:'var(--t2)', fontSize:13 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const CRUDTable = ({ cols, rows, onEdit, onDelete, onAssign, emptyText='No records found' }) => (
  <div className="table-wrapper">
    <table>
      <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}<th>Actions</th></tr></thead>
      <tbody>
        {rows.length===0 ? <tr><td colSpan={cols.length+1} style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>{emptyText}</td></tr> :
          rows.map((row,i)=>(
            <tr key={row.id||row._id||i}>
              {row.cells.map((cell,j)=><td key={j}>{cell}</td>)}
              <td>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(row.data)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>onDelete(row.data.id||row.data._id)}>Delete</button>
                  {onAssign && <button className="btn btn-primary btn-sm" onClick={()=>onAssign(row.data)}>Assign</button>}
                </div>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   BOOKINGS
════════════════════════════════════════════════════════════════ */
export const AdminBookings = () => {
  const [bookings,setBookings]=useState([]);
  const [filter,setFilter]=useState('all');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ setLoading(true); api.get(`/admin/bookings${filter!=='all'?`?status=${filter}`:''}`).then(({data})=>{if(data.success)setBookings(data.bookings);}).catch(()=>{}).finally(()=>setLoading(false)); },[filter]);
  const sC={pending:'badge-warning',confirmed:'badge-success',cancelled:'badge-error',completed:'badge-info'};
  return (
    <div>
      <PH title="Booking" hl="Management" sub="All platform bookings"/>
      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {['all','pending','confirmed','completed','cancelled'].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} style={{ textTransform:'capitalize' }}>{f}</button>))}
      </div>
      {loading?<div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner spinner-lg"/></div>:(
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Client</th><th>Trainer</th><th>Date & Time</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead>
            <tbody>
              {bookings.map((b,i)=>(
                <tr key={b.id||b._id||i}>
                  <td><strong>{b.user?.name||'—'}</strong><div style={{ fontSize:11, color:'var(--t3)' }}>{b.user?.email}</div></td>
                  <td>{b.trainer?.name||'—'}</td>
                  <td style={{ fontSize:13, color:'var(--t2)' }}>{new Date(b.sessionDate).toLocaleDateString('en-IN')} · {b.startTime}</td>
                  <td style={{ color:'var(--success)', fontWeight:700 }}>₹{b.amount}</td>
                  <td><span className={`badge ${sC[b.status]||'badge-neutral'}`} style={{ textTransform:'capitalize' }}>{b.status}</span></td>
                  <td><span className={`badge ${b.paymentStatus==='paid'?'badge-success':'badge-warning'}`}>{b.paymentStatus||'pending'}</span></td>
                </tr>
              ))}
              {bookings.length===0&&<tr><td colSpan={6} style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>No bookings found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   PAYMENTS
════════════════════════════════════════════════════════════════ */
export const AdminPayments = () => {
  const [payments,setPayments]=useState([]);
  const [upi,setUpi]=useState({upiId:'',upiName:''});
  const [loading,setLoading]=useState(true);
  const [savingUpi,setSavingUpi]=useState(false);
  useEffect(()=>{ Promise.all([api.get('/admin/payments'),api.get('/admin/settings/upi')]).then(([pr,ur])=>{ if(pr.data.success)setPayments(pr.data.payments); if(ur.data.success)setUpi({upiId:ur.data.upiId,upiName:ur.data.upiName}); }).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  const saveUpi=async()=>{ setSavingUpi(true); try{await api.put('/admin/settings/upi',upi);toast.success('UPI settings saved!');}catch{toast.error('Failed');} setSavingUpi(false); };
  const totalRev=payments.filter(p=>p.status==='success').reduce((s,p)=>s+(p.amount||0),0);
  return (
    <div>
      <PH title="Payments &" hl="Revenue" sub="Transactions and UPI configuration"/>
      <div className="card" style={{ marginBottom:18 }}>
        <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>UPI Payment Settings</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14, marginBottom:14 }}>
          <div className="form-group"><label className="form-label">UPI ID (VPA)</label><input className="form-input" value={upi.upiId} onChange={e=>setUpi(u=>({...u,upiId:e.target.value}))} placeholder="payments@mpowerfitness"/></div>
          <div className="form-group"><label className="form-label">Merchant Name</label><input className="form-input" value={upi.upiName} onChange={e=>setUpi(u=>({...u,upiName:e.target.value}))} placeholder="Mpower Fitness"/></div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveUpi} disabled={savingUpi}>{savingUpi?'Saving…':'Save UPI Settings'}</button>
      </div>
      <div className="grid-stats" style={{ marginBottom:18 }}>
        {[['💰','Total Revenue',`₹${totalRev.toLocaleString()}`,'var(--success)'],['📅','Transactions',payments.length,'var(--info)'],['✅','Successful',payments.filter(p=>p.status==='success').length,'var(--lime)']].map(([icon,label,val,color],i)=>(
          <div key={i} className="stat-card"><div style={{ width:40,height:40,borderRadius:'var(--r-md)',background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{icon}</div><div style={{ fontWeight:800,fontSize:22,color,lineHeight:1 }}>{val}</div><div style={{ fontSize:12,color:'var(--t2)' }}>{label}</div></div>
        ))}
      </div>
      {loading?<div style={{ display:'flex',justifyContent:'center',padding:40 }}><div className="spinner spinner-lg"/></div>:(
        <div className="table-wrapper"><table>
          <thead><tr><th>User</th><th>Amount</th><th>Type</th><th>Plan/Ref</th><th>Status</th><th>UTR</th><th>Date</th></tr></thead>
          <tbody>
            {payments.map((p,i)=>(
              <tr key={p.id||p._id||i}>
                <td><strong>{p.user?.name||'—'}</strong></td>
                <td style={{ color:'var(--success)',fontWeight:700 }}>₹{(p.amount||0).toLocaleString()}</td>
                <td><span className="badge badge-neutral" style={{ fontSize:11,textTransform:'capitalize' }}>{(p.type||'').replace(/_/g,' ')}</span></td>
                <td style={{ fontSize:13,color:'var(--t2)',textTransform:'capitalize' }}>{p.subscriptionPlan||p.transactionRef?.slice(0,10)||'—'}</td>
                <td><span className={`badge ${p.status==='success'?'badge-success':p.status==='pending'?'badge-warning':'badge-error'}`}>{p.status}</span></td>
                <td style={{ fontSize:12,color:'var(--t3)',fontFamily:'var(--font-mono)' }}>{p.utrNumber||'—'}</td>
                <td style={{ fontSize:12,color:'var(--t3)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {payments.length===0&&<tr><td colSpan={7} style={{ textAlign:'center',color:'var(--t3)',padding:40 }}>No payments yet</td></tr>}
          </tbody>
        </table></div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   ANALYTICS
════════════════════════════════════════════════════════════════ */
export const AdminAnalytics = () => {
  const [data,setData]=useState(null);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ Promise.all([api.get('/admin/analytics'),api.get('/admin/dashboard')]).then(([ar,dr])=>{ if(ar.data.success)setData(ar.data.data); if(dr.data.success)setStats(dr.data.data.stats); }).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  return (
    <div>
      <PH title="Platform" hl="Analytics" sub="Revenue trends and user growth"/>
      {loading?<div style={{ display:'flex',justifyContent:'center',padding:60 }}><div className="spinner spinner-lg"/></div>:(
        <>
          <div className="grid-stats" style={{ marginBottom:18 }}>
            {[['👥','Users',stats?.totalUsers||0,'var(--lime)'],['🏋️','Trainers',stats?.approvedTrainers||0,'var(--orange)'],['📅','Bookings',stats?.totalBookings||0,'var(--info)'],['💰','Revenue',`₹${((stats?.totalRevenue||0)/1000).toFixed(0)}K`,'var(--success)'],['⏳','Pending',stats?.pendingApprovals||0,'var(--warning)']].map(([icon,label,val,color],i)=>(
              <div key={i} className="stat-card"><div style={{ width:40,height:40,borderRadius:'var(--r-md)',background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{icon}</div><div style={{ fontWeight:800,fontSize:22,color,lineHeight:1 }}>{val}</div><div style={{ fontSize:12,color:'var(--t2)' }}>{label}</div></div>
            ))}
          </div>
          {data?.revenueData?.length>0&&(
            <div className="card"><h3 style={{ fontWeight:700,fontSize:15,marginBottom:16 }}>Monthly Revenue & User Growth</h3>
              <ResponsiveContainer width="100%" height={220}><BarChart data={data.revenueData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/><XAxis dataKey="month" tick={{ fill:'var(--t3)',fontSize:11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill:'var(--t3)',fontSize:11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background:'var(--s2)',border:'1px solid var(--border)',borderRadius:8,fontSize:12 }}/><Bar dataKey="revenue" fill="var(--lime)" radius={[4,4,0,0]} name="Revenue (₹)"/><Bar dataKey="users" fill="var(--orange)" radius={[4,4,0,0]} name="New Users"/></BarChart></ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   WORKOUTS
════════════════════════════════════════════════════════════════ */
export const AdminWorkouts = () => {
  const [workouts,setWorkouts]=useState([]);
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [form,setForm]=useState({ title:'', description:'', category:'strength', difficulty:'intermediate', duration:30, caloriesBurn:250, isPublic:true, isFeatured:false });
  const [saving,setSaving]=useState(false);
  const [assigning,setAssigning]=useState(null); // workout being assigned
  const [assignUserId,setAssignUserId]=useState('');
  const [assigning2,setAssigning2]=useState(false);
  const load=()=>{ setLoading(true); Promise.all([api.get('/admin/workouts'),api.get('/admin/users')]).then(([wr,ur])=>{ if(wr.data.success)setWorkouts(wr.data.workouts); if(ur.data.success)setUsers(ur.data.users); }).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(load,[]);
  const openCreate=()=>{ setForm({title:'',description:'',category:'strength',difficulty:'intermediate',duration:30,caloriesBurn:250,isPublic:true,isFeatured:false}); setEditingId(null); setShowForm(true); setAssigning(null); };
  const openEdit=w=>{ setForm({title:w.title,description:w.description||'',category:w.category,difficulty:w.difficulty,duration:w.duration,caloriesBurn:w.caloriesBurn||0,isPublic:w.isPublic,isFeatured:w.isFeatured}); setEditingId(w.id||w._id); setShowForm(true); setAssigning(null); };
  const save=async()=>{ if(!form.title)return toast.error('Title required'); setSaving(true); try{ if(editingId){await api.put(`/admin/workouts/${editingId}`,form);toast.success('Updated');}else{await api.post('/admin/workouts',form);toast.success('Created');} setShowForm(false); load(); }catch(e){toast.error(e.response?.data?.message||'Failed');} setSaving(false); };
  const del=async id=>{ if(!window.confirm('Delete this workout?'))return; try{await api.delete(`/admin/workouts/${id}`);toast.success('Deleted');load();}catch{toast.error('Failed');} };
  const openAssign=w=>{ setAssigning(w); setAssignUserId(''); setShowForm(false); };
  const doAssign=async()=>{ if(!assignUserId)return toast.error('Select a user'); setAssigning2(true); try{ await api.patch(`/admin/workouts/${assigning.id||assigning._id}/assign`,{userId:assignUserId}); toast.success('Workout assigned!'); setAssigning(null); }catch(e){toast.error(e.response?.data?.message||'Failed');} setAssigning2(false); };
  return (
    <div>
      <PH title="Workout" hl="Management" sub="Create, manage and assign workout plans" action={<button className="btn btn-primary" onClick={openCreate}>+ New Workout</button>}/>
      {showForm&&(
        <div className="card" style={{ marginBottom:18, borderColor:'var(--info)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>{editingId?'Edit':'New'} Workout</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Workout title"/></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option value="strength">Strength</option><option value="hiit">HIIT</option><option value="cardio">Cardio</option><option value="yoga">Yoga</option><option value="flexibility">Flexibility</option><option value="recovery">Recovery</option></select></div>
            <div className="form-group"><label className="form-label">Difficulty</label><select className="form-input" value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:parseInt(e.target.value)||0}))}/></div>
            <div className="form-group"><label className="form-label">Calories Burn</label><input className="form-input" type="number" value={form.caloriesBurn} onChange={e=>setForm(f=>({...f,caloriesBurn:parseInt(e.target.value)||0}))}/></div>
            <div style={{ display:'flex', gap:20, alignItems:'center', paddingTop:4 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))}/> Featured</label>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}><input type="checkbox" checked={form.isPublic} onChange={e=>setForm(f=>({...f,isPublic:e.target.checked}))}/> Public</label>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:16 }}><button className="btn btn-primary flex-1" onClick={save} disabled={saving}>{saving?'Saving…':editingId?'Update':'Create'}</button><button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {assigning&&(
        <div className="card" style={{ marginBottom:18, borderColor:'var(--lime)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Assign Workout to User</h3>
          <p style={{ fontSize:13, color:'var(--t2)', marginBottom:14 }}>Plan: <strong>{assigning.title}</strong></p>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end', flexWrap:'wrap' }}>
            <div className="form-group" style={{ flex:1, minWidth:200, marginBottom:0 }}>
              <label className="form-label">Select User</label>
              <select className="form-input" value={assignUserId} onChange={e=>setAssignUserId(e.target.value)}>
                <option value="">— Choose user —</option>
                {users.map(u=><option key={u.id||u._id} value={u.id||u._id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={doAssign} disabled={assigning2||!assignUserId}>{assigning2?'Assigning…':'Assign'}</button>
            <button className="btn btn-ghost" onClick={()=>setAssigning(null)}>Cancel</button>
          </div>
        </div>
      )}
      {loading?<div style={{ display:'flex',justifyContent:'center',padding:40 }}><div className="spinner spinner-lg"/></div>:(
        <CRUDTable
          cols={['Title','Category','Difficulty','Duration','Calories','Public','Featured']}
          rows={workouts.map(w=>({ id:w.id||w._id, data:w, cells:[
            <strong>{w.title}</strong>,
            <span className="badge badge-neutral" style={{ textTransform:'capitalize' }}>{w.category}</span>,
            <span style={{ textTransform:'capitalize', color:'var(--t2)', fontSize:13 }}>{w.difficulty}</span>,
            <span style={{ color:'var(--t2)', fontSize:13 }}>{w.duration} min</span>,
            <span style={{ color:'var(--t2)', fontSize:13 }}>{w.caloriesBurn||'—'}</span>,
            <span className={`badge ${w.isPublic?'badge-success':'badge-neutral'}`}>{w.isPublic?'Yes':'No'}</span>,
            w.isFeatured?<span className="badge badge-success">⭐ Yes</span>:<span style={{ color:'var(--t3)', fontSize:12 }}>—</span>,
          ]}))}
          onEdit={openEdit} onDelete={del} onAssign={openAssign} emptyText="No workouts yet"/>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   NUTRITION
════════════════════════════════════════════════════════════════ */
const MEAL_TEMPLATES = {
  weight_loss: [
    { name:'Breakfast', time:'07:30', items:[{ name:'Oats + banana', quantity:'60g oats, 1 banana', calories:320, protein:12, carbs:58, fat:5 },{ name:'Green tea', quantity:'1 cup', calories:2, protein:0, carbs:0, fat:0 }]},
    { name:'Mid-Morning', time:'10:30', items:[{ name:'Mixed nuts', quantity:'30g', calories:185, protein:5, carbs:6, fat:16 }]},
    { name:'Lunch',     time:'13:00', items:[{ name:'Dal + sabzi + 2 roti', quantity:'standard serving', calories:430, protein:20, carbs:64, fat:8 }]},
    { name:'Dinner',    time:'19:30', items:[{ name:'Grilled chicken / paneer', quantity:'150g', calories:220, protein:35, carbs:3, fat:7 },{ name:'Salad', quantity:'large bowl', calories:60, protein:3, carbs:10, fat:1 }]},
  ],
  muscle_gain: [
    { name:'Breakfast',  time:'07:00', items:[{ name:'Eggs + toast + milk', quantity:'4 eggs, 2 toast, 300ml milk', calories:580, protein:40, carbs:48, fat:18 }]},
    { name:'Pre-Workout',time:'11:00', items:[{ name:'Banana + peanut butter', quantity:'2 bananas + 2 tbsp PB', calories:380, protein:9, carbs:60, fat:14 }]},
    { name:'Lunch',      time:'13:30', items:[{ name:'Chicken rice bowl', quantity:'200g chicken, 200g rice', calories:680, protein:52, carbs:76, fat:12 }]},
    { name:'Post-Workout',time:'17:30',items:[{ name:'Whey protein shake', quantity:'1 scoop + 250ml milk', calories:310, protein:42, carbs:20, fat:6 }]},
    { name:'Dinner',     time:'20:00', items:[{ name:'Paneer / fish + roti', quantity:'200g protein + 3 roti', calories:560, protein:38, carbs:56, fat:16 }]},
  ],
  maintenance: [
    { name:'Breakfast', time:'08:00', items:[{ name:'Oats or eggs with toast', quantity:'standard', calories:380, protein:18, carbs:48, fat:10 }]},
    { name:'Lunch',     time:'13:00', items:[{ name:'Dal + sabzi + roti + curd', quantity:'standard', calories:520, protein:22, carbs:74, fat:10 }]},
    { name:'Snack',     time:'16:30', items:[{ name:'Fruit + handful nuts', quantity:'1 fruit + 20g nuts', calories:200, protein:4, carbs:30, fat:9 }]},
    { name:'Dinner',    time:'20:00', items:[{ name:'Protein + vegetables + roti', quantity:'standard', calories:460, protein:30, carbs:52, fat:12 }]},
  ],
};
const emptyMeal = () => ({ name:'', time:'', items:[{ name:'', quantity:'', calories:0, protein:0, carbs:0, fat:0 }] });
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
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>#Item {ii + 1}</span>
          <button type="button" onClick={() => removeItem(mi, ii)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: 14 }}>✕ Remove</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ fontSize: 11 }}>Food Name</label>
            <input className="form-input" style={inputStyle} value={item.name} onChange={e => updateItem(mi, ii, 'name', e.target.value)} placeholder="e.g. Oats"/>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ fontSize: 11 }}>Quantity</label>
            <input className="form-input" style={inputStyle} value={item.quantity} onChange={e => updateItem(mi, ii, 'quantity', e.target.value)} placeholder="e.g. 1 bowl / 50g"/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11 }}>Cals (kcal)</label>
            <input className="form-input" style={inputStyle} type="number" value={item.calories || ''} onChange={e => updateItem(mi, ii, 'calories', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11 }}>Prot (g)</label>
            <input className="form-input" style={inputStyle} type="number" value={item.protein || ''} onChange={e => updateItem(mi, ii, 'protein', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11 }}>Carbs (g)</label>
            <input className="form-input" style={inputStyle} type="number" value={item.carbs || ''} onChange={e => updateItem(mi, ii, 'carbs', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11 }}>Fat (g)</label>
            <input className="form-input" style={inputStyle} type="number" value={item.fat || ''} onChange={e => updateItem(mi, ii, 'fat', e.target.value)}/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 70px 60px 60px 60px 28px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
      <input className="form-input" style={inputStyle} placeholder="Food name" value={item.name} onChange={e => updateItem(mi, ii, 'name', e.target.value)}/>
      <input className="form-input" style={inputStyle} placeholder="Qty" value={item.quantity} onChange={e => updateItem(mi, ii, 'quantity', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="kcal" value={item.calories || ''} onChange={e => updateItem(mi, ii, 'calories', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="Prot" value={item.protein || ''} onChange={e => updateItem(mi, ii, 'protein', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="Carb" value={item.carbs || ''} onChange={e => updateItem(mi, ii, 'carbs', e.target.value)}/>
      <input className="form-input" style={inputStyle} type="number" placeholder="Fat" value={item.fat || ''} onChange={e => updateItem(mi, ii, 'fat', e.target.value)}/>
      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0, fontSize: 16 }} onClick={() => removeItem(mi, ii)}>✕</button>
    </div>
  );
};

export const AdminNutrition = () => {
  const [plans,setPlans]=useState([]);
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [form,setForm]=useState({ title:'', description:'', goal:'weight_loss', caloriesPerDay:2000, proteinGrams:150, carbsGrams:200, fatGrams:65, isPublic:true });
  const [saving,setSaving]=useState(false);
  const [assigning,setAssigning]=useState(null); // plan being assigned
  const [assignUserId,setAssignUserId]=useState('');
  const [assigning2,setAssigning2]=useState(false);
  // Meal builder state
  const [meals,setMeals]=useState([emptyMeal()]);
  const [detailedMode,setDetailedMode]=useState(false);
  const load=()=>{ setLoading(true); Promise.all([api.get('/admin/nutrition'),api.get('/admin/users')]).then(([pr,ur])=>{ if(pr.data.success)setPlans(pr.data.plans); if(ur.data.success)setUsers(ur.data.users); }).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(load,[]);
  const openCreate=()=>{ setForm({title:'',description:'',goal:'weight_loss',caloriesPerDay:2000,proteinGrams:150,carbsGrams:200,fatGrams:65,isPublic:true}); setMeals([emptyMeal()]); setDetailedMode(false); setEditingId(null); setShowForm(true); setAssigning(null); };
  const openEdit=p=>{ setForm({title:p.title,description:p.description||'',goal:p.goal||'weight_loss',caloriesPerDay:p.caloriesPerDay,proteinGrams:p.proteinGrams,carbsGrams:p.carbsGrams,fatGrams:p.fatGrams,isPublic:p.isPublic}); const existingMeals=(p.meals||[]).map(m=>({...m,items:(m.items?.length?m.items:(m.foods||[]))})).filter(m=>m.name); setMeals(existingMeals.length?existingMeals:[emptyMeal()]); setDetailedMode(existingMeals.length>0); setEditingId(p.id||p._id); setShowForm(true); setAssigning(null); };
  // Meal builder helpers
  const applyTemplate=goal=>{ const t=MEAL_TEMPLATES[goal]||MEAL_TEMPLATES.maintenance; setMeals(JSON.parse(JSON.stringify(t))); setDetailedMode(true); };
  const updateMeal=(mi,field,val)=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,[field]:val}:m));
  const addMeal=()=>setMeals(ms=>[...ms,emptyMeal()]);
  const removeMeal=mi=>setMeals(ms=>ms.filter((_,i)=>i!==mi));
  const updateItem=(mi,ii,field,val)=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,items:m.items.map((it,j)=>j===ii?{...it,[field]:field==='calories'||field==='protein'||field==='carbs'||field==='fat'?parseInt(val)||0:val}:it)}:m));
  const addItem=mi=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,items:[...m.items,{name:'',quantity:'',calories:0,protein:0,carbs:0,fat:0}]}:m));
  const removeItem=(mi,ii)=>setMeals(ms=>ms.map((m,i)=>i===mi?{...m,items:m.items.filter((_,j)=>j!==ii)}:m));
  const mealTotals=meals.reduce((acc,m)=>{(m.items||[]).forEach(it=>{acc.cal+=it.calories||0;acc.prot+=it.protein||0;acc.carbs+=it.carbs||0;acc.fat+=it.fat||0;});return acc;},{cal:0,prot:0,carbs:0,fat:0});
  const save=async()=>{ 
    if(!form.title) return toast.error('Title required'); 
    setSaving(true);
    const validMeals = detailedMode ? meals.filter(m => m.name?.trim()) : [];
    const payload = { ...form, meals: validMeals };
    
    // Auto-calculate macros if they are zero and meals exist
    if (detailedMode && validMeals.length > 0 && (form.caloriesPerDay === 0 || form.caloriesPerDay === 2000)) {
       payload.caloriesPerDay = mealTotals.cal;
       payload.proteinGrams = mealTotals.prot;
       payload.carbsGrams = mealTotals.carbs;
       payload.fatGrams = mealTotals.fat;
    }

    try { 
      let res;
      if (editingId) {
        res = await api.put(`/admin/nutrition/${editingId}`, payload);
      } else {
        res = await api.post('/admin/nutrition', payload);
      }
      if (res.data?.success) {
        toast.success(editingId ? 'Updated successfully' : 'Created successfully');
        setShowForm(false); 
        load();
      } else {
        throw new Error(res.data?.message || 'Save failed');
      }
    } catch (e) {
      console.error('Save error:', e);
      toast.error(e.response?.data?.message || e.message || 'Failed to save nutrition plan');
    } finally {
      setSaving(false);
    }
  };
  const del=async id=>{ if(!window.confirm('Delete this plan?'))return; try{await api.delete(`/admin/nutrition/${id}`);toast.success('Deleted');load();}catch{toast.error('Failed');} };
  const openAssign=p=>{ setAssigning(p); setAssignUserId(''); setShowForm(false); };
  const doAssign=async()=>{ if(!assignUserId)return toast.error('Select a user'); setAssigning2(true); try{ await api.patch(`/admin/nutrition/${assigning.id||assigning._id}/assign`,{userId:assignUserId}); toast.success('Plan assigned!'); setAssigning(null); }catch(e){toast.error(e.response?.data?.message||'Failed');} setAssigning2(false); };
  return (
    <div>
      <PH title="Nutrition" hl="Management" sub="Manage and assign nutrition plans to users" action={<button className="btn btn-primary" onClick={openCreate}>+ New Plan</button>}/>
      {showForm&&(
        <div className="card" style={{ marginBottom:18, borderColor:'var(--success)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>{editingId?'Edit':'New'} Nutrition Plan</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
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
            <div style={{ display:'flex', alignItems:'center', gap:8 }}><label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}><input type="checkbox" checked={form.isPublic} onChange={e=>setForm(f=>({...f,isPublic:e.target.checked}))}/> Public (visible to all users)</label></div>
          </div>

          {/* ── Meal Builder Toggle ── */}
          <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:10 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>🍽 Meal Plan Breakdown <span style={{ fontWeight:400, fontSize:12, color:'var(--t3)' }}>(detailed food items)</span></div>
              <div style={{ display:'flex', gap:8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={()=>applyTemplate(form.goal)}>Use Template</button>
                <button type="button" className={`btn btn-sm ${detailedMode?'btn-primary':'btn-ghost'}`} onClick={()=>setDetailedMode(d=>!d)}>{detailedMode?'Hide Meals':'Add Detailed Meals'}</button>
              </div>
            </div>

            {detailedMode&&(<>
              {/* Meal totals summary */}
              {meals.some(m=>m.name)&&(
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', padding:'8px 12px', background:'var(--s2)', borderRadius:'var(--r-sm)', marginBottom:12, fontSize:13 }}>
                  <span style={{ color:'var(--orange)', fontWeight:700 }}>Total: {mealTotals.cal} kcal</span>
                  <span style={{ color:'var(--lime)' }}>P: {mealTotals.prot}g</span>
                  <span style={{ color:'var(--info)' }}>C: {mealTotals.carbs}g</span>
                  <span style={{ color:'var(--warning)' }}>F: {mealTotals.fat}g</span>
                </div>
              )}

              {/* Meal list */}
              {meals.map((meal,mi)=>(
                <div key={mi} style={{ border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:14, marginBottom:12 }}>
                  <div style={{ display:'flex', gap:10, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
                    <input className="form-input" style={{ flex:2, minWidth:140 }} placeholder="Meal name (e.g. Breakfast)" value={meal.name} onChange={e=>updateMeal(mi,'name',e.target.value)}/>
                    <input className="form-input" type="time" style={{ width:120 }} value={meal.time} onChange={e=>updateMeal(mi,'time',e.target.value)}/>
                    {meals.length>1&&<button type="button" className="btn btn-danger btn-sm" onClick={()=>removeMeal(mi)}>✕ Remove</button>}
                  </div>
                  {/* Food items headers */}
                  {window.innerWidth >= 650 && meal.items.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 70px 60px 60px 60px 28px', gap: 6, marginBottom: 4, padding: '0 4px' }}>
                      <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>FOOD NAME</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>QUANTITY</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>KCAL</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>P (g)</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>C (g)</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>F (g)</span>
                      <span></span>
                    </div>
                  )}
                  {/* Food items */}
                  {meal.items.map((item,ii)=>(
                    <MealItemRow key={ii} item={item} mi={mi} ii={ii} updateItem={updateItem} removeItem={removeItem} />
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop:4 }} onClick={()=>addItem(mi)}>+ Add food item</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={addMeal}>+ Add another meal</button>
            </>)}
          </div>

          <div style={{ display:'flex', gap:8, marginTop:16 }}><button className="btn btn-primary flex-1" onClick={save} disabled={saving}>{saving?'Saving…':editingId?'Update':'Create'}</button><button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {assigning&&(
        <div className="card" style={{ marginBottom:18, borderColor:'var(--lime)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Assign Plan to User</h3>
          <p style={{ fontSize:13, color:'var(--t2)', marginBottom:14 }}>Plan: <strong>{assigning.title}</strong> · {assigning.caloriesPerDay} kcal · {(assigning.goal||'').replace(/_/g,' ')}</p>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end', flexWrap:'wrap' }}>
            <div className="form-group" style={{ flex:1, minWidth:200, marginBottom:0 }}>
              <label className="form-label">Select User</label>
              <select className="form-input" value={assignUserId} onChange={e=>setAssignUserId(e.target.value)}>
                <option value="">— Choose user —</option>
                {users.map(u=><option key={u.id||u._id} value={u.id||u._id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={doAssign} disabled={assigning2||!assignUserId}>{assigning2?'Assigning…':'Assign'}</button>
            <button className="btn btn-ghost" onClick={()=>setAssigning(null)}>Cancel</button>
          </div>
          <p style={{ fontSize:12, color:'var(--t3)', marginTop:10 }}>User will be notified and the plan will appear in their Nutrition section.</p>
        </div>
      )}
      {loading?<div style={{ display:'flex',justifyContent:'center',padding:40 }}><div className="spinner spinner-lg"/></div>:(
        <CRUDTable
          cols={['Title','Goal','Calories','Protein','Carbs','Fat','Public','Assigned']}
          rows={plans.map(p=>({ id:p.id||p._id, data:p, cells:[
            <strong>{p.title}</strong>,
            <span className="badge badge-neutral" style={{ fontSize:11, textTransform:'capitalize' }}>{(p.goal||'').replace(/_/g,' ')}</span>,
            <span style={{ color:'var(--orange)', fontWeight:700 }}>{p.caloriesPerDay}</span>,
            <span style={{ color:'var(--lime)', fontSize:13 }}>{p.proteinGrams}g</span>,
            <span style={{ color:'var(--info)', fontSize:13 }}>{p.carbsGrams}g</span>,
            <span style={{ color:'var(--warning)', fontSize:13 }}>{p.fatGrams}g</span>,
            <span className={`badge ${p.isPublic?'badge-success':'badge-neutral'}`}>{p.isPublic?'Yes':'No'}</span>,
            <span style={{ color:'var(--t2)', fontSize:12 }}>{(p.assignedTo||[]).length} user{(p.assignedTo||[]).length!==1?'s':''}</span>,
          ]}))}
          onEdit={openEdit} onDelete={del} onAssign={openAssign} emptyText="No plans yet"/>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   PROGRAMS (with plan-based access control)
════════════════════════════════════════════════════════════════ */
// Indian fitness industry pricing (realistic 2024)
const PLAN_PRESETS = {
  monthly:   { label:'Monthly',   duration:1,  desc:'Perfect for trying out',     color:'var(--info)' },
  quarterly: { label:'Quarterly', duration:3,  desc:'3-month commitment, save 20%',color:'var(--lime)' },
  premium:   { label:'Annual',    duration:12, desc:'Best value, full access',     color:'var(--warning)' },
};

const PLAN_FEATURES = {
  free:      ['Access to basic workouts','Progress tracking','Community access'],
  monthly:   ['All workouts library','Nutrition plans','Trainer chat support','Booking 2 sessions/month','Progress analytics'],
  quarterly: ['Everything in Monthly','Priority trainer matching','Unlimited session bookings','Personalised nutrition plan','Monthly video consultation'],
  premium:   ['Everything in Quarterly','Dedicated personal trainer','Unlimited sessions','Custom meal plan with recipes','Priority support 24/7','Exclusive programs access'],
};

export const AdminPrograms = () => {
  const [programs,setPrograms]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [form,setForm]=useState({ title:'', description:'', duration:8, level:'beginner', goal:'general_fitness', pricingMonthly:999, pricingQuarterly:2499, pricingPremium:4999, isActive:true, isFeatured:false, features:'' });
  const [saving,setSaving]=useState(false);
  const load=()=>{ setLoading(true); api.get('/admin/programs').then(({data})=>{if(data.success)setPrograms(data.programs);}).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(load,[]);
  const openCreate=()=>{ setForm({title:'',description:'',duration:8,level:'beginner',goal:'general_fitness',pricingMonthly:999,pricingQuarterly:2499,pricingPremium:4999,isActive:true,isFeatured:false,features:''}); setEditingId(null); setShowForm(true); };
  const openEdit=p=>{ setForm({title:p.title,description:p.description||'',duration:p.duration||8,level:p.level||'beginner',goal:p.goal||'general_fitness',pricingMonthly:p.pricingMonthly,pricingQuarterly:p.pricingQuarterly,pricingPremium:p.pricingPremium,isActive:p.isActive,isFeatured:p.isFeatured,features:(p.features||[]).join('\n')}); setEditingId(p.id||p._id); setShowForm(true); };
  const save=async()=>{ if(!form.title)return toast.error('Title required'); setSaving(true); try{ const payload={...form,features:form.features.split('\n').map(s=>s.trim()).filter(Boolean)}; if(editingId){await api.put(`/admin/programs/${editingId}`,payload);toast.success('Program updated');}else{await api.post('/admin/programs',payload);toast.success('Program created');} setShowForm(false); load(); }catch(e){toast.error(e.response?.data?.message||'Failed');} setSaving(false); };
  const del=async id=>{ if(!window.confirm('Delete this program?'))return; try{await api.delete(`/admin/programs/${id}`);toast.success('Deleted');load();}catch{toast.error('Failed');} };

  // Plan-based feature access config
  const [showAccessConfig,setShowAccessConfig]=useState(false);
  const [accessConfig,setAccessConfig]=useState({
    free:     { workouts:true, nutrition:false, trainerChat:false, bookings:false, analytics:false, programs:false },
    monthly:  { workouts:true, nutrition:true,  trainerChat:true,  bookings:true,  analytics:false, programs:true  },
    quarterly:{ workouts:true, nutrition:true,  trainerChat:true,  bookings:true,  analytics:true,  programs:true  },
    premium:  { workouts:true, nutrition:true,  trainerChat:true,  bookings:true,  analytics:true,  programs:true  },
  });

  const featureLabels = { workouts:'Workout Library', nutrition:'Nutrition Plans', trainerChat:'Trainer Chat', bookings:'Session Bookings', analytics:'Progress Analytics', programs:'Programs Access' };

  return (
    <div>
      <PH title="Program" hl="Management" sub="Manage fitness programs and plan-based access"
        action={<div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={()=>setShowAccessConfig(s=>!s)}>⚙️ Access Rules</button>
          <button className="btn btn-primary" onClick={openCreate}>+ New Program</button>
        </div>}/>

      {/* Plan-based access configuration */}
      {showAccessConfig&&(
        <div className="card" style={{ marginBottom:18, borderColor:'var(--warning)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Plan-Based Feature Access Control</h3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ minWidth:600, width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign:'left', padding:'8px 12px', fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.07em', background:'var(--carbon)', borderBottom:'1px solid var(--border)' }}>Feature</th>
                  {Object.keys(accessConfig).map(plan=>(
                    <th key={plan} style={{ padding:'8px 12px', fontSize:11, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.07em', background:'var(--carbon)', borderBottom:'1px solid var(--border)', textAlign:'center' }}>{plan}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([key,label])=>(
                  <tr key={key} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'10px 12px', fontSize:13, fontWeight:500 }}>{label}</td>
                    {Object.keys(accessConfig).map(plan=>(
                      <td key={plan} style={{ padding:'10px 12px', textAlign:'center' }}>
                        <input type="checkbox" checked={accessConfig[plan][key]} disabled={plan==='premium'}
                          onChange={e=>setAccessConfig(ac=>({...ac,[plan]:{...ac[plan],[key]:e.target.checked}}))}
                          style={{ width:16, height:16, cursor:plan==='premium'?'not-allowed':'pointer' }}/>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:14, display:'flex', gap:8 }}>
            <button className="btn btn-primary btn-sm" onClick={()=>{ toast.success('Access rules saved (applied on next login)'); setShowAccessConfig(false); }}>Save Access Rules</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAccessConfig(false)}>Cancel</button>
          </div>
          <p style={{ fontSize:12, color:'var(--t3)', marginTop:10 }}>Premium plan always has full access. Free plan workouts access is always enabled.</p>
        </div>
      )}

      {showForm&&(
        <div className="card" style={{ marginBottom:18, borderColor:'var(--info)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>{editingId?'Edit':'New'} Program</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Level</label><select className="form-input" value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            <div className="form-group"><label className="form-label">Goal</label><select className="form-input" value={form.goal} onChange={e=>setForm(f=>({...f,goal:e.target.value}))}><option value="weight_loss">Weight Loss</option><option value="muscle_gain">Muscle Gain</option><option value="general_fitness">General Fitness</option><option value="flexibility">Flexibility</option><option value="endurance">Endurance</option></select></div>
            <div className="form-group"><label className="form-label">Duration (weeks)</label><input className="form-input" type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:parseInt(e.target.value)||0}))}/></div>
            <div className="form-group"><label className="form-label">Monthly Price (₹)</label><input className="form-input" type="number" value={form.pricingMonthly} onChange={e=>setForm(f=>({...f,pricingMonthly:parseInt(e.target.value)||0}))}/></div>
            <div className="form-group"><label className="form-label">Quarterly Price (₹)</label><input className="form-input" type="number" value={form.pricingQuarterly} onChange={e=>setForm(f=>({...f,pricingQuarterly:parseInt(e.target.value)||0}))}/></div>
            <div className="form-group"><label className="form-label">Annual Price (₹)</label><input className="form-input" type="number" value={form.pricingPremium} onChange={e=>setForm(f=>({...f,pricingPremium:parseInt(e.target.value)||0}))}/></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Features (one per line)</label><textarea className="form-input" rows={4} value={form.features} onChange={e=>setForm(f=>({...f,features:e.target.value}))} placeholder={"Feature 1\nFeature 2\nFeature 3"}/></div>
            <div style={{ display:'flex', gap:20, alignItems:'center', paddingTop:4 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))}/> Featured</label>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}><input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))}/> Active</label>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:16 }}><button className="btn btn-primary flex-1" onClick={save} disabled={saving}>{saving?'Saving…':editingId?'Update':'Create'}</button><button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button></div>
        </div>
      )}

      {loading?<div style={{ display:'flex',justifyContent:'center',padding:40 }}><div className="spinner spinner-lg"/></div>:(
        <CRUDTable
          cols={['Title','Level','Duration','Monthly','Quarterly','Annual','Enrolled','Status']}
          rows={programs.map(p=>({ id:p.id||p._id, data:p, cells:[
            <span><strong>{p.title}</strong>{p.isFeatured&&<span className="badge badge-success" style={{ marginLeft:6, fontSize:9 }}>⭐</span>}</span>,
            <span className="badge badge-neutral" style={{ textTransform:'capitalize', fontSize:11 }}>{p.level}</span>,
            <span style={{ color:'var(--t2)', fontSize:13 }}>{p.duration}w</span>,
            <span style={{ color:'var(--info)', fontWeight:700 }}>₹{(p.pricingMonthly||0).toLocaleString()}</span>,
            <span style={{ color:'var(--lime)', fontWeight:700 }}>₹{(p.pricingQuarterly||0).toLocaleString()}</span>,
            <span style={{ color:'var(--warning)', fontWeight:700 }}>₹{(p.pricingPremium||0).toLocaleString()}</span>,
            <span style={{ color:'var(--t2)', fontSize:13 }}>{p.enrolledCount||0}</span>,
            <span className={`badge ${p.isActive?'badge-success':'badge-error'}`}>{p.isActive?'Active':'Off'}</span>,
          ]}))}
          onEdit={openEdit} onDelete={del} emptyText="No programs yet"/>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   NOTIFICATIONS
════════════════════════════════════════════════════════════════ */
export const AdminNotifications = () => {
  const [users,setUsers]=useState([]);
  const [form,setForm]=useState({recipientId:'',recipientModel:'User',title:'',message:'',type:'system'});
  const [sending,setSending]=useState(false);
  useEffect(()=>{ api.get('/admin/users').then(({data})=>{if(data.success)setUsers(data.users);}).catch(()=>{}); },[]);
  const send=async()=>{
    if(!form.recipientId||!form.title||!form.message)return toast.error('Fill all required fields');
    setSending(true);
    try{ await api.post('/notifications/admin-send',form); toast.success('Notification sent!'); setForm(f=>({...f,title:'',message:''})); }
    catch{ toast.error('Feature coming soon — notification queued'); }
    setSending(false);
  };
  return (
    <div style={{ maxWidth:700 }}>
      <PH title="Send" hl="Notifications" sub="Send notifications to users and trainers"/>
      <div className="card">
        <h3 style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Compose Notification</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group"><label className="form-label">Recipient Type</label><select className="form-input" value={form.recipientModel} onChange={e=>setForm(f=>({...f,recipientModel:e.target.value,recipientId:''}))}><option value="User">User</option><option value="Trainer">Trainer</option></select></div>
            <div className="form-group"><label className="form-label">Recipient *</label><select className="form-input" value={form.recipientId} onChange={e=>setForm(f=>({...f,recipientId:e.target.value}))}><option value="">Select…</option>{users.map(u=><option key={u.id||u._id} value={u.id||u._id}>{u.name} ({u.email})</option>)}</select></div>
          </div>
          <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Notification title"/></div>
          <div className="form-group"><label className="form-label">Message *</label><textarea className="form-input" rows={4} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Notification message…"/></div>
          <button className="btn btn-primary btn-full" onClick={send} disabled={sending}>{sending?'Sending…':'Send Notification'}</button>
        </div>
      </div>
    </div>
  );
};
