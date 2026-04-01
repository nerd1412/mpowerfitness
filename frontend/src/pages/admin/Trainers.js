import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const SPECIALIZATION_OPTIONS = [
  'weight_training','nutrition','body_recomposition','hiit','cardio',
  'yoga','flexibility','meditation','sports_conditioning','weight_loss',
  'muscle_gain','crossfit','pilates','zumba','aerobics','prenatal_fitness',
  'senior_fitness','rehabilitation','marathon_training','swimming',
];

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name:'', email:'', password:'', phone:'', experience:'', bio:'',
    sessionRate:'', monthlyRate:'', city:'', state:'', upiId:'',
    specializations: [], isApproved: true,
  });
  const [addLoading, setAddLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/trainers?${params}`);
      if (data.success) setTrainers(data.trainers);
    } catch { toast.error('Failed to load trainers'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter, search]);

  const approve = async (id) => {
    try { await api.patch(`/admin/trainers/${id}/approve`); toast.success('Trainer approved!'); load(); }
    catch { toast.error('Failed'); }
  };
  const reject = async (id) => {
    if (!window.confirm('Reject this trainer application?')) return;
    try { await api.patch(`/admin/trainers/${id}/reject`); toast.success('Rejected'); load(); }
    catch { toast.error('Failed'); }
  };
  const toggleActive = async (id) => {
    try { await api.patch(`/admin/trainers/${id}/toggle-active`); toast.success('Updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const toggleSpec = (s) => {
    setAddForm(f => ({
      ...f,
      specializations: f.specializations.includes(s)
        ? f.specializations.filter(x => x !== s)
        : [...f.specializations, s]
    }));
  };

  const handleAddTrainer = async () => {
    const { name, email, password, phone, experience, sessionRate, monthlyRate, specializations } = addForm;
    if (!name || !email || !password) return toast.error('Name, email and password are required');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (specializations.length === 0) return toast.error('Select at least one specialization');
    setAddLoading(true);
    try {
      const { data } = await api.post('/admin/trainers/add', {
        name, email, password, phone,
        specializations,
        experience: parseInt(experience) || 0,
        bio: addForm.bio,
        sessionRate: parseInt(sessionRate) || 500,
        monthlyRate: parseInt(monthlyRate) || 3000,
        city: addForm.city,
        state: addForm.state,
        isApproved: addForm.isApproved,
      });
      if (data.success) {
        toast.success(data.message || `Trainer ${name} added!`);
        setShowAdd(false);
        setAddForm({ name:'',email:'',password:'',phone:'',experience:'',bio:'',sessionRate:'',monthlyRate:'',city:'',state:'',upiId:'',specializations:[],isApproved:true });
        load();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add trainer');
    }
    setAddLoading(false);
  };

  const pendingCount = trainers.filter(t => !t.isApproved).length;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, marginBottom:4 }}>
            Trainer <span style={{ color:'var(--orange)' }}>Management</span>
          </h1>
          <p style={{ color:'var(--t2)', fontSize:13 }}>Approve, manage and onboard trainers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? '✕ Cancel' : '+ Add Trainer'}
        </button>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div style={{ background:'rgba(255,176,32,.08)', border:'1px solid rgba(255,176,32,.2)', borderRadius:'var(--r-lg)', padding:'12px 16px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:14, fontWeight:600, color:'var(--warning)' }}>
            ⚠️ {pendingCount} trainer application{pendingCount > 1 ? 's' : ''} awaiting review
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilter('pending')}>Review Now →</button>
        </div>
      )}

      {/* Add trainer form */}
      {showAdd && (
        <div className="card" style={{ marginBottom:20, borderColor:'var(--info)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:18 }}>Onboard New Trainer</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={addForm.name} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))} placeholder="Trainer full name"/>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={addForm.email} onChange={e=>setAddForm(f=>({...f,email:e.target.value}))} placeholder="trainer@email.com"/>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" value={addForm.password} onChange={e=>setAddForm(f=>({...f,password:e.target.value}))} placeholder="Min 8 characters"/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={addForm.phone} onChange={e=>setAddForm(f=>({...f,phone:e.target.value}))} placeholder="10-digit mobile"/>
            </div>
            <div className="form-group">
              <label className="form-label">Experience (years)</label>
              <input className="form-input" type="number" value={addForm.experience} onChange={e=>setAddForm(f=>({...f,experience:e.target.value}))} placeholder="e.g. 5"/>
            </div>
            <div className="form-group">
              <label className="form-label">Session Rate (₹)</label>
              <input className="form-input" type="number" value={addForm.sessionRate} onChange={e=>setAddForm(f=>({...f,sessionRate:e.target.value}))} placeholder="e.g. 1000"/>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Rate (₹)</label>
              <input className="form-input" type="number" value={addForm.monthlyRate} onChange={e=>setAddForm(f=>({...f,monthlyRate:e.target.value}))} placeholder="e.g. 6000"/>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={addForm.city} onChange={e=>setAddForm(f=>({...f,city:e.target.value}))} placeholder="e.g. Mumbai"/>
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={addForm.state} onChange={e=>setAddForm(f=>({...f,state:e.target.value}))} placeholder="e.g. Maharashtra"/>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} value={addForm.bio} onChange={e=>setAddForm(f=>({...f,bio:e.target.value}))} placeholder="Trainer's professional bio and expertise…"/>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Specializations * (select all that apply)</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                {SPECIALIZATION_OPTIONS.map(s => {
                  const selected = addForm.specializations.includes(s);
                  return (
                    <button key={s} type="button" onClick={() => toggleSpec(s)}
                      style={{ padding:'5px 12px', borderRadius:'var(--r-full)', border:`1.5px solid ${selected?'var(--lime)':'var(--border)'}`, background:selected?'rgba(200,241,53,.12)':'var(--s2)', cursor:'pointer', fontSize:12, fontWeight:selected?700:400, color:selected?'var(--lime)':'var(--t2)', fontFamily:'var(--font-body)', transition:'all .12s', textTransform:'capitalize' }}>
                      {s.replace(/_/g,' ')}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}>
                <input type="checkbox" checked={addForm.isApproved} onChange={e=>setAddForm(f=>({...f,isApproved:e.target.checked}))}/>
                Approve immediately (skip pending review)
              </label>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            <button className="btn btn-primary flex-1" onClick={handleAddTrainer} disabled={addLoading}>
              {addLoading ? 'Adding…' : 'Add Trainer'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <input className="form-input" placeholder="🔍 Search trainers…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280, flex:'1 1 200px' }}/>
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          {['all','approved','pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} style={{ textTransform:'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Trainer grid */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {trainers.map((t,i) => (
            <div key={t.id||t._id||i} className="card" style={{ borderColor:!t.isApproved?'rgba(255,176,32,.3)':'var(--border)', animation:`fadeIn .4s ease ${i*.05}s both` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="avatar-placeholder" style={{ width:46, height:46, fontSize:18, background:'rgba(255,95,31,.12)', color:'var(--orange)', flexShrink:0 }}>{t.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'var(--t3)' }}>{t.email}</div>
                    {(t.city||t.state) && <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>📍 {[t.city,t.state].filter(Boolean).join(', ')}</div>}
                  </div>
                </div>
                <span className={`badge ${t.isApproved?'badge-success':'badge-warning'}`}>{t.isApproved?'Approved':'Pending'}</span>
              </div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                {(t.specializations||[]).slice(0,3).map(s => (
                  <span key={s} className="badge badge-neutral" style={{ fontSize:10, textTransform:'capitalize' }}>{s.replace(/_/g,' ')}</span>
                ))}
                {(t.specializations||[]).length > 3 && <span className="badge badge-neutral" style={{ fontSize:10 }}>+{(t.specializations||[]).length-3}</span>}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:12 }}>
                {[['Exp',`${t.experience||0}yr`],['Sessions',t.totalSessions||0],['Clients',(t.clients||[]).length]].map(([l,v],j) => (
                  <div key={j} style={{ background:'var(--s2)', borderRadius:'var(--r-sm)', padding:'6px 4px', textAlign:'center' }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{v}</div>
                    <div style={{ fontSize:10, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.04em' }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:13 }}>
                  <span style={{ color:'var(--lime)', fontWeight:700 }}>₹{(t.sessionRate||0).toLocaleString()}</span>
                  <span style={{ color:'var(--t3)' }}>/session</span>
                </div>
                {t.rating > 0 && <span className="badge badge-warning" style={{ fontSize:10 }}>⭐ {(t.rating||0).toFixed(1)} ({t.totalRatings||0})</span>}
              </div>

              <div style={{ display:'flex', gap:6 }}>
                {!t.isApproved ? (
                  <>
                    <button className="btn btn-primary btn-sm flex-1" onClick={() => approve(t.id||t._id)}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => reject(t.id||t._id)}>Reject</button>
                  </>
                ) : (
                  <>
                    <button className={`btn btn-sm flex-1 ${t.isActive?'btn-danger':'btn-ghost'}`} onClick={() => toggleActive(t.id||t._id)}>
                      {t.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {t.totalEarnings > 0 && <span style={{ fontSize:13, color:'var(--success)', fontWeight:600, alignSelf:'center', paddingLeft:4 }}>₹{(t.totalEarnings/1000).toFixed(0)}K earned</span>}
                  </>
                )}
              </div>
            </div>
          ))}
          {trainers.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:60, gridColumn:'1/-1' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🏋️</div>
              <p style={{ color:'var(--t2)', fontSize:14 }}>No {filter !== 'all' ? filter : ''} trainers found</p>
              {filter === 'all' && <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={() => setShowAdd(true)}>Add Your First Trainer</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTrainers;
