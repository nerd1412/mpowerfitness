import React from 'react';
import { Link } from 'react-router-dom';
import { LogoFull } from '../../components/shared/Logo';
import Footer from '../../components/shared/Footer';

const InfoLayout = ({ children }) => (
  <div style={{ minHeight:'100vh', background:'var(--black)', display:'flex', flexDirection:'column' }}>
    <header style={{ background:'var(--carbon)', borderBottom:'1px solid var(--border)', padding:'0 clamp(16px,4vw,40px)', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
      <LogoFull height={30} linkTo="/"/>
      <div style={{ display:'flex', gap:12 }}>
        <Link to="/login"    className="btn btn-ghost btn-sm">Sign In</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
      </div>
    </header>
    <main style={{ flex:1, padding:'clamp(32px,5vw,64px) clamp(16px,4vw,40px)', maxWidth:960, margin:'0 auto', width:'100%' }}>
      {children}
    </main>
    <Footer variant="landing"/>
  </div>
);

export { InfoLayout };

const AboutPage = () => (
  <InfoLayout>
    <div style={{ marginBottom:48 }}>
      <div style={{ display:'inline-block', background:'rgba(200,241,53,.1)', border:'1px solid rgba(200,241,53,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--lime)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>About Us</div>
      <h1 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:800, marginBottom:16, lineHeight:1.2 }}>
        Transforming Lives Through<br/><span style={{ color:'var(--lime)' }}>Fitness & Technology</span>
      </h1>
      <p style={{ fontSize:17, color:'var(--t2)', lineHeight:1.7, maxWidth:680 }}>
        Mpower Fitness was built with one mission: to make world-class fitness coaching accessible to every Indian. We combine certified trainers, smart technology, and personalised nutrition to help you achieve real, lasting results.
      </p>
    </div>

    {/* Stats */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:56 }}>
      {[['50K+','Active Members'],['200+','Certified Trainers'],['₹0','Hidden Fees'],['4.8★','Average Rating']].map(([val,lbl]) => (
        <div key={lbl} className="card" style={{ textAlign:'center', padding:'24px 16px' }}>
          <div style={{ fontSize:32, fontWeight:800, color:'var(--lime)', marginBottom:6 }}>{val}</div>
          <div style={{ fontSize:13, color:'var(--t2)' }}>{lbl}</div>
        </div>
      ))}
    </div>

    {/* Story */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:32, marginBottom:56 }}>
      <div>
        <h2 style={{ fontSize:24, fontWeight:700, marginBottom:16 }}>Our Story</h2>
        <p style={{ color:'var(--t2)', lineHeight:1.7, marginBottom:14 }}>
          Founded in 2022 by a team of fitness professionals and technologists, Mpower Fitness started as a simple idea: what if getting a personal trainer was as easy as ordering food online?
        </p>
        <p style={{ color:'var(--t2)', lineHeight:1.7 }}>
          Today we serve members across 50+ cities in India, connecting them with certified coaches for everything from weight loss and muscle building to yoga, rehabilitation, and sports conditioning.
        </p>
      </div>
      <div>
        <h2 style={{ fontSize:24, fontWeight:700, marginBottom:16 }}>Our Mission</h2>
        <p style={{ color:'var(--t2)', lineHeight:1.7, marginBottom:14 }}>
          To democratise fitness coaching in India by making expert guidance affordable, accessible, and personalised for every body type, budget, and goal.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:16 }}>
          {['Science-backed workout programming','Certified & verified trainer network','Personalised Indian nutrition plans','Real-time progress tracking & analytics'].map(item => (
            <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:14, color:'var(--t2)' }}>
              <span style={{ color:'var(--lime)', marginTop:1, flexShrink:0 }}>✓</span>{item}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Values */}
    <h2 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>Our Values</h2>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:48 }}>
      {[
        { icon:'🎯', title:'Results First',    desc:'Every programme is designed around measurable outcomes. We track what matters.' },
        { icon:'🤝', title:'Expert Guidance',  desc:'All trainers are verified, certified professionals with proven track records.' },
        { icon:'🇮🇳', title:'Made for India',  desc:'Indian food plans, Indian pricing, and support in regional languages.' },
        { icon:'🔒', title:'Privacy & Trust',  desc:'Your health data is yours. We never sell or share personal information.' },
      ].map(({ icon,title,desc }) => (
        <div key={title} className="card">
          <div style={{ fontSize:32, marginBottom:12 }}>{icon}</div>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{title}</h3>
          <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6 }}>{desc}</p>
        </div>
      ))}
    </div>

    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <h2 style={{ fontSize:24, fontWeight:700, marginBottom:12 }}>Ready to start your journey?</h2>
      <p style={{ color:'var(--t2)', marginBottom:24 }}>Join 50,000+ members transforming their lives with Mpower Fitness.</p>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
        <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
        <Link to="/trainer/register" className="btn btn-ghost btn-lg">Become a Trainer</Link>
      </div>
    </div>
  </InfoLayout>
);

export default AboutPage;
