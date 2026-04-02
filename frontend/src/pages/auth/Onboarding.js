import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const GOALS = [
  { value:'weight_loss',       label:'Lose Weight',          icon:'🔥', desc:'Burn fat, lean out' },
  { value:'muscle_gain',       label:'Build Muscle',          icon:'💪', desc:'Get stronger, bigger' },
  { value:'endurance',         label:'Improve Endurance',     icon:'🏃', desc:'Run faster, longer' },
  { value:'flexibility',       label:'Flexibility & Mobility',icon:'🧘', desc:'Move better, feel better' },
  { value:'general_fitness',   label:'General Fitness',       icon:'⚡', desc:'Overall health & wellbeing' },
  { value:'sports_performance',label:'Sports Performance',    icon:'🏅', desc:'Dominate your sport' },
];

const LEVELS = [
  { value:'beginner',    label:'Beginner',    icon:'🌱', desc:'New to working out or returning after a long break' },
  { value:'intermediate',label:'Intermediate',icon:'⚡', desc:'Work out regularly and know the basics well' },
  { value:'advanced',    label:'Advanced',    icon:'🔥', desc:'Train seriously and push limits consistently' },
];

const HEALTH_CONDITIONS = [
  { value:'pcod',              label:'PCOD / PCOS',           icon:'🌸', desc:'Hormonal & ovarian health' },
  { value:'thyroid',           label:'Thyroid Disorder',      icon:'🦋', desc:'Hypo / Hyperthyroid / Hashimoto\'s' },
  { value:'diabetes',          label:'Diabetes',              icon:'💉', desc:'Type 1, Type 2 or pre-diabetic' },
  { value:'insulin_resistance',label:'Insulin Resistance',    icon:'📊', desc:'Metabolic syndrome, high blood sugar' },
  { value:'hypertension',      label:'Hypertension',          icon:'❤️', desc:'High blood pressure' },
  { value:'joint_pain',        label:'Joint Pain / Arthritis',icon:'🦴', desc:'Knee, hip, back or joint issues' },
  { value:'heart_condition',   label:'Heart Condition',       icon:'🫀', desc:'Cardiac history or mild CHD' },
  { value:'asthma',            label:'Asthma / Breathing',    icon:'🌬️', desc:'Exercise-induced or chronic' },
  { value:'obesity',           label:'Obesity / High BMI',    icon:'⚖️', desc:'BMI > 30 or significant overweight' },
  { value:'none',              label:'None of the above',     icon:'✅', desc:'No known health conditions' },
];

const DELIVERY_MODES = [
  { value:'online_video',   label:'Online Video Sessions', icon:'💻', desc:'Live 1-on-1 via Google Meet / Zoom — flexible & convenient' },
  { value:'trainer_at_home',label:'Trainer at My Home',    icon:'🏠', desc:'Certified trainer comes to your doorstep' },
  { value:'mpower_gym',     label:'At MPower Gym',         icon:'🏋️', desc:'Train at our fully equipped MPower facility' },
  { value:'partner_gym',    label:'At My Existing Gym',    icon:'🤝', desc:'Trainer meets you at your current gym' },
  { value:'self_guided',    label:'Self-Guided via App',   icon:'📱', desc:'Follow personalised plans at your own pace' },
];

const BUDGET_SEGMENTS = [
  {
    value:'budget',
    label:'Essential',
    price:'₹499–999 /month',
    icon:'💚',
    features:['App-based workout plans','Nutrition guidance','Community access','Progress tracking'],
  },
  {
    value:'mid',
    label:'Pro',
    price:'₹1,499–2,999 /month',
    icon:'⚡',
    popular: true,
    features:['Everything in Essential','Live trainer sessions (2–4×/week)','Personalised meal plan','Bluetooth health sync','Priority support'],
  },
  {
    value:'premium',
    label:'Elite',
    price:'₹4,999+ /month',
    icon:'👑',
    features:['Everything in Pro','Daily trainer check-ins','Home/gym visit sessions','Dietitian consultation','Lab-result analysis','Dedicated health coach'],
  },
];

const STEPS = [
  { title:'Your goal',           subtitle:'What do you want to achieve?' },
  { title:'Fitness level',       subtitle:'How active are you currently?' },
  { title:'Your stats',          subtitle:'Help us personalise your experience' },
  { title:'Health conditions',   subtitle:'Any conditions we should factor in? (optional — helps us tailor science-backed plans)' },
  { title:'How do you want to train?', subtitle:'Choose your preferred training style' },
  { title:'Your budget',         subtitle:'We\'ll match you with the right plan and trainer' },
];

