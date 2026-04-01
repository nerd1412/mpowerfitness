import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const TrainerLogin = () => {
  const [form, setForm] = useState({ email:'', password:'' });
  const { loginTrainer, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginTrainer(form.email, form.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate('/trainer/dashboard');
    } else {
      if (result.code === 'PENDING_APPROVAL') {
        toast.error('Your account is awaiting admin approval.', { duration: 5000 });
      } else {
        toast.error(result.error);
      }
    }
  };

  const fillDemo = () => setForm({ email:'arjun@mpowerfitness.com', password:'Trainer@123' });

  return (
    <div style={{ minHeight:'100vh', background:'var(--deep-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'15%', left:'8%', width:450, height:450, background:'radial-gradient(circle, rgba(255,95,31,0.07) 0%, transparent 65%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:36 }}>
          <LogoFull height={38} />
          <span style={{ background:'rgba(255,95,31,0.12)', color:'var(--electric-orange)', border:'1px solid rgba(255,95,31,0.25)', borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Trainer Portal</span>
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid rgba(255,95,31,0.15)', borderRadius:16, padding:'36px 32px' }}>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:'var(--text-primary)' }}>Trainer Sign In</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:28 }}>Access your dashboard and manage clients</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="trainer@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
            </div>
            <button type="submit" className="btn btn-full" style={{
              height:46, fontSize:15, background:'var(--electric-orange)', color:'#fff',
              border:'none', borderRadius:10, fontWeight:600, cursor:'pointer', transition:'all 0.2s'
            }} disabled={isLoading}
              onMouseEnter={e => { if(!isLoading) e.currentTarget.style.background='#e0520a'; }}
              onMouseLeave={e => e.currentTarget.style.background='var(--electric-orange)'}
            >
              {isLoading ? 'Signing in…' : 'Sign In as Trainer'}
            </button>
          </form>

          <div style={{ margin:'20px 0', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Demo</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
          </div>

          <button type="button" onClick={fillDemo} style={{
            width:'100%', padding:'11px', background:'rgba(255,95,31,0.06)',
            border:'1px solid rgba(255,95,31,0.18)', borderRadius:10, cursor:'pointer', textAlign:'left', transition:'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,95,31,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,95,31,0.06)'}
          >
            <div style={{ fontSize:11, color:'var(--electric-orange)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Fill demo credentials</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)' }}>arjun@mpowerfitness.com &nbsp;·&nbsp; Trainer@123</div>
          </button>

          <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:14, marginTop:24 }}>
            New trainer? <Link to="/trainer/register" style={{ color:'var(--electric-orange)', fontWeight:600 }}>Apply to join</Link>
          </p>
        </div>

        <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:28 }}>
          <Link to="/login" style={{ color:'var(--text-muted)', fontSize:13 }}>User login</Link>
          <Link to="/admin/login" style={{ color:'var(--text-muted)', fontSize:13 }}>Admin login</Link>
        </div>
      </div>
    </div>
  );
};

export default TrainerLogin;
