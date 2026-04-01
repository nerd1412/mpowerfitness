import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { InfoLayout } from './About';

const ContactPage = () => {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all required fields');
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name:'', email:'', subject:'', message:'' });
    setSending(false);
  };

  return (
    <InfoLayout>
      <div style={{ marginBottom:40 }}>
        <div style={{ display:'inline-block', background:'rgba(200,241,53,.1)', border:'1px solid rgba(200,241,53,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--lime)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Contact</div>
        <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, marginBottom:12, lineHeight:1.2 }}>Get in <span style={{ color:'var(--lime)' }}>Touch</span></h1>
        <p style={{ fontSize:15, color:'var(--t2)', lineHeight:1.6 }}>Have a question, feedback, or need help? We're here for you.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:32, alignItems:'start' }}>
        {/* Contact form */}
        <div className="card">
          <h2 style={{ fontWeight:700, fontSize:18, marginBottom:20 }}>Send us a message</h2>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your name" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-input" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
                <option value="">Select a topic…</option>
                <option value="general">General Enquiry</option>
                <option value="trainer">Trainer Partnership</option>
                <option value="billing">Billing & Payments</option>
                <option value="technical">Technical Support</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-input" rows={5} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Tell us how we can help…" required/>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={sending}>
              {sending ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }}/> Sending…</> : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { icon:'📧', title:'Email Support', detail:'support@mpowerfitness.in', sub:'Response within 24 hours', href:'mailto:support@mpowerfitness.in' },
            { icon:'📞', title:'Phone & WhatsApp', detail:'+91 98765 43210', sub:'Mon–Sat, 9 AM – 7 PM IST', href:'tel:+919876543210' },
            { icon:'📍', title:'Registered Office', detail:'Mpower Fitness Pvt. Ltd.', sub:'Mumbai, Maharashtra 400001', href:null },
            { icon:'💬', title:'Live Chat', detail:'Available in the app', sub:'Mon–Sat, 9 AM – 9 PM IST', href:null },
          ].map(({ icon,title,detail,sub,href }) => (
            <div key={title} className="card" style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:44, height:44, borderRadius:'var(--r-md)', background:'rgba(200,241,53,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{title}</div>
                {href ? (
                  <a href={href} style={{ color:'var(--lime)', fontSize:14, textDecoration:'none' }}>{detail}</a>
                ) : (
                  <div style={{ color:'var(--lime)', fontSize:14 }}>{detail}</div>
                )}
                <div style={{ fontSize:12, color:'var(--t3)', marginTop:2 }}>{sub}</div>
              </div>
            </div>
          ))}

          <div className="card">
            <h3 style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Trainer Partnership</h3>
            <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6, marginBottom:12 }}>
              Are you a certified fitness professional? Join our network of 200+ trainers and grow your coaching business.
            </p>
            <a href="/trainer/register" className="btn btn-outline btn-sm">Apply as Trainer →</a>
          </div>
        </div>
      </div>
    </InfoLayout>
  );
};

export default ContactPage;
