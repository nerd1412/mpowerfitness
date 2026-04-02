import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const AdminLogin = () => {
  const [form, setForm] = useState({ email:'', password:'' });
  const { loginAdmin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginAdmin(form.email, form.password);
    if (result.success) {
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const fillDemo = () => setForm({ email:'admin@mpowerfitness.com', password:'Admin@123456' });

  return (
    <div style={{ minHeight:'100vh', background:'var(--deep-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'20%', right:'15%', width:380, height:380, background:'radial-gradient(circle, rgba(78,159,255,0.07) 0%, transparent 65%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:400, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
          <LogoFull height={55} />
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid rgba(78,159,255,0.15)', borderRadius:16, padding:'36px 32px' }}>
          <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:'var(--text-primary)' }}>Admin Sign In</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:28 }}>Restricted — authorised personnel only</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Admin email</label>
              <input className="form-input" type="email" placeholder="admin@mpowerfitness.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
            </div>
            <button type="submit" className="btn btn-full" style={{
              height:46, fontSize:15, background:'linear-gradient(135deg,#4E9FFF,#0066cc)',
              color:'#fff', border:'none', borderRadius:10, fontWeight:600, cursor:'pointer', transition:'opacity 0.2s'
            }} disabled={isLoading}
              onMouseEnter={e => { if(!isLoading) e.currentTarget.style.opacity='0.9'; }}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ margin:'20px 0', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Demo</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
          </div>

          <button type="button" onClick={fillDemo} style={{
            width:'100%', padding:'11px', background:'rgba(78,159,255,0.06)',
            border:'1px solid rgba(78,159,255,0.18)', borderRadius:10, cursor:'pointer', textAlign:'left', transition:'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(78,159,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(78,159,255,0.06)'}
          >
            <div style={{ fontSize:11, color:'var(--info)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Fill demo credentials</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)' }}>admin@mpowerfitness.com &nbsp;·&nbsp; Admin@123456</div>
          </button>
        </div>

        <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:28 }}>
          <Link to="/login" style={{ color:'var(--text-muted)', fontSize:13 }}>User login</Link>
          <Link to="/trainer/login" style={{ color:'var(--text-muted)', fontSize:13 }}>Trainer login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
