import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { InfoLayout } from './About';
import api from '../../utils/api';

/* ── REFUND POLICY ─────────────────────────────────────────── */
export const RefundPage = () => (
  <InfoLayout>
    <div style={{ marginBottom:40 }}>
      <div style={{ display:'inline-block', background:'rgba(78,159,255,.1)', border:'1px solid rgba(78,159,255,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--info)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Legal</div>
      <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, marginBottom:12 }}>Refund <span style={{ color:'var(--lime)' }}>Policy</span></h1>
      <p style={{ fontSize:13, color:'var(--t3)' }}>Last updated: January 2025</p>
    </div>
    {[
      { title:'Subscriptions', items:['Monthly, quarterly, and annual plans are prepaid and non-refundable once the billing cycle starts.','If you experience a technical issue preventing access, contact us within 7 days for a pro-rated credit.','Upgrades are prorated; downgrades take effect from the next billing cycle.'] },
      { title:'Session Bookings', items:['Cancellations made 24+ hours before the session: full credit refund to your account wallet.','Cancellations within 24 hours: no refund, but one rescheduling is allowed per month.','No-shows by the user: non-refundable.','No-shows by the trainer: full refund + ₹100 compensation credit.'] },
      { title:'Programme Purchases', items:['Digital programme access is non-refundable once content has been accessed.','If a programme is discontinued within 30 days of purchase, a full refund is issued.'] },
      { title:'How to Request', items:['Email refunds@mpowerfitness.in with your order ID and reason.','Refunds are processed within 5–7 business days.','UPI refunds typically reflect within 1–3 business days.'] },
    ].map(({ title, items }) => (
      <div key={title} style={{ marginBottom:28 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>{title}</h2>
        <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8, fontSize:14, color:'var(--t2)', lineHeight:1.7 }}>
          {items.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
    ))}
    <div className="card" style={{ background:'rgba(200,241,53,.06)', borderColor:'rgba(200,241,53,.2)' }}>
      <p style={{ fontSize:14, color:'var(--t2)' }}>Questions? Contact <a href="mailto:refunds@mpowerfitness.in" style={{ color:'var(--lime)' }}>refunds@mpowerfitness.in</a></p>
    </div>
  </InfoLayout>
);

/* ── HELP CENTRE ─────────────────────────────────────────────── */
const FAQ = ({ q, a }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderBottom:'1px solid var(--border)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:'16px 0', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, fontFamily:'var(--font-body)', textAlign:'left' }}>
        <span style={{ fontWeight:600, fontSize:14, color:'var(--t1)' }}>{q}</span>
        <span style={{ color:'var(--t3)', fontSize:18, flexShrink:0, transition:'transform .2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && <div style={{ fontSize:14, color:'var(--t2)', lineHeight:1.7, paddingBottom:16 }}>{a}</div>}
    </div>
  );
};

export const HelpPage = () => {
  const faqs = [
    { q:'How do I book a session with a trainer?', a:'Go to Find Trainer, browse certified coaches, select a date and time slot, and complete the UPI payment. Your trainer will confirm within 2 hours.' },
    { q:'Can I change my assigned trainer?', a:"Yes. Contact support@mpowerfitness.in and we'll arrange a new trainer match within 48 hours at no extra cost." },
    { q:'How does the calorie calculator work?', a:'We use the MET formula: Calories = MET × body weight (kg) × duration (hours). HIIT burns ~8 MET, Yoga ~2.5 MET.' },
    { q:'What if my trainer misses a session?', a:'You receive a full refund plus ₹100 compensation credit, automatically added to your account.' },
    { q:'How do I verify my UTR for UPI payments?', a:'Open your UPI app, go to transaction history, find the payment, and note the 12-digit UTR. Enter it on the Mpower verification screen.' },
    { q:'Can I use Mpower on my phone?', a:'Yes! Mpower is fully responsive and works on all screen sizes. A native app is coming in Q2 2025.' },
    { q:'How do I cancel my subscription?', a:'Go to Profile → Subscription and click "Cancel Plan". Access continues until the end of your paid period.' },
    { q:'Are the trainers certified?', a:'All trainers must provide proof of certification (NASM, ACE, RYT, etc.) during registration and are verified by admin before listing.' },
    { q:'What payment methods are accepted?', a:'All UPI methods: GPay, PhonePe, Paytm, BHIM, and any UPI-enabled banking app.' },
    { q:'How do I delete my account?', a:'Contact support@mpowerfitness.in. Your data will be removed within 30 days per our Privacy Policy.' },
  ];
  return (
    <InfoLayout>
      <div style={{ marginBottom:40 }}>
        <div style={{ display:'inline-block', background:'rgba(200,241,53,.1)', border:'1px solid rgba(200,241,53,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--lime)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Help Centre</div>
        <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, marginBottom:12 }}>How can we <span style={{ color:'var(--lime)' }}>help you?</span></h1>
      </div>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>Frequently Asked Questions</h2>
      <div className="card" style={{ padding:'4px 20px', marginBottom:32 }}>
        {faqs.map(f => <FAQ key={f.q} q={f.q} a={f.a}/>)}
      </div>
      <div className="card" style={{ textAlign:'center', background:'rgba(200,241,53,.04)', borderColor:'rgba(200,241,53,.15)' }}>
        <h3 style={{ fontWeight:700, marginBottom:8 }}>Still need help?</h3>
        <p style={{ color:'var(--t2)', fontSize:14, marginBottom:16 }}>Mon–Sat, 9 AM to 9 PM IST</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="mailto:support@mpowerfitness.in" className="btn btn-primary btn-sm">📧 Email Support</a>
          <a href="tel:+919876543210" className="btn btn-ghost btn-sm">📞 Call Us</a>
          <Link to="/info/contact" className="btn btn-ghost btn-sm">Contact Form</Link>
        </div>
      </div>
    </InfoLayout>
  );
};

/* ── BECOME A TRAINER ─────────────────────────────────────────── */
export const BecomeTrainerPage = () => (
  <InfoLayout>
    <div style={{ marginBottom:48 }}>
      <div style={{ display:'inline-block', background:'rgba(255,95,31,.1)', border:'1px solid rgba(255,95,31,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--orange)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>For Trainers</div>
      <h1 style={{ fontSize:'clamp(26px,4vw,48px)', fontWeight:800, marginBottom:16, lineHeight:1.2 }}>Grow Your Coaching<br/><span style={{ color:'var(--lime)' }}>with Mpower Fitness</span></h1>
      <p style={{ fontSize:16, color:'var(--t2)', lineHeight:1.7, maxWidth:600, marginBottom:28 }}>Join 200+ certified trainers earning on their own schedule. Set your rates, build your client base, and get paid instantly via UPI.</p>
      <Link to="/trainer/register" className="btn btn-primary btn-lg">Apply as a Trainer →</Link>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14, marginBottom:40 }}>
      {[
        { icon:'💰', title:'Set Your Own Rates',    desc:'Control your pricing — ₹500–₹2000/session. We take no commission on sessions.' },
        { icon:'📅', title:'Flexible Schedule',      desc:'Set day-by-day availability. Work when you want, with clients you choose.' },
        { icon:'⚡', title:'Instant UPI Payouts',    desc:'Payments credited directly to your UPI ID. No delays.' },
        { icon:'📱', title:'Built-in Tools',          desc:'Client dashboard, nutrition plans, progress tracking, and chat — all included.' },
        { icon:'🏆', title:'Build Reputation',        desc:'Client ratings build your profile. Top trainers get featured listings.' },
        { icon:'🎓', title:'Free Onboarding',         desc:'Dedicated setup support and profile optimisation from our team.' },
      ].map(({ icon,title,desc }) => (
        <div key={title} className="card">
          <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
          <h3 style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>{title}</h3>
          <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6 }}>{desc}</p>
        </div>
      ))}
    </div>
    <div className="card" style={{ textAlign:'center', background:'rgba(255,95,31,.06)', borderColor:'rgba(255,95,31,.2)', padding:'40px 24px' }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:12 }}>Ready to join?</h2>
      <p style={{ color:'var(--t2)', marginBottom:24, fontSize:15 }}>Apply in 5 minutes. Verification takes 48 hours.</p>
      <Link to="/trainer/register" className="btn btn-primary btn-lg">Start Your Application</Link>
    </div>
  </InfoLayout>
);

