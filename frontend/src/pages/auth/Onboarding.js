import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const GOALS = [
  { value:'weight_loss', label:'Lose Weight', icon:'🔥', desc:'Burn fat, lean out' },
  { value:'muscle_gain', label:'Build Muscle', icon:'💪', desc:'Get stronger, bigger' },
  { value:'endurance', label:'Improve Endurance', icon:'🏃', desc:'Run faster, longer' },
  { value:'flexibility', label:'Flexibility & Mobility', icon:'🧘', desc:'Move better, feel better' },
  { value:'general_fitness', label:'General Fitness', icon:'⚡', desc:'Overall health & wellbeing' },
  { value:'sports_performance', label:'Sports Performance', icon:'🏅', desc:'Dominate your sport' },
];

const LEVELS = [
  { value:'beginner', label:'Beginner', icon:'🌱', desc:'New to working out or returning after a long break' },
  { value:'intermediate', label:'Intermediate', icon:'⚡', desc:'Work out regularly and know the basics well' },
  { value:'advanced', label:'Advanced', icon:'🔥', desc:'Train seriously and push limits consistently' },
];

const STEPS = [
  { title:'Your goal', subtitle:"What do you want to achieve?" },
  { title:'Fitness level', subtitle:'How active are you currently?' },
  { title:'Your stats', subtitle:'Help us personalise your experience' },
  { title:'Preferences', subtitle:'When and how often do you work out?' },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    fitnessGoal:'', fitnessLevel:'', lifestyle:'moderately_active',
    age:'', gender:'', height:'', weight:'', targetWeight:'',
    preferredWorkoutTime:'morning', workoutDaysPerWeek:3
  });
  const { completeOnboarding, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const canProceed = () => {
    if (step === 0) return !!data.fitnessGoal;
    if (step === 1) return !!data.fitnessLevel;
    if (step === 2) return data.age && data.gender && data.height && data.weight;
    return true;
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
    <div style={{ minHeight:'100vh', background:'var(--deep-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ position:'absolute', top:'10%', right:'8%', width:400, height:400, background:'radial-gradient(circle, rgba(200,241,53,0.05) 0%, transparent 65%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:560, animation:'slideUp 0.45s ease forwards' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <LogoFull height={36} />
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>Step {step + 1} of {STEPS.length}</span>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:6, marginBottom:32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, transition:'background 0.35s',
              background: i <= step ? 'var(--neon-lime)' : 'var(--surface-3)' }}/>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'36px 32px', minHeight:380 }}>
          <h2 style={{ fontSize:24, fontWeight:700, marginBottom:4 }}>{STEPS[step].title}</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:28 }}>{STEPS[step].subtitle}</p>

          {/* Step 0 – Goal */}
          {step === 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:10 }}>
              {GOALS.map(g => (
                <button key={g.value} type="button" onClick={() => setData(d => ({...d, fitnessGoal:g.value}))} style={{
                  padding:'14px', borderRadius:10, textAlign:'left', cursor:'pointer', transition:'all 0.2s',
                  background: data.fitnessGoal === g.value ? 'rgba(200,241,53,0.1)' : 'var(--surface-2)',
                  border: `1px solid ${data.fitnessGoal === g.value ? 'rgba(200,241,53,0.4)' : 'var(--border)'}`,
                }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{g.icon}</div>
                  <div style={{ fontWeight:600, fontSize:13, color: data.fitnessGoal === g.value ? 'var(--neon-lime)' : 'var(--text-primary)' }}>{g.label}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{g.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 1 – Level */}
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

          {/* Step 2 – Stats */}
          {step === 2 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" placeholder="28" min="13" max="100" value={data.age} onChange={e => setData(d => ({...d, age:e.target.value}))}/>
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
                <input className="form-input" type="number" placeholder="175" min="100" max="250" value={data.height} onChange={e => setData(d => ({...d, height:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Current weight (kg)</label>
                <input className="form-input" type="number" placeholder="75" min="30" max="300" value={data.weight} onChange={e => setData(d => ({...d, weight:e.target.value}))}/>
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Target weight (kg)</label>
                <input className="form-input" type="number" placeholder="65" min="30" max="300" value={data.targetWeight} onChange={e => setData(d => ({...d, targetWeight:e.target.value}))}/>
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Lifestyle</label>
                <select className="form-select" value={data.lifestyle} onChange={e => setData(d => ({...d, lifestyle:e.target.value}))}>
                  <option value="sedentary">Sedentary (desk job, little movement)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3 – Preferences */}
          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
              <div className="form-group">
                <label className="form-label">Preferred workout time</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:8, marginTop:8 }}>
                  {[['morning','🌅','Morning'],['afternoon','☀️','Afternoon'],['evening','🌆','Evening'],['night','🌙','Night']].map(([v,icon,lbl]) => (
                    <button key={v} type="button" onClick={() => setData(d => ({...d, preferredWorkoutTime:v}))} style={{
                      padding:'12px', borderRadius:8, cursor:'pointer', transition:'all 0.2s',
                      display:'flex', alignItems:'center', gap:8,
                      background: data.preferredWorkoutTime === v ? 'rgba(200,241,53,0.1)' : 'var(--surface-2)',
                      border: `1px solid ${data.preferredWorkoutTime === v ? 'rgba(200,241,53,0.4)' : 'var(--border)'}`,
                      color: data.preferredWorkoutTime === v ? 'var(--neon-lime)' : 'var(--text-secondary)',
                      fontFamily:'var(--font-body)', fontSize:14, fontWeight:500
                    }}>
                      <span style={{ fontSize:18 }}>{icon}</span>{lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Workout days per week: <strong style={{ color:'var(--neon-lime)' }}>{data.workoutDaysPerWeek} days</strong>
                </label>
                <input type="range" min="1" max="7" value={data.workoutDaysPerWeek}
                  onChange={e => setData(d => ({...d, workoutDaysPerWeek:Number(e.target.value)}))}
                  style={{ width:'100%', marginTop:10, accentColor:'var(--neon-lime)' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
                  <span>1 day</span><span>7 days</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={back} style={{ flex:'0 0 auto' }}>← Back</button>
          )}
          <button className="btn btn-primary" onClick={step === STEPS.length - 1 ? handleComplete : next}
            disabled={!canProceed() || isLoading} style={{ flex:1, height:46, fontSize:15 }}>
            {isLoading ? 'Saving…' : step === STEPS.length - 1 ? 'Complete Setup' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
