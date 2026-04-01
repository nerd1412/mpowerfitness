import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkouts } from '../../hooks/useQueries';

const CATEGORIES = ['all','strength','cardio','hiit','yoga','flexibility','sports','recovery'];
const DIFFICULTIES = ['all','beginner','intermediate','advanced'];
const catIcon = { strength:'🏋️', cardio:'🏃', hiit:'⚡', yoga:'🧘', flexibility:'🤸', sports:'⚽', recovery:'💆', all:'💪' };
const diffColor = { beginner:'badge-success', intermediate:'badge-warning', advanced:'badge-error' };

const WorkoutCard = ({ workout, index }) => (
  <Link to={`/user/workouts/${workout.id}`} className="card card-hover"
    style={{ textDecoration:'none', display:'flex', flexDirection:'column', gap:12, animation:`fadeIn 0.4s ease ${index*0.05}s both`, cursor:'pointer' }}>
    <div style={{ height:140, borderRadius:'var(--r-md)', background:`linear-gradient(135deg,hsl(${(index*47)%360},40%,15%) 0%,hsl(${(index*47+60)%360},30%,10%) 100%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, position:'relative' }}>
      <span style={{ filter:'drop-shadow(0 4px 8px rgba(0,0,0,.5))' }}>{catIcon[workout.category]||'💪'}</span>
      {workout.isFeatured && <div style={{ position:'absolute', top:8, right:8 }}><span className="badge badge-neon" style={{ fontSize:9 }}>⭐ Featured</span></div>}
    </div>
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <h3 style={{ fontSize:14, fontWeight:700, lineHeight:1.3, flex:1 }}>{workout.title}</h3>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
        <span className={`badge ${diffColor[workout.difficulty]||'badge-neutral'}`} style={{ fontSize:9, textTransform:'capitalize' }}>{workout.difficulty}</span>
        <span className="badge badge-neutral" style={{ fontSize:9, textTransform:'capitalize' }}>{workout.category}</span>
      </div>
      <div style={{ display:'flex', gap:14, fontSize:11, color:'var(--t3)', flexWrap:'wrap' }}>
        <span>⏱ {workout.duration} min</span>
        <span>🔥 ~{workout.caloriesBurn||'—'} kcal</span>
        <span>📋 {workout.exercises?.length||0} ex</span>
      </div>
    </div>
  </Link>
);

const SkeletonCard = () => (
  <div className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
    <div className="skeleton" style={{ height:140, borderRadius:'var(--r-md)' }}/>
    <div className="skeleton skeleton-text" style={{ width:'70%' }}/>
    <div style={{ display:'flex', gap:6 }}>
      <div className="skeleton skeleton-badge" style={{ width:64 }}/>
      <div className="skeleton skeleton-badge" style={{ width:56 }}/>
    </div>
    <div className="skeleton skeleton-text" style={{ width:'50%' }}/>
  </div>
);

export default function UserWorkouts() {
  const [category, setCategory]   = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch]       = useState('');

  const { data, isLoading } = useWorkouts({ limit: 100 });
  const allWorkouts = data?.workouts || [];

  const display = allWorkouts.filter(w => {
    if (category !== 'all' && w.category !== category) return false;
    if (difficulty !== 'all' && w.difficulty !== difficulty) return false;
    if (search && !`${w.title} ${w.category} ${(w.tags||[]).join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth:1200 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workout <span className="accent">Library</span></h1>
          <p className="page-subtitle">Expert-crafted workouts for every goal and level</p>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <input className="form-input" placeholder="🔍 Search workouts…" value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth:340 }}/>
      </div>

      <div className="scroll-x" style={{ marginBottom:12 }}>
        <div style={{ display:'flex', gap:6, paddingBottom:4, minWidth:'max-content' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`btn btn-sm ${category===c?'btn-primary':'btn-ghost'}`}
              style={{ textTransform:'capitalize', whiteSpace:'nowrap' }}>
              {catIcon[c]} {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
        {DIFFICULTIES.map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            className={`btn btn-sm ${difficulty===d?'btn-outline':'btn-ghost'}`}
            style={{ textTransform:'capitalize' }}>
            {d}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
          {Array(8).fill(0).map((_,i) => <SkeletonCard key={i}/>)}
        </div>
      ) : display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-title">No workouts match your filters</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:8 }}
            onClick={() => { setCategory('all'); setDifficulty('all'); setSearch(''); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
          {display.map((w,i) => <WorkoutCard key={w.id} workout={w} index={i}/>)}
        </div>
      )}
    </div>
  );
}
