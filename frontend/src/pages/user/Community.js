import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

/* ── helpers ───────────────────────────────────────────────────────── */
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const POST_TYPES = [
  { value:'', label:'All' },
  { value:'discussion', label:'Discussion' },
  { value:'milestone', label:'Milestone' },
  { value:'question', label:'Question' },
  { value:'tip', label:'Tip' },
];

const TYPE_COLORS = {
  discussion: 'rgba(200,241,53,0.15)',
  milestone:  'rgba(255,95,31,0.15)',
  question:   'rgba(78,159,255,0.15)',
  tip:        'rgba(34,217,122,0.15)',
};
const TYPE_TEXT = {
  discussion: 'var(--neon-lime)',
  milestone:  'var(--electric-orange)',
  question:   '#4E9FFF',
  tip:        '#22D97A',
};

/* ── Group list card ───────────────────────────────────────────────── */
const GroupCard = ({ group, onClick }) => (
  <button type="button" onClick={onClick} style={{
    background:'var(--surface)', border:'1px solid var(--border)',
    borderRadius:14, padding:'20px', textAlign:'left', cursor:'pointer',
    transition:'all 0.2s', width:'100%',
    borderTop: `3px solid ${group.color || 'var(--neon-lime)'}`,
  }}
  onMouseEnter={e => { e.currentTarget.style.borderColor = group.color || 'var(--neon-lime)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
      <span style={{ fontSize:28, lineHeight:1, flexShrink:0 }}>{group.icon || '👥'}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', lineHeight:1.3 }}>{group.name}</div>
        {group.isFeatured && (
          <span style={{ fontSize:10, background:`${group.color}22`, color:group.color,
            border:`1px solid ${group.color}44`, borderRadius:20, padding:'2px 8px',
            fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', display:'inline-block', marginTop:4 }}>
            Featured
          </span>
        )}
      </div>
    </div>
    <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5, margin:'0 0 12px',
      display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
      {group.description}
    </p>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontSize:12, color:'var(--text-muted)' }}>
        👥 {(group.memberCount || 0).toLocaleString()} members
      </span>
      <span style={{ fontSize:12, color: group.color || 'var(--neon-lime)', fontWeight:600 }}>
        Join →
      </span>
    </div>
  </button>
);

/* ── Post card ─────────────────────────────────────────────────────── */
const PostCard = ({ post, onLike, onDelete, currentUserId }) => {
  const bg = TYPE_COLORS[post.type] || 'rgba(200,241,53,0.07)';
  const tc = TYPE_TEXT[post.type] || 'var(--neon-lime)';
  const liked = (post.likedBy || []).includes(currentUserId);
  const isOwner = post.authorId === currentUserId;

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12,
      padding:'18px 20px', marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--surface-2)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, border:'1px solid var(--border)', flexShrink:0 }}>
            {post.authorName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>{post.authorName}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, background:bg, color:tc,
            border:`1px solid ${tc}33`, borderRadius:20, padding:'3px 9px', fontWeight:600,
            textTransform:'capitalize' }}>
            {post.type || 'discussion'}
          </span>
          {isOwner && (
            <button onClick={() => onDelete(post.id)} title="Delete post" style={{
              background:'none', border:'none', cursor:'pointer', padding:'4px',
              color:'var(--text-muted)', fontSize:13,
            }}>🗑</button>
          )}
        </div>
      </div>

      <p style={{ fontSize:14, color:'var(--text-primary)', lineHeight:1.6, margin:'0 0 12px',
        whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
        {post.content}
      </p>

      {post.tags?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{ fontSize:11, background:'var(--surface-2)',
              color:'var(--text-muted)', borderRadius:20, padding:'2px 9px', border:'1px solid var(--border)' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:16, paddingTop:8, borderTop:'1px solid var(--border)' }}>
        <button onClick={() => onLike(post.id)} style={{
          background:'none', border:'none', cursor:'pointer', padding:0,
          display:'flex', alignItems:'center', gap:5, fontSize:13,
          color: liked ? 'var(--electric-orange)' : 'var(--text-muted)',
          fontFamily:'var(--font-body)',
        }}>
          <span style={{ fontSize:16 }}>{liked ? '❤️' : '🤍'}</span>
          {post.likes || 0}
        </button>
        {post.isPinned && (
          <span style={{ fontSize:11, color:'var(--neon-lime)', display:'flex', alignItems:'center', gap:4 }}>
            📌 Pinned
          </span>
        )}
      </div>
    </div>
  );
};