/* ── BLOG — Dynamic from API ─────────────────────────────────── */
const STATIC_POSTS = [
  { id:'1', title:'The Science of Calorie Deficit: Why 500 kcal/day Works', category:'Nutrition', publishedAt:'2025-01-20', readTime:5, excerpt:"A calorie deficit of 500 kcal/day creates sustainable fat loss of ~0.5 kg per week without muscle loss. Here's the science behind it.", authorName:'Mpower Team', isFeatured:true },
  { id:'2', title:'Progressive Overload: The #1 Principle for Muscle Growth', category:'Strength', publishedAt:'2025-01-15', readTime:7, excerpt:"If your workouts don't get harder over time, your muscles stop growing. This is progressive overload.", authorName:'Arjun Mehta', isFeatured:true },
  { id:'3', title:'The Best Indian Foods for Building Muscle', category:'Nutrition', publishedAt:'2025-01-10', readTime:6, excerpt:"You don't need expensive supplements. Dal, paneer, eggs, and curd are protein powerhouses.", authorName:'Mpower Team' },
  { id:'4', title:'HIIT vs Steady-State Cardio: Which Burns More Fat?', category:'Cardio', publishedAt:'2025-01-05', readTime:5, excerpt:'Both work, but they work differently. Here\'s when to use each for maximum fat loss.', authorName:'Karthik Nair' },
  { id:'5', title:'10 Yoga Poses That Fix Desk Worker Posture', category:'Yoga', publishedAt:'2024-12-28', readTime:4, excerpt:'Sitting 8 hours a day wrecks your posture. These 10 poses take 20 minutes.', authorName:'Priya Sharma' },
  { id:'6', title:'How to Track Progress Without a Scale', category:'General', publishedAt:'2024-12-20', readTime:6, excerpt:'The scale is a terrible measure of fitness progress. Here are 5 better ways to track.', authorName:'Mpower Team' },
];

