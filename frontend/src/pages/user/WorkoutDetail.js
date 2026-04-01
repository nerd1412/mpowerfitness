import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { MOCK_WORKOUTS } from '../../utils/mockApi';

const catIcon = { strength:'🏋️', cardio:'🏃', hiit:'⚡', yoga:'🧘', flexibility:'🤸', sports:'⚽', recovery:'💆' };

// Build a lookup map from mock workouts keyed by both id and _id
const MOCK_MAP = {};
MOCK_WORKOUTS.forEach(w => {
  MOCK_MAP[w.id]  = w;
  MOCK_MAP[w._id] = w;
});

const UserWorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStart, setSessionStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentEx, setCurrentEx] = useState(0);
  const [completedEx, setCompletedEx] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    // Check if it's a mock ID first
    if (MOCK_MAP[id]) {
      setWorkout(MOCK_MAP[id]);
      setLoading(false);
      return;
    }
    api.get(`/workouts/${id}`)
      .then(({ data }) => {
        if (data.success && data.workout) {
          setWorkout(data.workout);
        } else {
          // Fallback to first mock workout if not found
          setWorkout(MOCK_WORKOUTS[0]);
        }
      })
      .catch(() => setWorkout(MOCK_WORKOUTS[0]))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession]);

  const formatTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const startSession = async () => {
    try {
      const { data } = await api.post('/workouts/sessions/start', {
        workoutId: workout.id || workout._id,
        workoutName: workout.title,
      });
      if (data.success) setSessionId(data.session?.id || data.session?._id);
    } catch {}
    setActiveSession(true);
    setSessionStart(new Date());
    setElapsed(0);
    setCurrentEx(0);
    setCompletedEx([]);
    toast.success("Session started! Let's go! 💪");
  };

  const completeExercise = idx => {
    if (!completedEx.includes(idx)) {
      setCompletedEx(p => [...p, idx]);
      if (idx + 1 < (workout?.exercises?.length || 0)) {
        setCurrentEx(idx + 1);
        toast.success(`Exercise ${idx + 1} done! 🔥`);
      }
    }
  };

  const finishSession = async () => {
    const completionRate = Math.round((completedEx.length / (workout?.exercises?.length || 1)) * 100);
    try {
      if (sessionId) {
        await api.post(`/workouts/sessions/${sessionId}/complete`, {
          exercisesCompleted: completedEx.map(i => ({ exerciseName: workout.exercises[i]?.name })),
          completionRate, mood: 'good',
        });
      }
      toast.success('Session complete! 🎉');
    } catch {
      toast.success('Session finished!');
    }
    setActiveSession(false);
    navigate('/user/dashboard');
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-lg"/></div>;
  if (!workout) return <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Workout not found. <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Go back</button></div>;

  const progress = workout.exercises?.length ? (completedEx.length / workout.exercises.length) * 100 : 0;

  return (
    <div style={{ maxWidth:900 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>← Back to Workouts</button>

      {/* Header — original fixed gradient, dynamic icon */}
      <div style={{
        borderRadius:'var(--radius-xl)', overflow:'hidden', marginBottom:24,
        background:'linear-gradient(135deg, rgba(200,241,53,0.12) 0%, rgba(255,95,31,0.08) 100%)',
        border:'1px solid rgba(200,241,53,0.2)', padding:'36px',
      }}>
        <div className="workout-header-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
              <span className="badge badge-neon" style={{ textTransform:'capitalize' }}>{workout.category}</span>
              <span className="badge badge-warning" style={{ textTransform:'capitalize' }}>{workout.difficulty}</span>
            </div>
            <h1 style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:800, marginBottom:8, lineHeight:1.2 }}>{workout.title}</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.6, maxWidth:600 }}>{workout.description}</p>
            <div style={{ display:'flex', gap:24, marginTop:16, fontSize:14, color:'var(--text-secondary)', flexWrap:'wrap' }}>
              <span>⏱ <strong style={{ color:'var(--text-primary)' }}>{workout.duration}</strong> min</span>
              <span>🔥 <strong style={{ color:'var(--text-primary)' }}>{workout.caloriesBurn}</strong> kcal</span>
              <span>📋 <strong style={{ color:'var(--text-primary)' }}>{workout.exercises?.length}</strong> exercises</span>
            </div>
          </div>
          <div className="workout-header-icon" style={{ fontSize:80, lineHeight:1, userSelect:'none', flexShrink:0 }}>
            {catIcon[workout.category] || '💪'}
          </div>
        </div>
      </div>

      {/* Session Timer Bar */}
      {activeSession && (
        <div className="session-timer-bar" style={{
          background:'rgba(200,241,53,0.08)', border:'1px solid rgba(200,241,53,0.3)',
          borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:24,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:800, fontSize:36, color:'var(--neon-lime)', lineHeight:1 }}>{formatTime(elapsed)}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Elapsed</div>
            </div>
            <div style={{ width:1, height:40, background:'var(--border)' }}/>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:800, fontSize:36, color:'var(--electric-orange)', lineHeight:1 }}>{completedEx.length}/{workout.exercises?.length}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Done</div>
            </div>
          </div>
          <div className="timer-progress" style={{ flex:1, maxWidth:300 }}>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>Progress</div>
            <div className="progress-bar" style={{ height:10 }}>
              <div className="progress-fill" style={{ width:`${progress}%` }}/>
            </div>
          </div>
          <button className="btn btn-primary" onClick={finishSession}>Finish Session ✓</button>
        </div>
      )}

      <div className="workout-detail-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) clamp(240px,28%,320px)', gap:20 }}>
        {/* Exercises */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:20, fontWeight:700 }}>Exercises</h2>
            {!activeSession && (
              <button className="btn btn-primary" onClick={startSession}>▶ Start Workout</button>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {(workout.exercises||[]).map((ex, i) => {
              const isCompleted = completedEx.includes(i);
              const isCurrent   = activeSession && currentEx === i && !isCompleted;
              return (
                <div key={i} style={{
                  width:'100%', boxSizing:'border-box', minWidth:0,
                  background: isCompleted ? 'rgba(34,217,122,0.06)' : isCurrent ? 'rgba(200,241,53,0.08)' : 'var(--surface)',
                  border:`1px solid ${isCompleted ? 'rgba(34,217,122,0.25)' : isCurrent ? 'rgba(200,241,53,0.3)' : 'var(--border)'}`,
                  borderRadius:'var(--radius-md)', padding:'16px 20px', transition:'all 0.3s',
                  opacity: activeSession && currentEx > i && !isCompleted ? 0.5 : 1,
                }}>
                  <div className="exercise-card-inner">
                    <div style={{ display:'flex', alignItems:'flex-start', gap:14, flex:1, minWidth:0 }}>
                      <div style={{
                        width:32, height:32, borderRadius:'50%', flexShrink:0,
                        background: isCompleted ? 'rgba(34,217,122,0.2)' : isCurrent ? 'rgba(200,241,53,0.2)' : 'var(--surface-3)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:14, fontWeight:700,
                        color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--neon-lime)' : 'var(--text-muted)',
                      }}>
                        {isCompleted ? '✓' : i+1}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:15, marginBottom:4, color:isCurrent ? 'var(--neon-lime)' : 'var(--text-primary)' }}>{ex.name}</div>
                        <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
                          {ex.sets && <span>{ex.sets} sets</span>}
                          {ex.reps && <span> × {ex.reps}</span>}
                          {ex.duration && <span> · {ex.duration}s</span>}
                          {ex.restTime && <span style={{ marginLeft:12, color:'var(--text-muted)' }}>Rest: {ex.restTime}s</span>}
                        </div>
                        {ex.instructions && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6, lineHeight:1.5 }}>{ex.instructions}</div>}
                        {ex.muscleGroups?.length > 0 && (
                          <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                            {ex.muscleGroups.map(m => <span key={m} className="badge badge-neutral" style={{ fontSize:10, textTransform:'capitalize' }}>{m.replace(/_/g,' ')}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                    {activeSession && isCurrent && !isCompleted && (
                      <button className="btn btn-primary btn-sm exercise-action-btn" onClick={() => completeExercise(i)}>Done ✓</button>
                    )}
                    {isCompleted && <span style={{ color:'var(--success)', fontSize:20 }}>✅</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {!activeSession && (
            <div className="card card-neon">
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Ready to go?</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                {[['⏱','Duration',`${workout.duration} min`],['🔥','Burn ~',`${workout.caloriesBurn} kcal`],['📋','Exercises',workout.exercises?.length],['💪','Level',workout.difficulty]].map(([icon,label,val],i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                    <span style={{ color:'var(--text-secondary)' }}>{icon} {label}</span>
                    <span style={{ fontWeight:600, textTransform:'capitalize' }}>{val}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={startSession}>▶ Start Now</button>
            </div>
          )}
          {workout.equipment?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:10, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Equipment</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {workout.equipment.map(e => <span key={e} className="badge badge-neutral" style={{ textTransform:'capitalize' }}>{e}</span>)}
              </div>
            </div>
          )}
          {workout.tags?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:12, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Tags</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {workout.tags.map(t => <span key={t} className="badge badge-neutral">{t}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWorkoutDetail;
