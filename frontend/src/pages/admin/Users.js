import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assigning, setAssigning] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ur, tr] = await Promise.all([
        api.get(`/admin/users${search ? `?search=${search}` : ''}`),
        api.get('/admin/trainers?status=approved'),
      ]);
      if (ur.data.success) setUsers(ur.data.users);
      if (tr.data.success) setTrainers(tr.data.trainers);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const toggleActive = async (id, current) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-active`);
      toast.success(current ? 'User deactivated' : 'User activated');
      setUsers(u => u.map(x => (x.id || x._id) === id ? { ...x, isActive: !current } : x));
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(u => u.filter(x => (x.id||x._id) !== id));
    } catch { toast.error('Failed to delete user'); }
  };

  const assignTrainer = async (userId, trainerId) => {
    try {
      await api.post(`/admin/users/${userId}/assign-trainer`, { trainerId });
      toast.success('Trainer assigned!');
      setAssigning(null);
      load();
    } catch { toast.error('Failed to assign trainer'); }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>User <span style={{ color: 'var(--lime)' }}>Management</span></h1>
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>Monitor and manage all platform users</p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input className="form-input" placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--t3)' }}>{users.length} users</span>
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-lg" /></div> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>User</th><th>Goal / Level</th><th>Subscription</th><th>Streak</th><th>Trainer</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id || u._id || i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(200,241,53,0.12)', color: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{u.name?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, textTransform: 'capitalize' }}>{(u.fitnessGoal || '').replace(/_/g,' ')}</div>
                    <span className="badge badge-neutral" style={{ fontSize: 10, marginTop: 3 }}>{u.fitnessLevel}</span>
                  </td>
                  <td><span className={`badge ${u.subscriptionActive ? 'badge-success' : 'badge-neutral'}`} style={{ textTransform: 'capitalize', fontSize: 11 }}>{u.subscriptionPlan || 'free'}</span></td>
                  <td><span style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 13 }}>🔥 {u.streak || 0}</span></td>
                  <td style={{ fontSize: 12, color: u.assignedTrainerId ? 'var(--t1)' : 'var(--t3)' }}>
                    {u.assignedTrainerId ? trainers.find(t => (t.id || t._id) === u.assignedTrainerId)?.name || 'Assigned' : 'Not assigned'}
                  </td>
                  <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAssigning(u.id || u._id)}>Assign Trainer</button>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-ghost'}`} onClick={() => toggleActive(u.id || u._id, u.isActive)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id || u._id, u.name)}>Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--t3)', padding: 40 }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign trainer modal */}
      {assigning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ maxWidth: 360, width: '100%' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Assign Trainer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 300, overflowY: 'auto' }}>
              {trainers.map(t => (
                <button key={t.id || t._id} className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: 10 }}
                  onClick={() => assignTrainer(assigning, t.id || t._id)}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,95,31,0.12)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{t.name?.[0]}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{(t.specializations || []).slice(0,2).join(', ').replace(/_/g,' ')}</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setAssigning(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
