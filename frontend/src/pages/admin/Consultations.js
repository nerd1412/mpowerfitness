import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending:    { bg:'rgba(255,193,7,0.15)',  text:'#FFC107', label:'Pending' },
  reviewing:  { bg:'rgba(78,159,255,0.15)', text:'#4E9FFF', label:'Reviewing' },
  assigned:   { bg:'rgba(200,241,53,0.15)', text:'var(--neon-lime)', label:'Assigned' },
  completed:  { bg:'rgba(34,217,122,0.15)', text:'#22D97A', label:'Completed' },
  cancelled:  { bg:'rgba(255,77,77,0.15)',  text:'#FF4D4D', label:'Cancelled' },
};

const CONDITION_LABELS = {
  pcod:'PCOD/PCOS', thyroid:'Thyroid', diabetes:'Diabetes',
  insulin_resistance:'Insulin Resistance', hypertension:'Hypertension',
  joint_pain:'Joint Pain', heart_condition:'Heart', asthma:'Asthma',
  obesity:'Obesity', none:'None',
};

const BUDGET_LABELS = { budget:'Essential', mid:'Pro', premium:'Elite' };
const DELIVERY_LABELS = {
  online_video:'Online Video', trainer_at_home:'Home Visit',
  mpower_gym:'MPower Gym', partner_gym:'Partner Gym', self_guided:'Self-Guided',
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

export default function AdminConsultations() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-consultations', statusFilter, page],
    queryFn: () => api.get('/consultations/admin/all', { params: { status: statusFilter || undefined, page, limit:20 } }).then(r => r.data),
  });

  const updateRequest = useMutation({
    mutationFn: ({ id, body }) => api.patch(`/consultations/admin/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries(['admin-consultations']);
      toast.success('Updated');
      setSelected(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const requests = data?.requests || [];
  const total = data?.total || 0;

  const openDetail = (req) => {
    setSelected(req);
    setNotes(req.adminNotes || '');
    setNewStatus(req.status || 'pending');
  };

  const handleSave = () => {
    updateRequest.mutate({ id: selected.id, body: { status: newStatus, adminNotes: notes } });
  };

  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Free Consultation Requests</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
          Review, assign trainers, and update status for incoming consultation requests
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {[['','All Requests'],['pending','Pending'],['reviewing','Reviewing'],['assigned','Assigned'],['completed','Completed']].map(([val,lbl]) => (
          <button key={val} type="button" onClick={() => { setStatusFilter(val); setPage(1); }} style={{
            padding:'7px 16px', borderRadius:20, cursor:'pointer', fontSize:13, fontWeight:600,
            fontFamily:'var(--font-body)',
            background: statusFilter === val ? 'rgba(200,241,53,0.15)' : 'var(--surface-2)',
            border: `1px solid ${statusFilter === val ? 'rgba(200,241,53,0.45)' : 'var(--border)'}`,
            color: statusFilter === val ? 'var(--neon-lime)' : 'var(--text-muted)',
          }}>
            {lbl} {val === '' && total > 0 ? `(${total})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 24px', background:'var(--surface)',
          border:'1px solid var(--border)', borderRadius:12 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🩺</div>
          <div style={{ fontWeight:600 }}>No consultation requests{statusFilter ? ` with status "${statusFilter}"` : ''}</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {requests.map(req => {
            const sc = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
            return (
              <div key={req.id} style={{ background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:12, padding:'18px 20px', cursor:'pointer', transition:'border-color 0.2s' }}
                onClick={() => openDetail(req)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,241,53,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                  flexWrap:'wrap', gap:10 }}>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{req.name}</div>
                      <span style={{ fontSize:11, background:sc.bg, color:sc.text,
                        border:`1px solid ${sc.text}33`, borderRadius:20, padding:'2px 9px', fontWeight:700 }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:4 }}>
                      {req.email} {req.phone && `· ${req.phone}`}
                    </div>
                    <div style={{ fontSize:13, color:'var(--neon-lime)', fontWeight:600 }}>
                      Goal: {req.primaryGoal}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{timeAgo(req.createdAt)}</span>
                    {req.budgetSegment && (
                      <span style={{ fontSize:11, background:'var(--surface-2)', color:'var(--text-muted)',
                        border:'1px solid var(--border)', borderRadius:20, padding:'2px 9px' }}>
                        {BUDGET_LABELS[req.budgetSegment] || req.budgetSegment}
                      </span>
                    )}
                    {req.deliveryPreference && (
                      <span style={{ fontSize:11, background:'var(--surface-2)', color:'var(--text-muted)',
                        border:'1px solid var(--border)', borderRadius:20, padding:'2px 9px' }}>
                        {DELIVERY_LABELS[req.deliveryPreference] || req.deliveryPreference}
                      </span>
                    )}
                  </div>
                </div>

                {req.healthConditions?.length > 0 && req.healthConditions[0] !== 'none' && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
                    {req.healthConditions.map(c => (
                      <span key={c} style={{ fontSize:11, background:'rgba(255,107,157,0.1)',
                        color:'#FF6B9D', border:'1px solid rgba(255,107,157,0.2)',
                        borderRadius:20, padding:'2px 9px' }}>
                        {CONDITION_LABELS[c] || c}
                      </span>
                    ))}
                  </div>
                )}

                {req.currentChallenges && (
                  <div style={{ marginTop:10, fontSize:13, color:'var(--text-secondary)',
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {req.currentChallenges}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:20 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize:13, color:'var(--text-muted)', alignSelf:'center' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total/20)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Detail panel (modal) */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16,
            width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)',
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800 }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none',
                cursor:'pointer', color:'var(--text-muted)', fontSize:20, padding:4 }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px' }}>
              {/* Info */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
                {[
                  ['Email', selected.email],
                  ['Phone', selected.phone || '—'],
                  ['Age / Gender', `${selected.age || '—'} / ${selected.gender || '—'}`],
                  ['Fitness Level', selected.fitnessLevel || '—'],
                  ['Budget', BUDGET_LABELS[selected.budgetSegment] || '—'],
                  ['Delivery', DELIVERY_LABELS[selected.deliveryPreference] || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase',
                      letterSpacing:'0.07em', marginBottom:3, fontWeight:700 }}>{k}</div>
                    <div style={{ fontSize:13, color:'var(--text-primary)' }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase',
                  letterSpacing:'0.07em', marginBottom:6, fontWeight:700 }}>Primary Goal</div>
                <div style={{ fontSize:14, color:'var(--neon-lime)', fontWeight:600 }}>{selected.primaryGoal}</div>
              </div>

              {selected.healthConditions?.length > 0 && selected.healthConditions[0] !== 'none' && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase',
                    letterSpacing:'0.07em', marginBottom:6, fontWeight:700 }}>Health Conditions</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {selected.healthConditions.map(c => (
                      <span key={c} style={{ fontSize:12, background:'rgba(255,107,157,0.1)',
                        color:'#FF6B9D', border:'1px solid rgba(255,107,157,0.2)',
                        borderRadius:20, padding:'3px 10px' }}>
                        {CONDITION_LABELS[c] || c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.currentChallenges && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase',
                    letterSpacing:'0.07em', marginBottom:6, fontWeight:700 }}>Current Challenges</div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6,
                    background:'var(--surface-2)', borderRadius:8, padding:'12px' }}>
                    {selected.currentChallenges}
                  </div>
                </div>
              )}

              {/* Update */}
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:16, marginTop:4 }}>
                <div className="form-group" style={{ marginBottom:12 }}>
                  <label className="form-label">Update Status</label>
                  <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {Object.entries(STATUS_COLORS).map(([val, sc]) => (
                      <option key={val} value={val}>{sc.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:16 }}>
                  <label className="form-label">Admin Notes</label>
                  <textarea className="form-input" rows={3} value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notes on plan recommendation, assigned trainer, follow-up date…"
                    style={{ resize:'vertical', fontFamily:'var(--font-body)', lineHeight:1.5 }}/>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave}
                    disabled={updateRequest.isPending} style={{ flex:1 }}>
                    {updateRequest.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