export const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null); // blog modal

  useEffect(() => {
    api.get('/blogs')
      .then(({ data }) => { if (data.success && data.blogs.length > 0) setPosts(data.blogs); else setPosts(STATIC_POSTS); })
      .catch(() => setPosts(STATIC_POSTS))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);

  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-IN',{month:'short',day:'numeric',year:'numeric'}); } catch { return ''; } };

  return (
    <InfoLayout>
      <div style={{ marginBottom:40 }}>
        <div style={{ display:'inline-block', background:'rgba(200,241,53,.1)', border:'1px solid rgba(200,241,53,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--lime)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Blog</div>
        <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, marginBottom:12 }}>Fitness <span style={{ color:'var(--lime)' }}>Insights</span></h1>
        <p style={{ fontSize:15, color:'var(--t2)' }}>Science-backed tips from certified coaches and nutritionists.</p>
      </div>

      {/* Category filter */}
      <div className="scroll-x" style={{ marginBottom:28 }}>
        <div style={{ display:'flex', gap:8, paddingBottom:4, minWidth:'max-content' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`btn btn-sm ${activeCategory===c ? 'btn-primary' : 'btn-ghost'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:16 }}>
          {filtered.map(post => (
            <article key={post.id||post._id} className="card card-hover" style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <span className="badge badge-neon" style={{ fontSize:10 }}>{post.category}</span>
                {post.isFeatured && <span className="badge badge-orange" style={{ fontSize:9 }}>⭐ Featured</span>}
              </div>
              <h3 style={{ fontWeight:700, fontSize:15, lineHeight:1.4, marginBottom:10, flex:1 }}>{post.title}</h3>
              <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6, marginBottom:14 }}>{post.excerpt}</p>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--t3)', marginBottom:14 }}>
                <span>✍️ {post.authorName || 'Mpower Team'}</span>
                <span>⏱ {post.readTime||5} min read</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'var(--t3)' }}>📅 {fmtDate(post.publishedAt||post.createdAt)}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(post)}>Read →</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:'var(--t3)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
          <p>No posts in this category yet.</p>
        </div>
      )}

      {/* Blog detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'16px', backdropFilter:'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background:'var(--carbon)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', maxWidth:760, width:'100%', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
              <div>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <span className="badge badge-neon" style={{ fontSize:10 }}>{selected.category}</span>
                  <span style={{ fontSize:12, color:'var(--t3)' }}>⏱ {selected.readTime||5} min read</span>
                  <span style={{ fontSize:12, color:'var(--t3)' }}>✍️ {selected.authorName||'Mpower Team'}</span>
                </div>
                <h2 style={{ fontWeight:800, fontSize:'clamp(16px,3vw,22px)', lineHeight:1.3 }}>{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)', fontSize:22, lineHeight:1, padding:4, flexShrink:0 }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
              {selected.excerpt && (
                <p style={{ fontSize:16, color:'var(--t2)', lineHeight:1.7, marginBottom:20, fontStyle:'italic', paddingBottom:20, borderBottom:'1px solid var(--border)' }}>{selected.excerpt}</p>
              )}
              {selected.content ? (
                <div style={{ fontSize:15, color:'var(--t1)', lineHeight:1.8 }}>
                  {selected.content.split('\n\n').map((para, i) => (
                    <p key={i} style={{ marginBottom:16 }}>{para}</p>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize:15, color:'var(--t2)', lineHeight:1.8 }}>
                  <p style={{ marginBottom:16 }}>{selected.excerpt}</p>
                  <p style={{ color:'var(--t3)', fontStyle:'italic' }}>Full article content coming soon. Check back later!</p>
                </div>
              )}
              {selected.tags?.length > 0 && (
                <div style={{ marginTop:24, paddingTop:16, borderTop:'1px solid var(--border)', display:'flex', gap:6, flexWrap:'wrap' }}>
                  {selected.tags.map(t => <span key={t} className="badge badge-neutral">{t}</span>)}
                </div>
              )}
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </InfoLayout>
  );
};

/* ── CAREERS ─────────────────────────────────────────────────── */
export const CareersPage = () => {
  const JOBS = [
    { title:'Senior React Developer', dept:'Engineering', type:'Full-time', location:'Mumbai / Remote', desc:'Build and scale our web platform serving 50K+ users. 4+ years React, TypeScript, REST APIs.' },
    { title:'Backend Node.js Engineer', dept:'Engineering', type:'Full-time', location:'Mumbai / Remote', desc:'Design scalable APIs and backend systems. Node.js, PostgreSQL, Redis, Socket.IO.' },
    { title:'Fitness Content Writer', dept:'Content', type:'Part-time / Contract', location:'Remote', desc:'Write science-backed fitness and nutrition articles. Sports science background preferred.' },
    { title:'Trainer Partnerships Manager', dept:'Business', type:'Full-time', location:'Bangalore', desc:'Recruit, onboard, and manage trainer network across metro cities.' },
    { title:'Customer Success Associate', dept:'Support', type:'Full-time', location:'Mumbai', desc:'Help users and trainers get the most from Mpower. Empathy and clear communication essential.' },
  ];
  return (
    <InfoLayout>
      <div style={{ marginBottom:48 }}>
        <div style={{ display:'inline-block', background:'rgba(200,241,53,.1)', border:'1px solid rgba(200,241,53,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--lime)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Careers</div>
        <h1 style={{ fontSize:'clamp(26px,4vw,48px)', fontWeight:800, marginBottom:16 }}>Join the <span style={{ color:'var(--lime)' }}>Mpower Team</span></h1>
        <p style={{ fontSize:16, color:'var(--t2)', lineHeight:1.7, maxWidth:560 }}>We're building the future of fitness in India. If you're passionate about health, technology, and making a real difference, we'd love to hear from you.</p>
      </div>
      <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>Open Positions</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:40 }}>
        {JOBS.map(job => (
          <div key={job.title} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:10 }}>
              <div>
                <h3 style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{job.title}</h3>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <span className="badge badge-neutral" style={{ fontSize:10 }}>{job.dept}</span>
                  <span className="badge badge-neon" style={{ fontSize:10 }}>{job.type}</span>
                  <span style={{ fontSize:12, color:'var(--t3)' }}>📍 {job.location}</span>
                </div>
              </div>
              <a href="mailto:careers@mpowerfitness.in" className="btn btn-primary btn-sm">Apply →</a>
            </div>
            <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6 }}>{job.desc}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ textAlign:'center', background:'rgba(200,241,53,.04)', borderColor:'rgba(200,241,53,.15)' }}>
        <h3 style={{ fontWeight:700, marginBottom:8 }}>Don't see a fit?</h3>
        <p style={{ color:'var(--t2)', fontSize:14, marginBottom:16 }}>Send us your CV and tell us how you'd contribute.</p>
        <a href="mailto:careers@mpowerfitness.in" className="btn btn-primary btn-sm">📧 careers@mpowerfitness.in</a>
      </div>
    </InfoLayout>
  );
};

/* ── COOKIE POLICY ─────────────────────────────────────────────── */
export const CookiePage = () => (
  <InfoLayout>
    <div style={{ marginBottom:40 }}>
      <div style={{ display:'inline-block', background:'rgba(78,159,255,.1)', border:'1px solid rgba(78,159,255,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--info)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Legal</div>
      <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, marginBottom:12 }}>Cookie <span style={{ color:'var(--lime)' }}>Policy</span></h1>
      <p style={{ fontSize:13, color:'var(--t3)' }}>Last updated: January 2025</p>
    </div>
    {[
      { title:'What Are Cookies?', body:'Cookies are small text files stored by your browser. They help websites remember information about your visit.' },
      { title:'Essential Cookies', body:'Required for authentication, session management, and security. These cannot be disabled without breaking the app.' },
      { title:'Analytics Cookies', body:'Anonymised usage data to understand how users navigate the platform. Opt-out available via browser incognito mode.' },
      { title:'What We Don\'t Use', body:'We do not use advertising cookies, tracking pixels, or social media cookies. No data is shared with advertisers.' },
      { title:'Managing Cookies', body:'Most browsers allow cookie control in their settings. Disabling essential cookies will prevent login.' },
    ].map(({ title, body }) => (
      <div key={title} style={{ marginBottom:28 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>{title}</h2>
        <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.8 }}>{body}</p>
      </div>
    ))}
    <p style={{ fontSize:14, color:'var(--t2)' }}>Questions? <a href="mailto:privacy@mpowerfitness.in" style={{ color:'var(--lime)' }}>privacy@mpowerfitness.in</a></p>
  </InfoLayout>
);
