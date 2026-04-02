import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogoFull } from './Logo';
import useAuthStore from '../../store/authStore';

/* ── Shared link component ───────────────────────────────────────────── */
const NavItem = ({ to, icon, label, collapsed }) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    style={{ textDecoration:'none' }}
    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
  >
    <span className="nav-link-icon">{icon}</span>
    {!collapsed && <span style={{ overflow:'hidden', textOverflow:'ellipsis', lineHeight:1.3 }}>{label}</span>}
  </NavLink>
);

/* ── Sign-out icon ───────────────────────────────────────────────────── */
const SignOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

/* ── Shared sidebar shell ────────────────────────────────────────────── */
const SidebarShell = ({ collapsed, onToggle, accent, badge, badgeClass, userSub, navItems, onLogout }) => {
  const { user } = useAuthStore();

  return (
    <div style={{
      width: collapsed ? 72 : 252,
      height:'100vh', background:'var(--carbon)',
      borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column',
      overflow:'hidden', transition:'width .22s ease',
    }}>

      {/* Logo row */}
      <div style={{
        padding: collapsed ? '14px 0' : '14px 14px',
        borderBottom:'1px solid var(--border)',
        display:'flex', flexDirection:'column', gap:5,
        flexShrink:0, height:64,
        justifyContent:'center',
      }}>
        {collapsed ? (
          /* Collapsed: show icon M */
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{
              width:34, height:34, borderRadius:8,
              background:'#07080A',
              border:`1px solid rgba(${accent},.2)`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontFamily:"'Arial Black',sans-serif", fontWeight:900, fontSize:15, color:'var(--lime)', lineHeight:1 }}>M</span>
            </div>
          </div>
        ) : (
          <>
            <LogoFull height={34} linkTo={null}/>
            {badge && (
              <span className={`badge ${badgeClass}`} style={{ alignSelf:'flex-start', fontSize:9, letterSpacing:'.1em' }}>
                {badge}
              </span>
            )}
          </>
        )}
      </div>

      {/* User info strip */}
      {!collapsed && user && (
        <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:'50%', flexShrink:0,
              background:`rgba(${accent},.14)`, color:`rgb(${accent})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:700,
            }}>{user.name?.[0]?.toUpperCase() || '?'}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--t1)' }}>
                {user.name}
              </div>
              <div style={{ fontSize:11, color:`rgb(${accent})`, marginTop:1 }}>{userSub}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'6px 0' }}>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed}/>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding:'6px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        <button
          onClick={onLogout}
          aria-label="Sign out"
          style={{
            width:'100%', display:'flex', alignItems:'center',
            gap:10, padding:'9px 12px',
            borderRadius:'var(--r-md)', border:'none', cursor:'pointer',
            background:'none', color:'var(--t3)',
            fontSize:14, fontWeight:500, transition:'all .14s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--s1)'; e.currentTarget.style.color='var(--t1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--t3)'; }}
        >
          <SignOutIcon/>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
};

/* ── User Sidebar ─────────────────────────────────────────────────────── */
export const UserSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); toast.success('Signed out'); navigate('/'); };
  return (
    <SidebarShell
      collapsed={collapsed} onToggle={onToggle}
      accent="200,241,53"
      userSub={`🔥 ${user?.streak || 0} day streak`}
      navItems={[
        { to:'/user/dashboard', icon:'⊞', label:'Dashboard' },
        { to:'/user/workouts',  icon:'💪', label:'Workouts' },
        { to:'/user/nutrition', icon:'🥗', label:'Nutrition' },
        { to:'/user/progress',  icon:'📊', label:'Progress' },
        { to:'/user/trainers',  icon:'🏅', label:'Find Trainers' },
        { to:'/user/sessions',  icon:'🗓️', label:'My Sessions' },
        { to:'/user/bookings',  icon:'📅', label:'My Bookings' },
        { to:'/user/programs',  icon:'🎯', label:'Programs' },
        { to:'/user/community',  icon:'🫂', label:'Community' },
        { to:'/user/chat',      icon:'💬', label:'Messages' },
        { to:'/user/profile',   icon:'👤', label:'Profile' },
      ]}
      onLogout={doLogout}
    />
  );
};

/* ── Trainer Sidebar ──────────────────────────────────────────────────── */
export const TrainerSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); toast.success('Signed out'); navigate('/'); };
  return (
    <SidebarShell
      collapsed={collapsed} onToggle={onToggle}
      accent="255,95,31"
      badge="Trainer" badgeClass="badge-orange"
      userSub={`⭐ ${user?.rating?.toFixed(1) || '5.0'} rating`}
      navItems={[
        { to:'/trainer/dashboard', icon:'⊞', label:'Dashboard' },
        { to:'/trainer/bookings',  icon:'📅', label:'Bookings' },
        { to:'/trainer/clients',   icon:'👥', label:'My Clients' },
        { to:'/trainer/schedule',  icon:'🗓️', label:'Availability' },
        { to:'/trainer/workouts',  icon:'💪', label:'Workout Plans' },
        { to:'/trainer/nutrition', icon:'🥗', label:'Nutrition Plans' },
        { to:'/trainer/analytics', icon:'📈', label:'Analytics' },
        { to:'/trainer/chat',      icon:'💬', label:'Messages' },
        { to:'/trainer/profile',   icon:'👤', label:'Profile' },
      ]}
      onLogout={doLogout}
    />
  );
};

/* ── Admin Sidebar ────────────────────────────────────────────────────── */
export const AdminSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); toast.success('Signed out'); navigate('/'); };
  return (
    <SidebarShell
      collapsed={collapsed} onToggle={onToggle}
      accent="78,159,255"
      badge="Admin" badgeClass="badge-info"
      userSub={user?.role?.toUpperCase() || 'ADMIN'}
      navItems={[
        { to:'/admin/dashboard',     icon:'⊞', label:'Overview' },
        { to:'/admin/users',         icon:'👥', label:'Users' },
        { to:'/admin/trainers',      icon:'🏅', label:'Trainers' },
        { to:'/admin/bookings',      icon:'📅', label:'Bookings' },
        { to:'/admin/payments',      icon:'💳', label:'Revenue' },
        { to:'/admin/workouts',      icon:'💪', label:'Workouts' },
        { to:'/admin/programs',      icon:'🎯', label:'Programs' },
        { to:'/admin/nutrition',     icon:'🥗', label:'Nutrition' },
        { to:'/admin/analytics',     icon:'📈', label:'Analytics' },
        { to:'/admin/notifications', icon:'🔔', label:'Notifications' },
        { to:'/admin/blog',          icon:'📝', label:'Blog' },
        { to:'/admin/consultations', icon:'🩺', label:'Consultations' },
      ]}
      onLogout={doLogout}
    />
  );
};