/* ── Main component ────────────────────────────────────────────────── */
const Community = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const [postType, setPostType] = useState('');
  const [newPost, setNewPost] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newType, setNewType] = useState('discussion');
  const [showForm, setShowForm] = useState(false);

  /* ── Groups list ── */
  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['community-groups'],
    queryFn: () => api.get('/community/groups').then(r => r.data),
  });

  /* ── Posts in a group ── */
  const { data: groupData, isLoading: loadingPosts } = useQuery({
    queryKey: ['community-posts', slug, postType],
    queryFn: () => api.get(`/community/groups/${slug}/posts`, { params: { type: postType || undefined, limit:50 } }).then(r => r.data),
    enabled: !!slug,
  });

  /* ── Mutations ── */
  const createPost = useMutation({
    mutationFn: (body) => api.post(`/community/groups/${slug}/posts`, body),
    onSuccess: () => {
      qc.invalidateQueries(['community-posts', slug]);
      setNewPost(''); setNewTags(''); setShowForm(false);
      toast.success('Post shared!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to post'),
  });

  const likePost = useMutation({
    mutationFn: (id) => api.patch(`/community/posts/${id}/like`),
    onSuccess: () => qc.invalidateQueries(['community-posts', slug]),
  });

  const deletePost = useMutation({
    mutationFn: (id) => api.delete(`/community/posts/${id}`),
    onSuccess: () => { qc.invalidateQueries(['community-posts', slug]); toast.success('Post deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const handlePost = () => {
    if (!newPost.trim()) return toast.error('Write something first');
    const tags = newTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    createPost.mutate({ content: newPost.trim(), type: newType, tags });
  };

  /* ── Group detail view ── */
  if (slug) {
    const group = groupData?.group;
    const posts = groupData?.posts || [];

    return (
      <div style={{ padding:'28px 24px', maxWidth:760, margin:'0 auto' }}>
        {/* Back */}
        <button onClick={() => navigate('/user/community')} className="btn btn-ghost" style={{ marginBottom:20, fontSize:13 }}>
          ← All Communities
        </button>

        {loadingPosts ? (
          <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
        ) : (
          <>
            {/* Group header */}
            {group && (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:16, padding:'24px', marginBottom:24,
                borderTop: `4px solid ${group.color || 'var(--neon-lime)'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                  <span style={{ fontSize:36 }}>{group.icon || '👥'}</span>
                  <div>
                    <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>{group.name}</h1>
                    <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:3 }}>
                      👥 {(group.memberCount || 0).toLocaleString()} members
                    </div>
                  </div>
                </div>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>
                  {group.description}
                </p>
                {group.rules?.length > 0 && (
                  <div style={{ marginTop:14, padding:'12px 14px', background:'var(--surface-2)',
                    borderRadius:8, border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)',
                      textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                      Community Rules
                    </div>
                    {group.rules.map((r, i) => (
                      <div key={i} style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:4,
                        display:'flex', gap:8 }}>
                        <span style={{ color:'var(--neon-lime)', flexShrink:0 }}>{i+1}.</span>
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post form toggle */}
            <div style={{ marginBottom:16 }}>
              {!showForm ? (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}
                  style={{ width:'100%', height:44 }}>
                  + Share your experience
                </button>
              ) : (
                <div style={{ background:'var(--surface)', border:'1px solid rgba(200,241,53,0.3)',
                  borderRadius:12, padding:'18px' }}>
                  <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                    {POST_TYPES.slice(1).map(t => (
                      <button key={t.value} type="button" onClick={() => setNewType(t.value)} style={{
                        padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600,
                        fontFamily:'var(--font-body)',
                        background: newType === t.value ? 'rgba(200,241,53,0.15)' : 'var(--surface-2)',
                        border: `1px solid ${newType === t.value ? 'rgba(200,241,53,0.45)' : 'var(--border)'}`,
                        color: newType === t.value ? 'var(--neon-lime)' : 'var(--text-muted)',
                      }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder="Share your journey, ask a question, celebrate a win…"
                    rows={4}
                    style={{ width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)',
                      borderRadius:8, padding:'12px', color:'var(--text-primary)', fontSize:14,
                      resize:'vertical', fontFamily:'var(--font-body)', lineHeight:1.5, boxSizing:'border-box' }}
                  />
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="Tags (comma-separated): pcod, insulin, tips"
                    style={{ width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)',
                      borderRadius:8, padding:'10px 12px', color:'var(--text-primary)', fontSize:13,
                      fontFamily:'var(--font-body)', marginTop:8, boxSizing:'border-box' }}
                  />
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handlePost}
                      disabled={createPost.isPending || !newPost.trim()} style={{ flex:1 }}>
                      {createPost.isPending ? 'Posting…' : 'Share Post'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
              {POST_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setPostType(t.value)} style={{
                  padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600,
                  fontFamily:'var(--font-body)',
                  background: postType === t.value ? 'rgba(200,241,53,0.15)' : 'var(--surface-2)',
                  border: `1px solid ${postType === t.value ? 'rgba(200,241,53,0.45)' : 'var(--border)'}`,
                  color: postType === t.value ? 'var(--neon-lime)' : 'var(--text-muted)',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 24px', background:'var(--surface)',
                border:'1px solid var(--border)', borderRadius:12 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🌱</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>Be the first to post!</div>
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>
                  Share your journey, ask questions, or celebrate a win. Every community starts with one voice.
                </p>
              </div>
            ) : (
              posts.map(p => (
                <PostCard key={p.id} post={p}
                  onLike={(id) => likePost.mutate(id)}
                  onDelete={(id) => deletePost.mutate(id)}
                  currentUserId={user?.id}
                />
              ))
            )}
          </>
        )}
      </div>
    );
  }

  /* ── Groups list view ── */
  const groups = groupsData?.groups || [];
  const featured = groups.filter(g => g.isFeatured);
  const others = groups.filter(g => !g.isFeatured);

  return (
    <div style={{ padding:'28px 24px', maxWidth:960, margin:'0 auto' }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg, rgba(200,241,53,0.07) 0%, rgba(255,95,31,0.05) 100%)',
        border:'1px solid var(--border)', borderRadius:16, padding:'28px', marginBottom:32, textAlign:'center' }}>
        <div style={{ fontSize:36, marginBottom:10 }}>🫂</div>
        <h1 style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>Condition-Specific Communities</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.6, maxWidth:560, margin:'0 auto' }}>
          You're not alone. Connect with people managing the same health conditions, share science-backed tips,
          celebrate wins, and hold each other accountable.
        </p>
      </div>

      {loadingGroups ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
      ) : (
        <>
          {featured.length > 0 && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Featured Groups</h2>
                <div style={{ flex:1, height:1, background:'var(--border)' }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14, marginBottom:28 }}>
                {featured.map(g => (
                  <GroupCard key={g.id} group={g} onClick={() => navigate(`/user/community/${g.slug}`)}/>
                ))}
              </div>
            </>
          )}

          {others.length > 0 && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>More Communities</h2>
                <div style={{ flex:1, height:1, background:'var(--border)' }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
                {others.map(g => (
                  <GroupCard key={g.id} group={g} onClick={() => navigate(`/user/community/${g.slug}`)}/>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Community;
