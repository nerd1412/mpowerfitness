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

const UserLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { loginUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginUser(form.email, form.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(result.user.onboardingCompleted ? '/user/dashboard' : '/onboarding');
    } else {
      toast.error(result.error);
    }
  };

  const fillDemo = () => setForm({ email: 'user@mpowerfitness.com', password: 'User@123456' });

  return (
    <div style={{ minHeight:'100vh', background:'var(--deep-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'15%', right:'10%', width:500, height:500, background:'radial-gradient(circle, rgba(200,241,53,0.06) 0%, transparent 65%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'15%', left:'5%', width:350, height:350, background:'radial-gradient(circle, rgba(255,95,31,0.05) 0%, transparent 65%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
          <LogoFull height={38} />
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'36px 32px' }}>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:'var(--text-primary)' }}>Welcome back</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:28 }}>Sign in to continue your fitness journey</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                required autoComplete="email"/>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})}
                  required autoComplete="current-password" style={{ paddingRight:46 }}/>
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--text-muted)', display:'flex', alignItems:'center', padding:2,
                  transition:'color 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                ><EyeIcon open={showPass}/></button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ height:46, fontSize:15 }} disabled={isLoading}>
              {isLoading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin 0.7s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ margin:'20px 0', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Demo</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
          </div>

          <button type="button" onClick={fillDemo} style={{
            width:'100%', padding:'11px', background:'rgba(200,241,53,0.06)',
            border:'1px solid rgba(200,241,53,0.18)', borderRadius:10, cursor:'pointer',
            textAlign:'left', transition:'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(200,241,53,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(200,241,53,0.06)'}
          >
            <div style={{ fontSize:11, color:'var(--neon-lime)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Fill demo credentials</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)' }}>user@mpowerfitness.com &nbsp;·&nbsp; User@123456</div>
          </button>

          <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:14, marginTop:24 }}>
            No account? <Link to="/register" style={{ color:'var(--neon-lime)', fontWeight:600 }}>Sign up free</Link>
          </p>
        </div>

        <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:28 }}>
          <Link to="/trainer/login" style={{ color:'var(--text-muted)', fontSize:13 }}>Trainer login</Link>
          <Link to="/admin/login" style={{ color:'var(--text-muted)', fontSize:13 }}>Admin login</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
