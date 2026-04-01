import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { userService } from '../../services/index';

const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' }, { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' }, { value: 'flexibility', label: 'Flexibility' },
  { value: 'general_fitness', label: 'General Fitness' }, { value: 'sports_performance', label: 'Sports Performance' },
];
const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' },
];
const LIFESTYLES = [
  { value: 'sedentary', label: 'Sedentary (desk job)' }, { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' }, { value: 'very_active', label: 'Very Active' },
];

const F = ({ label, children }) => <div className="form-group"><label className="form-label">{label}</label>{children}</div>;
const Skeleton = () => <div className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 12 }} />;

export default function UserProfile() {
  const { user: authUser, updateUser } = useAuthStore();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('personal');

  useEffect(() => {
    userService.me().then(({ data }) => {
      if (data.success) { const u = data.user; setForm({ name: u.name||'', phone: u.phone||'', age: u.age||'', gender: u.gender||'', height: u.height||'', weight: u.weight||'', targetWeight: u.targetWeight||'', fitnessGoal: u.fitnessGoal||'general_fitness', fitnessLevel: u.fitnessLevel||'beginner', lifestyle: u.lifestyle||'sedentary', preferredWorkoutTime: u.preferredWorkoutTime||'', workoutDaysPerWeek: u.workoutDaysPerWeek||3, city: u.city||'', state: u.state||'' }); }
    }).catch(() => {
      const u = authUser||{}; setForm({ name: u.name||'', phone: u.phone||'', age: u.age||'', gender: u.gender||'', height: u.height||'', weight: u.weight||'', targetWeight: u.targetWeight||'', fitnessGoal: u.fitnessGoal||'general_fitness', fitnessLevel: u.fitnessLevel||'beginner', lifestyle: u.lifestyle||'sedentary', preferredWorkoutTime: u.preferredWorkoutTime||'', workoutDaysPerWeek: u.workoutDaysPerWeek||3, city: u.city||'', state: u.state||'' });
    }).finally(() => setLoading(false));
  }, [authUser]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(form);
      if (data.success) { updateUser(data.user); toast.success('Profile updated!'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setSaving(false);
  };

  if (loading || !form) return <div style={{ maxWidth: 700 }}>{Array(5).fill(0).map((_, i) => <Skeleton key={i} />)}</div>;

  const bmi = form.height && form.weight ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : null;
  const TABS = [{ id:'personal', label:'👤 Personal' }, { id:'fitness', label:'💪 Fitness' }, { id:'body', label:'⚖️ Body Metrics' }];

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>My <span style={{ color:'var(--lime)' }}>Profile</span></h1>
          <p style={{ color:'var(--t2)', fontSize:14 }}>Manage your personal info and fitness preferences</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : '✓ Save Changes'}</button>
      </div>

      <div className="card" style={{ marginBottom:20, display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(200,241,53,0.15)', color:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700, flexShrink:0 }}>{form.name?.[0]?.toUpperCase()||'?'}</div>
        <div>
          <div style={{ fontWeight:700, fontSize:18 }}>{form.name||'Your Name'}</div>
          <div style={{ fontSize:13, color:'var(--t3)', textTransform:'capitalize' }}>{FITNESS_GOALS.find(g=>g.value===form.fitnessGoal)?.label} · {FITNESS_LEVELS.find(l=>l.value===form.fitnessLevel)?.label}</div>
          <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
            <span className="badge badge-neon">{authUser?.subscriptionPlan||'free'}</span>
            {authUser?.subscriptionActive && <span className="badge badge-success">Active</span>}
            <span className="badge badge-neutral">{authUser?.streak||0} day streak 🔥</span>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:2, marginBottom:20, background:'var(--s2)', padding:4, borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'8px 12px', borderRadius:'var(--r-sm)', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, fontWeight:600, transition:'all 0.15s', background: tab===t.id ? 'var(--lime)' : 'transparent', color: tab===t.id ? '#060608' : 'var(--t2)' }}>{t.label}</button>)}
      </div>

      <div className="card">
        {tab==='personal' && (
          <div style={{ display:'grid', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
              <F label="Full Name"><input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your full name"/></F>
              <F label="Phone"><input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210"/></F>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
              <F label="City"><input className="form-input" value={form.city} onChange={e=>set('city',e.target.value)} placeholder="Mumbai"/></F>
              <F label="State"><input className="form-input" value={form.state} onChange={e=>set('state',e.target.value)} placeholder="Maharashtra"/></F>
            </div>
          </div>
        )}
        {tab==='fitness' && (
          <div style={{ display:'grid', gap:14 }}>
            <F label="Fitness Goal"><select className="form-select" value={form.fitnessGoal} onChange={e=>set('fitnessGoal',e.target.value)}>{FITNESS_GOALS.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}</select></F>
            <F label="Fitness Level"><select className="form-select" value={form.fitnessLevel} onChange={e=>set('fitnessLevel',e.target.value)}>{FITNESS_LEVELS.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}</select></F>
            <F label="Lifestyle"><select className="form-select" value={form.lifestyle} onChange={e=>set('lifestyle',e.target.value)}>{LIFESTYLES.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}</select></F>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
              <F label="Preferred Time"><select className="form-select" value={form.preferredWorkoutTime} onChange={e=>set('preferredWorkoutTime',e.target.value)}><option value="">No preference</option><option value="morning">Morning (6–10 AM)</option><option value="afternoon">Afternoon (12–4 PM)</option><option value="evening">Evening (5–9 PM)</option></select></F>
              <F label="Days / Week"><select className="form-select" value={form.workoutDaysPerWeek} onChange={e=>set('workoutDaysPerWeek',Number(e.target.value))}>{[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} day{n>1?'s':''}</option>)}</select></F>
            </div>
          </div>
        )}
        {tab==='body' && (
          <div style={{ display:'grid', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14 }}>
              <F label="Age"><input className="form-input" type="number" min="13" max="100" value={form.age} onChange={e=>set('age',e.target.value)} placeholder="25"/></F>
              <F label="Gender"><select className="form-select" value={form.gender} onChange={e=>set('gender',e.target.value)}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></F>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14 }}>
              <F label="Height (cm)"><input className="form-input" type="number" min="100" max="250" value={form.height} onChange={e=>set('height',e.target.value)} placeholder="175"/></F>
              <F label="Current Weight (kg)"><input className="form-input" type="number" min="30" max="300" step="0.1" value={form.weight} onChange={e=>set('weight',e.target.value)} placeholder="70"/></F>
              <F label="Target Weight (kg)"><input className="form-input" type="number" min="30" max="300" step="0.1" value={form.targetWeight} onChange={e=>set('targetWeight',e.target.value)} placeholder="65"/></F>
            </div>
            {bmi && (
              <div style={{ background:'var(--s2)', borderRadius:'var(--r-md)', padding:'12px 16px', display:'flex', gap:24 }}>
                <div style={{ textAlign:'center' }}><div style={{ fontSize:24, fontWeight:800, color:'var(--lime)' }}>{bmi}</div><div style={{ fontSize:12, color:'var(--t3)' }}>BMI</div></div>
                {form.targetWeight && <div style={{ textAlign:'center' }}><div style={{ fontSize:24, fontWeight:800, color: Number(form.weight)>Number(form.targetWeight)?'var(--warning)':'var(--success)' }}>{(form.weight-form.targetWeight).toFixed(1)} kg</div><div style={{ fontSize:12, color:'var(--t3)' }}>to target</div></div>}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : '✓ Save Changes'}</button>
      </div>
    </div>
  );
}
