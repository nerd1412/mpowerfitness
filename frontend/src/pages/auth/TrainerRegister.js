import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const SPECIALIZATIONS = ['weight_training','cardio','yoga','pilates','crossfit','nutrition','sports_specific','rehabilitation','hiit','meditation'];

const TrainerRegister = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:'', email:'', password:'', phone:'',
    specializations:[], experience:'', bio:'',
    sessionRate:500, monthlyRate:3000
  });
  const { registerTrainer, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const toggleSpec = (s) => setForm(f => ({
    ...f, specializations: f.specializations.includes(s)
      ? f.specializations.filter(x => x !== s)
      : [...f.specializations, s]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specializations.length) { toast.error('Select at least one specialization'); return; }
    const result = await registerTrainer({ ...form, experience: Number(form.experience) });
    if (result.success) {
      toast.success('Application submitted! Admin will review and approve your account.', { duration: 5000 });
      navigate('/trainer/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--deep-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', bottom:'15%', left:'10%', width:400, height:400, background:'radial-gradient(circle, rgba(255,95,31,0.06) 0%, transparent 65%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:500, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:32 }}>
          <LogoFull height={38} />
          <span style={{ background:'rgba(255,95,31,0.12)', color:'var(--electric-orange)', border:'1px solid rgba(255,95,31,0.25)', borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Trainer Application</span>
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid rgba(255,95,31,0.15)', borderRadius:16, padding:'36px 32px' }}>
          {/* Step indicator */}
          <div style={{ display:'flex', gap:8, marginBottom:28 }}>
            {[1,2].map(n => (
              <div key={n} style={{ flex:1, height:3, borderRadius:2, transition:'background 0.3s',
                background: n <= step ? 'var(--electric-orange)' : 'var(--surface-3)' }}/>
            ))}
          </div>

          <h1 style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>
            {step === 1 ? 'Personal details' : 'Professional info'}
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:24 }}>Step {step} of 2</p>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input className="form-input" type="email" placeholder="trainer@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
                </div>
                <button type="submit" className="btn btn-full" style={{ height:46, background:'var(--electric-orange)', color:'#fff', border:'none', borderRadius:10, fontWeight:600, cursor:'pointer', fontSize:15 }}>
                  Continue →
                </button>
              </div>
            )}
            {step === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="form-group">
                  <label className="form-label">Specializations</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:6 }}>
                    {SPECIALIZATIONS.map(s => (
                      <button key={s} type="button" onClick={() => toggleSpec(s)} style={{
                        padding:'6px 12px', borderRadius:6, border:'1px solid',
                        borderColor: form.specializations.includes(s) ? 'rgba(255,95,31,0.5)' : 'var(--border)',
                        background: form.specializations.includes(s) ? 'rgba(255,95,31,0.12)' : 'var(--surface-2)',
                        color: form.specializations.includes(s) ? 'var(--electric-orange)' : 'var(--text-secondary)',
                        fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.15s'
                      }}>{s.replace(/_/g,' ')}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Years of experience</label>
                  <input className="form-input" type="number" placeholder="e.g. 5" min="0" max="50" value={form.experience} onChange={e => setForm({...form, experience:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={3} placeholder="Your expertise and coaching approach…" value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} style={{ resize:'vertical' }}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Session rate (₹)</label>
                    <input className="form-input" type="number" value={form.sessionRate} onChange={e => setForm({...form, sessionRate:e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly rate (₹)</label>
                    <input className="form-input" type="number" value={form.monthlyRate} onChange={e => setForm({...form, monthlyRate:e.target.value})}/>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex:'0 0 auto' }}>← Back</button>
                  <button type="submit" className="btn btn-full" style={{ height:46, background:'var(--electric-orange)', color:'#fff', border:'none', borderRadius:10, fontWeight:600, cursor:'pointer', fontSize:15 }} disabled={isLoading}>
                    {isLoading ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        <p style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, marginTop:20 }}>
          Already approved? <Link to="/trainer/login" style={{ color:'var(--electric-orange)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default TrainerRegister;
