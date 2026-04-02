import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

const HEALTH_CONDITIONS = [
  { value:'pcod',              label:'PCOD / PCOS',           icon:'🌸' },
  { value:'thyroid',           label:'Thyroid Disorder',      icon:'🦋' },
  { value:'diabetes',          label:'Diabetes',              icon:'💉' },
  { value:'insulin_resistance',label:'Insulin Resistance',    icon:'📊' },
  { value:'hypertension',      label:'Hypertension',          icon:'❤️' },
  { value:'joint_pain',        label:'Joint Pain / Arthritis',icon:'🦴' },
  { value:'heart_condition',   label:'Heart Condition',       icon:'🫀' },
  { value:'asthma',            label:'Asthma / Breathing',    icon:'🌬️' },
  { value:'obesity',           label:'Obesity / High BMI',    icon:'⚖️' },
  { value:'none',              label:'None of the above',     icon:'✅' },
];

const GOALS = [
  'Lose weight',
  'Build muscle',
  'Manage health condition',
  'Improve fitness',
  'Sports performance',
  'Rehabilitation / recovery',
  'General wellbeing',
];

const BUDGET_SEGMENTS = [
  { value:'budget',  label:'Budget (₹499–999/mo)' },
  { value:'mid',     label:'Mid (₹1,499–2,999/mo)' },
  { value:'premium', label:'Premium (₹4,999+/mo)' },
];

const DELIVERY_MODES = [
  { value:'online_video',    label:'Online Video Sessions' },
  { value:'trainer_at_home', label:'Trainer at My Home' },
  { value:'mpower_gym',      label:'At MPower Gym' },
  { value:'partner_gym',     label:'At My Existing Gym' },
  { value:'self_guided',     label:'Self-Guided via App' },
];

const Chip = ({ selected, onClick, icon, label }) => (
  <button type="button" onClick={onClick} style={{
    padding:'7px 12px', borderRadius:8, cursor:'pointer', transition:'all 0.18s',
    display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600,
    fontFamily:'var(--font-body)',
    background: selected ? 'rgba(200,241,53,0.12)' : 'var(--surface-2)',
    border: `1px solid ${selected ? 'rgba(200,241,53,0.45)' : 'var(--border)'}`,
    color: selected ? 'var(--neon-lime)' : 'var(--text-secondary)',
  }}>
    {icon && <span style={{ fontSize:14 }}>{icon}</span>}
    {label}
  </button>
);