/* ── Chip selector ─────────────────────────────────────────────────── */
const Chip = ({ selected, onClick, icon, label, desc, badge }) => (
  <button type="button" onClick={onClick} style={{
    padding:'12px 14px', borderRadius:10, textAlign:'left', cursor:'pointer',
    transition:'all 0.2s', display:'flex', alignItems:'flex-start', gap:10, position:'relative',
    background: selected ? 'rgba(200,241,53,0.1)' : 'var(--surface-2)',
    border: `1px solid ${selected ? 'rgba(200,241,53,0.45)' : 'var(--border)'}`,
    boxShadow: selected ? '0 0 0 1px rgba(200,241,53,0.2)' : 'none',
  }}>
    {badge && (
      <span style={{ position:'absolute', top:-8, right:10, background:'var(--electric-orange)', color:'#000',
        fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20, letterSpacing:'0.06em', textTransform:'uppercase' }}>
        {badge}
      </span>
    )}
    <span style={{ fontSize:22, lineHeight:1, marginTop:2, flexShrink:0 }}>{icon}</span>
    <div>
      <div style={{ fontWeight:600, fontSize:13, color: selected ? 'var(--neon-lime)' : 'var(--text-primary)', lineHeight:1.3 }}>{label}</div>
      {desc && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3, lineHeight:1.4 }}>{desc}</div>}
    </div>
  </button>
);

