import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { trainerService } from '../../services/index';

const SPECIALIZATIONS = [
  'weight_training','cardio','hiit','yoga','pilates','crossfit',
  'powerlifting','bodybuilding','nutrition','sports_performance',
  'rehabilitation','flexibility','boxing','swimming','cycling',
];

const F = ({ label, children, span }) => (
  <div className="form-group" style={span ? { gridColumn: '1 / -1' } : {}}>
    <label className="form-label">{label}</label>
    {children}
  </div>
);

const SkeletonCard = () => (
  <div className="card" style={{ marginBottom: 14 }}>
    {Array(4).fill(0).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8, marginBottom: 12 }} />
    ))}
  </div>
);

export default function TrainerProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCert, setNewCert] = useState('');
  const [tab, setTab] = useState('info');

  useEffect(() => {
    trainerService.getProfile()
      .then(({ data }) => {
        if (data.success) {
          const t = data.trainer;
          setForm({
            name: t.name || '', phone: t.phone || '', bio: t.bio || '',
            experience: t.experience || 0,
            sessionRate: t.sessionRate || 500,
            monthlyRate: t.monthlyRate || 3000,
            upiId: t.upiId || '',
            city: t.city || '', state: t.state || '',
            specializations: t.specializations || [],
            certifications: t.certifications || [],
            isOnline: t.isOnline !== false,
          });
        }
      })
      .catch(() => {
        if (user) setForm({
          name: user.name || '', phone: user.phone || '', bio: user.bio || '',
          experience: user.experience || 0, sessionRate: user.sessionRate || 500,
          monthlyRate: user.monthlyRate || 3000, upiId: user.upiId || '',
          city: user.city || '', state: user.state || '',
          specializations: user.specializations || [],
          certifications: user.certifications || [],
          isOnline: user.isOnline !== false,
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleSpec = (s) => {
    const list = form.specializations || [];
    set('specializations', list.includes(s) ? list.filter(x => x !== s) : [...list, s]);
  };

  const addCert = () => {
    if (!newCert.trim()) return;
    set('certifications', [...(form.certifications || []), newCert.trim()]);
    setNewCert('');
  };

  const removeCert = (i) => {
    set('certifications', form.certifications.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const { data } = await trainerService.updateProfile(form);
      if (data.success) {
        updateUser({ ...user, ...form });
        toast.success('Profile updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'info', label: '👤 Info' },
    { id: 'rates', label: '💰 Rates' },
    { id: 'skills', label: '🎯 Skills' },
  ];

  if (loading || !form) return (
    <div style={{ maxWidth: 720 }}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            My <span style={{ color: 'var(--orange)' }}>Profile</span>
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: 13 }}>Keep your profile updated to attract more clients</p>
        </div>
        <button className="btn btn-orange" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : '✓ Save Changes'}
        </button>
      </div>

      {/* Avatar banner */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,95,31,0.12)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0 }}>
          {form.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{form.name || 'Your Name'}</div>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${user?.isApproved ? 'badge-success' : 'badge-warning'}`}>
              {user?.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
            </span>
            <span className="badge badge-neutral">⭐ {(user?.rating || 0).toFixed(1)}</span>
            <span className="badge badge-neutral">{user?.totalSessions || 0} sessions</span>
            <span className="badge badge-neutral">{user?.totalRatings || 0} reviews</span>
          </div>
        </div>
        {/* Online toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'var(--t2)' }}>{form.isOnline ? '🟢 Online' : '⚪ Offline'}</span>
          <div
            onClick={() => set('isOnline', !form.isOnline)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: form.isOnline ? 'var(--success)' : 'var(--s3)',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}>
            <div style={{
              position: 'absolute', top: 3, left: form.isOnline ? 22 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
            }} />
          </div>
        </label>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--s2)', padding: 4, borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', background: tab === t.id ? 'var(--orange)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--t2)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Info Tab */}
        {tab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <F label="Full Name">
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
            </F>
            <F label="Phone">
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </F>
            <F label="City">
              <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
            </F>
            <F label="State">
              <input className="form-input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" />
            </F>
            <F label="Experience (years)">
              <input className="form-input" type="number" min="0" max="50" value={form.experience} onChange={e => set('experience', Number(e.target.value))} />
            </F>
            <F label="Bio" span>
              <textarea className="form-input" rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Describe your coaching philosophy, experience, and what clients can expect…" />
            </F>
          </div>
        )}

        {/* Rates Tab */}
        {tab === 'rates' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <F label="Session Rate (₹)">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }}>₹</span>
                  <input className="form-input" type="number" min="0" value={form.sessionRate} onChange={e => set('sessionRate', Number(e.target.value))} style={{ paddingLeft: 26 }} />
                </div>
              </F>
              <F label="Monthly Rate (₹)">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }}>₹</span>
                  <input className="form-input" type="number" min="0" value={form.monthlyRate} onChange={e => set('monthlyRate', Number(e.target.value))} style={{ paddingLeft: 26 }} />
                </div>
              </F>
            </div>
            <F label="UPI ID (for receiving payments)">
              <input className="form-input" value={form.upiId} onChange={e => set('upiId', e.target.value)} placeholder="yourname@upi" />
            </F>
            <div style={{ background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>
              💡 Clients pay via UPI directly to your ID. Set your UPI ID so payments are credited instantly.
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {tab === 'skills' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Specializations */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Specializations ({form.specializations.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SPECIALIZATIONS.map(s => {
                  const active = form.specializations.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSpec(s)}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--r-full)', border: `1px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
                        background: active ? 'rgba(255,95,31,0.12)' : 'transparent', color: active ? 'var(--orange)' : 'var(--t2)',
                        cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: 'var(--font-body)',
                        textTransform: 'capitalize', transition: 'all 0.15s',
                      }}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Certifications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {(form.certifications || []).map((cert, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--s2)', borderRadius: 'var(--r-sm)', padding: '8px 12px' }}>
                    <span style={{ fontSize: 16 }}>🏅</span>
                    <span style={{ flex: 1, fontSize: 14 }}>{cert}</span>
                    <button onClick={() => removeCert(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                ))}
                {form.certifications.length === 0 && (
                  <div style={{ color: 'var(--t3)', fontSize: 13, fontStyle: 'italic' }}>No certifications added yet</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" value={newCert} onChange={e => setNewCert(e.target.value)}
                  placeholder="e.g. NASM CPT, ACE Personal Trainer…"
                  onKeyDown={e => e.key === 'Enter' && addCert()}
                  style={{ flex: 1 }} />
                <button className="btn btn-ghost" onClick={addCert}>Add</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-orange" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : '✓ Save Changes'}
        </button>
      </div>
    </div>
  );
}
