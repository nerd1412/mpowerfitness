import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogoFull } from '../components/shared/Logo';
import Footer from '../components/shared/Footer';

const Landing = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: '⚡', title: 'Smart Workouts', desc: 'Expert-crafted plans tailored to your goals, level and progress.' },
    { icon: '🏋️', title: 'Expert Trainers', desc: 'Certified trainers available 1-on-1 for personalized guidance and support.' },
    { icon: '📊', title: 'Progress Intelligence', desc: 'Deep analytics tracking every rep, calorie and milestone of your journey.' },
    { icon: '🥗', title: 'Nutrition System', desc: 'Custom meal plans and calorie tracking aligned with your fitness goals.' },
    { icon: '🔥', title: 'Streak Gamification', desc: 'Badges, rewards and streaks that keep you motivated and coming back.' },
    { icon: '📱', title: 'Seamless Everywhere', desc: 'Web, mobile and app — your fitness journey follows you everywhere.' },
  ];

  const plans = [
    {
      name: 'Starter', price: 2499, period: 'month', tag: null,
      features: ['Unlimited workouts', 'Progress tracking', 'Nutrition plans', 'Community access', 'Mobile app'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Pro', price: 5999, period: 'quarter', tag: 'Most Popular',
      features: ['Everything in Starter', '1 trainer session/week', 'Custom workout plans', 'Priority support', 'Advanced analytics', 'Badge rewards'],
      cta: 'Go Pro',
    },
    {
      name: 'Elite', price: 5999, period: 'month', tag: 'Premium',
      features: ['Everything in Pro', 'Dedicated trainer', 'Daily check-ins', 'Custom nutrition', 'Body composition analysis', 'Transformation coaching'],
      cta: 'Go Elite',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Members' },
    { value: '200+', label: 'Expert Trainers' },
    { value: '1M+', label: 'Workouts Completed' },
    { value: '4.9★', label: 'App Rating' },
  ];

  return (
    <div style={{ background: 'var(--deep-black)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(6,6,8,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        height: 60, display: 'flex', alignItems: 'center',
        padding: '0 clamp(16px, 4vw, 40px)', justifyContent: 'space-between'
      }}>
        <LogoFull height={44} />
        <div className="flex items-center gap-md hide-mobile">
          <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Features</a>
          <a href="#plans" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Plans</a>
          <Link to="/trainer/login" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>For Trainers</Link>
          <Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Admin</Link>
        </div>
        <div className="flex items-center gap-sm">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: 'clamp(80px,12vw,120px) clamp(16px,5vw,60px) clamp(60px,8vw,80px)',
        position: 'relative', overflow: 'hidden',
        overflowX: 'hidden',
        '--mouse-x': '0px', '--mouse-y': '0px'
      }}>
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: '15%', right: '10%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(200,241,53,0.08) 0%, transparent 70%)',
          transform: 'translate(calc(var(--mouse-x, 0px) * 0.5), calc(var(--mouse-y, 0px) * 0.5))',
          transition: 'transform 0.3s ease',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(255,95,31,0.07) 0%, transparent 70%)',
          transform: 'translate(calc(var(--mouse-x, 0px) * -0.3), calc(var(--mouse-y, 0px) * -0.3))',
          transition: 'transform 0.3s ease',
          pointerEvents: 'none'
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(200,241,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,241,53,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 760, animation: 'fadeIn 0.8s ease forwards' }}>
            <div className="badge badge-neon" style={{ marginBottom: 24, display: 'inline-flex' }}>
              🔥 India's most complete fitness platform
            </div>
            <h1 style={{
              fontSize: 'clamp(36px, 7vw, 100px)',
              fontFamily: "'Arial Black','Helvetica Neue',sans-serif",
              lineHeight: 0.95,
              letterSpacing: '0.02em',
              marginBottom: 24,
              overflowWrap: 'break-word',
              wordBreak: 'normal',
            }}>
              <span style={{ color: 'var(--text-primary)', display: 'block' }}>TRAIN</span>
              <span style={{ color: 'var(--neon-lime)', display: 'block' }}>HARDER.</span>
              <span style={{ color: 'var(--text-primary)', display: 'block' }}>LIVE</span>
              <span style={{ WebkitTextStroke: '2px var(--electric-orange)', color: 'transparent', display: 'block' }}>STRONGER.</span>
            </h1>
            <p style={{ fontSize: 'clamp(15px,2.5vw,18px)', color: 'var(--text-secondary)', maxWidth: 520, marginBottom: 40, lineHeight: 1.7 }}>
              India's most complete fitness platform. Personalized workouts, expert trainers, smart nutrition and real results — all in one place.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Link to="/register" className="btn btn-primary btn-xl">
                Start Your Journey Free
                <span style={{ fontSize: 18 }}>→</span>
              </Link>
              <Link to="/trainer/login" className="btn btn-ghost btn-xl">
                I'm a Trainer
              </Link>
            </div>
            <div className="flex items-center gap-lg" style={{ marginTop: 40 }}>
              <div style={{ display: 'flex' }}>
                {['🧑', '👩', '🧑‍🦱', '👨‍🦰', '👩‍🦳'].map((emoji, i) => (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `hsl(${i * 40 + 100}, 50%, 20%)`,
                    border: '2px solid var(--deep-black)',
                    marginLeft: i > 0 ? -10 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, zIndex: 5 - i, position: 'relative'
                  }}>{emoji}</div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>50,000+</strong> members transforming daily
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: 'var(--carbon)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: 'clamp(24px,4vw,40px)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', animation: `fadeIn 0.6s ease ${i * 0.1}s forwards`, opacity: 0 }}>
                <div style={{ fontFamily: "'Arial Black','Helvetica Neue',sans-serif", fontSize: 44, color: 'var(--neon-lime)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Arial Black','Helvetica Neue',sans-serif", marginBottom: 16 }}>
              EVERYTHING YOU NEED TO <span style={{ color: 'var(--neon-lime)' }}>WIN</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
              One platform. Infinite possibilities. Built for the ones who refuse to settle.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="card card-hover" style={{
                display: 'flex', flexDirection: 'column', gap: 16,
                animation: `fadeIn 0.6s ease ${i * 0.08}s forwards`, opacity: 0
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-md)',
                  background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)', background: 'var(--carbon)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="badge badge-orange" style={{ marginBottom: 16, display: 'inline-flex' }}>Pricing Plans</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Arial Black','Helvetica Neue',sans-serif", marginBottom: 16 }}>
              INVEST IN YOUR <span style={{ color: 'var(--electric-orange)' }}>BEST SELF</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              All plans in Indian Rupees. Cancel anytime. No hidden fees.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
            {plans.map((plan, i) => (
              <div key={i} className="card" style={{
                position: 'relative',
                border: plan.tag === 'Most Popular' ? '1px solid rgba(200,241,53,0.4)' : '1px solid var(--border)',
                background: plan.tag === 'Most Popular' ? 'linear-gradient(135deg, rgba(200,241,53,0.05) 0%, var(--surface) 100%)' : undefined,
                transform: plan.tag === 'Most Popular' ? 'scale(1.03)' : undefined,
                animation: `fadeIn 0.6s ease ${i * 0.15}s forwards`, opacity: 0
              }}>
                {plan.tag && (
                  <div className={`badge ${plan.tag === 'Most Popular' ? 'badge-neon' : 'badge-orange'}`} style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)'
                  }}>{plan.tag}</div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>₹</span>
                    <span style={{ fontSize: 48, fontFamily: "'Arial Black','Helvetica Neue',sans-serif", color: plan.tag === 'Most Popular' ? 'var(--neon-lime)' : 'var(--text-primary)' }}>{plan.price.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/{plan.period === 'quarter' ? '3 months' : plan.period}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <span style={{ color: 'var(--neon-lime)', fontSize: 16 }}>✓</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register" className={`btn ${plan.tag === 'Most Popular' ? 'btn-primary' : 'btn-outline'} btn-full`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)',
        background: 'linear-gradient(135deg, rgba(200,241,53,0.06) 0%, transparent 50%, rgba(255,95,31,0.06) 100%)',
        borderTop: '1px solid var(--border)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontFamily: "'Arial Black','Helvetica Neue',sans-serif", marginBottom: 24, lineHeight: 1 }}>
            YOUR <span style={{ color: 'var(--neon-lime)' }}>TRANSFORMATION</span><br />STARTS TODAY
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Join 50,000+ members who've chosen to invest in their health and never looked back.
          </p>
          <div className="flex items-center justify-center gap-md flex-wrap">
            <Link to="/register" className="btn btn-primary btn-xl">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-ghost btn-xl">Sign In</Link>
          </div>
        </div>
      </section>
      <Footer variant="landing"/>
    </div>
  );
};

export default Landing;
