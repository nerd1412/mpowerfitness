import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const UserRegister = () => {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'' });
  const [showPass, setShowPass] = useState(false);
  const { registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const result = await registerUser(form);
    if (result.success) {
      toast.success('Account created! Set up your fitness profile.');
      navigate('/onboarding');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--deep-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'10%', right:'8%', width:500, height:500, background:'radial-gradient(circle, rgba(200,241,53,0.06) 0%, transparent 65%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
          <LogoFull height={55} />
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'36px 32px' }}>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:'var(--text-primary)' }}>Create account</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:28 }}>Start your transformation — it's free</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" type="text" placeholder="Your name"
                value={form.name} onChange={e => setForm({...form, name:e.target.value})} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
              <input className="form-input" type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters" value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})}
                  required style={{ paddingRight:46 }}/>
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
                  display:'flex', alignItems:'center', padding:2
                }}><EyeIcon open={showPass}/></button>
              </div>
              {form.password && (
                <div style={{ marginTop:6, display:'flex', gap:4 }}>
                  {[...Array(4)].map((_,i) => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, transition:'background 0.3s', background:
                      form.password.length < 4 ? (i === 0 ? 'var(--error)' : 'var(--border)') :
                      form.password.length < 6 ? (i < 2 ? 'var(--warning)' : 'var(--border)') :
                      form.password.length < 8 ? (i < 3 ? 'var(--warning)' : 'var(--border)') :
                      'var(--success)'
                    }}/>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ height:46, fontSize:15, marginTop:4 }} disabled={isLoading}>
              {isLoading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin 0.7s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  Creating account…
                </span>
              ) : 'Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:14, marginTop:24 }}>
            Already have an account? <Link to="/login" style={{ color:'var(--neon-lime)', fontWeight:600 }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13 }}>
          <Link to="/trainer/register" style={{ color:'var(--text-muted)' }}>Join as a trainer →</Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
