import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', category: 'Nutrition',
    tags: '', readTime: 5, isPublished: false, isFeatured: false,
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/blogs')
      .then(({ data }) => { if (data.success) setBlogs(data.blogs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm({ title:'', excerpt:'', content:'', category:'Nutrition', tags:'', readTime:5, isPublished:false, isFeatured:false });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = b => {
    setForm({
      title: b.title, excerpt: b.excerpt||'', content: b.content||'',
      category: b.category||'Nutrition', tags: (b.tags||[]).join(', '),
      readTime: b.readTime||5, isPublished: b.isPublished, isFeatured: b.isFeatured,
    });
    setEditingId(b.id||b._id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        readTime: parseInt(form.readTime)||5,
      };
      if (editingId) {
        await api.put(`/admin/blogs/${editingId}`, payload);
        toast.success('Blog updated!');
      } else {
        await api.post('/admin/blogs', payload);
        toast.success('Blog created!');
      }
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save blog');
    }
    setSaving(false);
  };

  const del = async id => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const togglePublish = async b => {
    try {
      await api.put(`/admin/blogs/${b.id||b._id}`, { isPublished: !b.isPublished });
      toast.success(!b.isPublished ? 'Published!' : 'Unpublished');
      load();
    } catch { toast.error('Failed'); }
  };

  const CATEGORIES = ['Nutrition','Strength','Cardio','Yoga','HIIT','Flexibility','General','Mental Health'];

  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-IN',{month:'short',day:'numeric',year:'numeric'}); } catch { return '—'; } };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, marginBottom:4 }}>
            Blog <span style={{ color:'var(--info)' }}>Management</span>
          </h1>
          <p style={{ color:'var(--t2)', fontSize:13 }}>Create, edit, and manage all blog posts</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Post</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom:20, borderColor:'var(--info)' }}>
          <h3 style={{ fontWeight:700, fontSize:15, marginBottom:18 }}>{editingId ? 'Edit' : 'New'} Blog Post</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Blog post title"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Read Time (min)</label>
                <input className="form-input" type="number" value={form.readTime} onChange={e => setForm(f => ({...f, readTime:e.target.value}))} min={1} max={60}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Excerpt (shown in listing)</label>
              <textarea className="form-input" rows={2} value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt:e.target.value}))} placeholder="Short description shown in blog listing…"/>
            </div>
            <div className="form-group">
              <label className="form-label">Content (full article)</label>
              <textarea className="form-input" rows={10} value={form.content} onChange={e => setForm(f => ({...f, content:e.target.value}))} placeholder="Full blog content. Use double line breaks for paragraphs…" style={{ minHeight:220, fontFamily:'var(--font-body)' }}/>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" value={form.tags} onChange={e => setForm(f => ({...f, tags:e.target.value}))} placeholder="e.g. nutrition, fat loss, diet"/>
            </div>
            <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({...f, isPublished:e.target.checked}))}/>
                Publish immediately
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500 }}>
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured:e.target.checked}))}/>
                Feature post
              </label>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:18 }}>
            <button className="btn btn-primary flex-1" onClick={save} disabled={saving||!form.title}>
              {saving ? 'Saving…' : editingId ? 'Update Post' : 'Create Post'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Blog list */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b, i) => (
                <tr key={b.id||b._id||i}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:13 }}>{b.title}</div>
                    {b.isFeatured && <span className="badge badge-orange" style={{ fontSize:9, marginTop:3 }}>⭐ Featured</span>}
                  </td>
                  <td><span className="badge badge-neutral" style={{ fontSize:10 }}>{b.category}</span></td>
                  <td style={{ fontSize:13, color:'var(--t2)' }}>{b.authorName||'Mpower Team'}</td>
                  <td>
                    <button
                      onClick={() => togglePublish(b)}
                      className={`badge ${b.isPublished ? 'badge-success' : 'badge-neutral'}`}
                      style={{ cursor:'pointer', border:'none', fontFamily:'var(--font-body)', fontSize:10 }}>
                      {b.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ fontSize:12, color:'var(--t3)' }}>{fmtDate(b.publishedAt||b.createdAt)}</td>
                  <td style={{ fontSize:13, color:'var(--t2)' }}>{b.views||0}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(b.id||b._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>
                  No blog posts yet. <button className="btn btn-ghost btn-sm" onClick={openCreate}>Create your first post</button>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop:16, fontSize:12, color:'var(--t3)' }}>
        💡 Click status badge to toggle publish/unpublish. Published posts appear on the public blog.
      </div>
    </div>
  );
};

export default AdminBlog;