const ConsultationModal = ({ onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || '',
    healthConditions: user?.healthConditions || [],
    primaryGoal: '',
    currentChallenges: '',
    fitnessLevel: user?.fitnessLevel || '',
    budgetSegment: 'mid',
    deliveryPreference: 'online_video',
  });
  const [done, setDone] = useState(false);

  const submit = useMutation({
    mutationFn: (body) => api.post('/consultations', body),
    onSuccess: () => {
      setDone(true);
      // Immediately update persisted Zustand store — survives page refresh
      updateUser({ consultationDone: true });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit. Try again.'),
  });

  const toggleCondition = (val) => {
    setForm(f => {
      const cur = f.healthConditions;
      if (val === 'none') return { ...f, healthConditions: cur.includes('none') ? [] : ['none'] };
      const without = cur.filter(c => c !== 'none');
      return { ...f, healthConditions: without.includes(val) ? without.filter(c => c !== val) : [...without, val] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.primaryGoal) {
      return toast.error('Name, email and goal are required');
    }
    submit.mutate(form);
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:16, width:'100%', maxWidth:600, maxHeight:'90vh',
        overflow:'hidden', display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>Free Health & Fitness Consultation</h2>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'var(--text-secondary)' }}>
              Our expert reviews your profile and contacts you within 24 hrs — no commitment
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            color:'var(--text-muted)', fontSize:20, padding:'4px', lineHeight:1 }}>✕</button>
        </div>

        {done ? (
          /* Success state */
          <div style={{ padding:'48px 32px', textAlign:'center', flex:1, display:'flex',
            flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Request Submitted!</h3>
            <p style={{ color:'var(--text-secondary)', lineHeight:1.6, maxWidth:400, marginBottom:28 }}>
              Our certified health coach will review your profile and contact you within <strong>24 hours</strong>.
              You'll receive a personalised plan recommendation tailored to your health conditions.
            </p>
            <div style={{ background:'rgba(200,241,53,0.07)', border:'1px solid rgba(200,241,53,0.2)',
              borderRadius:10, padding:'14px 18px', maxWidth:380, width:'100%', marginBottom:24 }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase',
                letterSpacing:'0.07em', marginBottom:8, fontWeight:700 }}>What happens next</div>
              {['Health coach reviews your conditions & goals','Personalised plan curated by expert','Call / WhatsApp within 24 hours'].map((s, i) => (
                <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:'var(--text-secondary)',
                  marginBottom:i < 2 ? 6 : 0, alignItems:'center' }}>
                  <span style={{ color:'var(--neon-lime)', fontWeight:700 }}>{i+1}.</span> {s}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={onClose} style={{ width:180 }}>Done</button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} style={{ overflowY:'auto', flex:1, padding:'20px 24px' }}>
            {/* Contact info */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(f => ({...f, name:e.target.value}))}
                  placeholder="Your full name" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => setForm(f => ({...f, email:e.target.value}))}
                  placeholder="your@email.com" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone (WhatsApp)</label>
                <input className="form-input" type="tel" value={form.phone}
                  onChange={e => setForm(f => ({...f, phone:e.target.value}))}
                  placeholder="+91 98765 43210"/>
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" min="13" max="100" value={form.age}
                  onChange={e => setForm(f => ({...f, age:e.target.value}))}
                  placeholder="28"/>
              </div>
            </div>

            {/* Health conditions */}
            <div style={{ marginBottom:18 }}>
              <label className="form-label" style={{ display:'block', marginBottom:8 }}>
                Health Conditions
                <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:12, marginLeft:6 }}>
                  (helps us assign the right expert)
                </span>
              </label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {HEALTH_CONDITIONS.map(c => (
                  <Chip key={c.value} icon={c.icon} label={c.label}
                    selected={form.healthConditions.includes(c.value)}
                    onClick={() => toggleCondition(c.value)}/>
                ))}
              </div>
            </div>

            {/* Primary goal */}
            <div style={{ marginBottom:18 }}>
              <label className="form-label" style={{ display:'block', marginBottom:8 }}>
                Primary Goal *
              </label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {GOALS.map(g => (
                  <Chip key={g} label={g}
                    selected={form.primaryGoal === g}
                    onClick={() => setForm(f => ({...f, primaryGoal: f.primaryGoal === g ? '' : g}))}/>
                ))}
              </div>
            </div>

            {/* Current challenges */}
            <div className="form-group" style={{ marginBottom:18 }}>
              <label className="form-label">Current Challenges</label>
              <textarea className="form-input" rows={3} value={form.currentChallenges}
                onChange={e => setForm(f => ({...f, currentChallenges:e.target.value}))}
                placeholder="e.g. I've been struggling with weight gain due to PCOD, low energy, difficulty sticking to a plan…"
                style={{ resize:'vertical', fontFamily:'var(--font-body)', lineHeight:1.5 }}/>
            </div>

            {/* Delivery preference */}
            <div style={{ marginBottom:18 }}>
              <label className="form-label" style={{ display:'block', marginBottom:8 }}>How do you prefer to train?</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {DELIVERY_MODES.map(m => (
                  <Chip key={m.value} label={m.label}
                    selected={form.deliveryPreference === m.value}
                    onClick={() => setForm(f => ({...f, deliveryPreference:m.value}))}/>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div style={{ marginBottom:20 }}>
              <label className="form-label" style={{ display:'block', marginBottom:8 }}>Approx. Budget</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {BUDGET_SEGMENTS.map(b => (
                  <Chip key={b.value} label={b.label}
                    selected={form.budgetSegment === b.value}
                    onClick={() => setForm(f => ({...f, budgetSegment:b.value}))}/>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <div style={{ padding:'10px 12px', background:'rgba(200,241,53,0.05)',
              border:'1px solid rgba(200,241,53,0.12)', borderRadius:8,
              fontSize:12, color:'var(--text-muted)', lineHeight:1.5, marginBottom:16 }}>
              🔒 Your health information is confidential and used only to personalise your consultation.
              Never shared with third parties.
            </div>

            <button type="submit" className="btn btn-primary"
              disabled={submit.isPending || !form.name || !form.email || !form.primaryGoal}
              style={{ width:'100%', height:46, fontSize:15 }}>
              {submit.isPending ? 'Submitting…' : 'Request Free Consultation →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal;