/* ── Main component ────────────────────────────────────────────────── */
const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    fitnessGoal:'', fitnessLevel:'', lifestyle:'moderately_active',
    age:'', gender:'', height:'', weight:'', targetWeight:'',
    preferredWorkoutTime:'morning', workoutDaysPerWeek:3,
    healthConditions:[], deliveryPreference:'online_video', budgetSegment:'mid',
  });
  const { completeOnboarding, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const canProceed = () => {
    if (step === 0) return !!data.fitnessGoal;
    if (step === 1) return !!data.fitnessLevel;
    if (step === 2) return data.age && data.gender && data.height && data.weight;
    return true; // steps 3-5 optional or have defaults
  };

  const toggleCondition = (val) => {
    setData(d => {
      const cur = d.healthConditions;
      if (val === 'none') return { ...d, healthConditions: cur.includes('none') ? [] : ['none'] };
      const without = cur.filter(c => c !== 'none');
      return { ...d, healthConditions: without.includes(val) ? without.filter(c => c !== val) : [...without, val] };
    });
  };

  const handleComplete = async () => {
    const result = await completeOnboarding(data);
    if (result.success) {
      toast.success('Profile set up! Your journey begins now.');
      navigate('/user/dashboard');
    } else {
      toast.error(result.error || 'Failed to save profile');
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--deep-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <div style={{ position:'absolute', top:'10%', right:'8%', width:400, height:400,
        background:'radial-gradient(circle, rgba(200,241,53,0.05) 0%, transparent 65%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'15%', left:'5%', width:300, height:300,
        background:'radial-gradient(circle, rgba(255,95,31,0.04) 0%, transparent 65%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:600, animation:'slideUp 0.45s ease forwards' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <LogoFull height={36} />
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>Step {step + 1} of {STEPS.length}</span>
        </div>

        {/* Progress bar */}
        <div style={{ display:'flex', gap:5, marginBottom:28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, transition:'background 0.35s',
              background: i < step ? 'var(--neon-lime)' : i === step ? 'rgba(200,241,53,0.6)' : 'var(--surface-3)' }}/>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'32px 28px', minHeight:360 }}>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>{STEPS[step].title}</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:24, lineHeight:1.5 }}>{STEPS[step].subtitle}</p>

          {/* ── Step 0: Goal ── */}
          {step === 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(155px, 1fr))', gap:9 }}>
              {GOALS.map(g => (
                <Chip key={g.value} selected={data.fitnessGoal === g.value}
                  onClick={() => setData(d => ({...d, fitnessGoal:g.value}))}
                  icon={g.icon} label={g.label} desc={g.desc}/>
              ))}
            </div>
          )}

          {/* ── Step 1: Level ── */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {LEVELS.map(l => (
                <button key={l.value} type="button" onClick={() => setData(d => ({...d, fitnessLevel:l.value}))} style={{
                  padding:'18px 20px', borderRadius:10, textAlign:'left', cursor:'pointer', transition:'all 0.2s',
                  display:'flex', alignItems:'center', gap:16,
                  background: data.fitnessLevel === l.value ? 'rgba(200,241,53,0.1)' : 'var(--surface-2)',
                  border: `1px solid ${data.fitnessLevel === l.value ? 'rgba(200,241,53,0.4)' : 'var(--border)'}`,
                }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15, color: data.fitnessLevel === l.value ? 'var(--neon-lime)' : 'var(--text-primary)' }}>{l.label}</div>
                    <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:3 }}>{l.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Stats ── */}
          {step === 2 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(155px, 1fr))', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" placeholder="28" min="13" max="100"
                  value={data.age} onChange={e => setData(d => ({...d, age:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={data.gender} onChange={e => setData(d => ({...d, gender:e.target.value}))}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" placeholder="175" min="100" max="250"
                  value={data.height} onChange={e => setData(d => ({...d, height:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" placeholder="75" min="30" max="300"
                  value={data.weight} onChange={e => setData(d => ({...d, weight:e.target.value}))}/>
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Target weight (kg) <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
                <input className="form-input" type="number" placeholder="65" min="30" max="300"
                  value={data.targetWeight} onChange={e => setData(d => ({...d, targetWeight:e.target.value}))}/>
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Activity level</label>
                <select className="form-select" value={data.lifestyle} onChange={e => setData(d => ({...d, lifestyle:e.target.value}))}>
                  <option value="sedentary">Sedentary (desk job, little movement)</option>
                  <option value="lightly_active">Lightly Active (1–3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3–5 days/week)</option>
                  <option value="very_active">Very Active (6–7 days/week)</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Step 3: Health Conditions ── */}
          {step === 3 && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:8 }}>
                {HEALTH_CONDITIONS.map(c => (
                  <Chip key={c.value}
                    selected={data.healthConditions.includes(c.value)}
                    onClick={() => toggleCondition(c.value)}
                    icon={c.icon} label={c.label} desc={c.desc}/>
                ))}
              </div>
              <div style={{ marginTop:18, padding:'12px 14px', background:'rgba(200,241,53,0.05)',
                border:'1px solid rgba(200,241,53,0.15)', borderRadius:8, display:'flex', gap:8, alignItems:'flex-start' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>🔒</span>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5, margin:0 }}>
                  This information is used only to personalise your fitness and nutrition recommendations.
                  It is never shared with third parties. Our certified trainers use it to apply condition-specific
                  science-backed protocols (ACSM, ADA, EULAR guidelines).
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Delivery Preference ── */}
          {step === 4 && (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {DELIVERY_MODES.map(m => (
                <Chip key={m.value}
                  selected={data.deliveryPreference === m.value}
                  onClick={() => setData(d => ({...d, deliveryPreference:m.value}))}
                  icon={m.icon} label={m.label} desc={m.desc}/>
              ))}
            </div>
          )}

          {/* ── Step 5: Budget ── */}
          {step === 5 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {BUDGET_SEGMENTS.map(b => (
                <button key={b.value} type="button" onClick={() => setData(d => ({...d, budgetSegment:b.value}))} style={{
                  padding:'16px 18px', borderRadius:12, textAlign:'left', cursor:'pointer',
                  transition:'all 0.2s', position:'relative',
                  background: data.budgetSegment === b.value ? 'rgba(200,241,53,0.08)' : 'var(--surface-2)',
                  border: `1px solid ${data.budgetSegment === b.value ? 'rgba(200,241,53,0.45)' : 'var(--border)'}`,
                }}>
                  {b.popular && (
                    <span style={{ position:'absolute', top:-10, right:14, background:'var(--electric-orange)', color:'#000',
                      fontSize:9, fontWeight:800, padding:'3px 9px', borderRadius:20, letterSpacing:'0.07em', textTransform:'uppercase' }}>
                      POPULAR
                    </span>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:22 }}>{b.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color: data.budgetSegment === b.value ? 'var(--neon-lime)' : 'var(--text-primary)' }}>
                        {b.label}
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:1 }}>{b.price}</div>
                    </div>
                    {data.budgetSegment === b.value && (
                      <span style={{ marginLeft:'auto', color:'var(--neon-lime)', fontSize:18 }}>✓</span>
                    )}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 14px' }}>
                    {b.features.map(f => (
                      <span key={f} style={{ fontSize:12, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ color:'var(--neon-lime)', fontSize:10 }}>✓</span> {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
              <p style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', marginTop:4 }}>
                No commitment. Plans can be changed anytime after your free consultation.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display:'flex', gap:10, marginTop:14 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={back} style={{ flex:'0 0 auto' }}>← Back</button>
          )}
          {/* skip button for optional steps */}
          {(step === 3) && (
            <button className="btn btn-ghost" onClick={next} style={{ flex:'0 0 auto', fontSize:13 }}>Skip</button>
          )}
          <button className="btn btn-primary" onClick={step === STEPS.length - 1 ? handleComplete : next}
            disabled={!canProceed() || isLoading}
            style={{ flex:1, height:46, fontSize:15 }}>
            {isLoading ? 'Saving…' : step === STEPS.length - 1 ? 'Complete Setup →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
