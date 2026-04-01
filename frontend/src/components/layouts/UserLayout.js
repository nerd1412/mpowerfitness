import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UserSidebar, TrainerSidebar, AdminSidebar } from '../shared/Sidebar';
import NotificationBell from '../shared/NotificationBell';
import useAuthStore from '../../store/authStore';
import Footer from '../shared/Footer';

/* ── Page title map ──────────────────────────────────────────────────── */
const TITLES = {
  '/user/dashboard':'Dashboard','/user/workouts':'Workout Library',
  '/user/progress':'Progress','/user/nutrition':'Nutrition',
  '/user/trainers':'Find Trainers','/user/sessions':'My Sessions','/user/bookings':'My Bookings',
  '/user/programs':'Programs','/user/chat':'Messages','/user/profile':'Profile',
  '/trainer/dashboard':'Dashboard','/trainer/clients':'My Clients',
  '/trainer/schedule':'Availability','/trainer/bookings':'Bookings',
  '/trainer/workouts':'Workout Plans','/trainer/nutrition':'Nutrition Plans',
  '/trainer/analytics':'Analytics','/trainer/chat':'Messages','/trainer/profile':'Profile',
  '/admin/dashboard':'Overview','/admin/trainers':'Trainers',
  '/admin/users':'Users','/admin/bookings':'Bookings',
  '/admin/payments':'Revenue','/admin/workouts':'Workouts',
  '/admin/programs':'Programs','/admin/nutrition':'Nutrition',
  '/admin/analytics':'Analytics','/admin/notifications':'Notifications', '/admin/blog':'Blog Management',
};

/* ── Icons ───────────────────────────────────────────────────────────── */
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CollapseIcon = ({ collapsed }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
  </svg>
);

/* ── AppLayout ───────────────────────────────────────────────────────── */
const AppLayout = ({ SidebarComp, accent = '200,241,53' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();

  /* Detect mobile */
  const checkMobile = useCallback(() => {
    const m = window.innerWidth <= 768;
    setIsMobile(m);
    if (!m) setMobileOpen(false);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  /* Close mobile sidebar on navigation */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sidebarW = isMobile ? 252 : (collapsed ? 72 : 252);
  const marginL  = isMobile ? 0 : sidebarW;
  const title    = TITLES[location.pathname] || 'Mpower Fitness';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--black)', position:'relative' }}>

      {/* ── Mobile dim overlay ── */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.65)',
            zIndex:199, backdropFilter:'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <div style={{
        position:'fixed', top:0, left:0, height:'100vh', zIndex:200,
        width: sidebarW,
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform .25s ease, width .22s ease',
        boxShadow: isMobile && mobileOpen ? '4px 0 24px rgba(0,0,0,.5)' : 'none',
      }}>
        <SidebarComp
          collapsed={!isMobile && collapsed}
          onToggle={() => isMobile ? setMobileOpen(false) : setCollapsed(c => !c)}
        />
      </div>

      {/* ── Main ── */}
      <div style={{
        flex:1, minHeight:'100vh', display:'flex', flexDirection:'column',
        marginLeft: marginL,
        transition: 'margin-left .22s ease',
        minWidth: 0,
      }}>
        {/* Topbar */}
        <header style={{
          height:'var(--topbar-h,64px)',
          background:'var(--carbon)',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 16px 0 14px',
          position:'sticky', top:0, zIndex:100, flexShrink:0,
        }}>
          {/* Left: hamburger (mobile) or collapse toggle (desktop) + title */}
          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
            {isMobile ? (
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t2)', display:'flex', alignItems:'center', padding:6, borderRadius:6, flexShrink:0 }}
              >
                <MenuIcon/>
              </button>
            ) : (
              <button
                onClick={() => setCollapsed(c => !c)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)', display:'flex', alignItems:'center', padding:6, borderRadius:6, flexShrink:0, transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--t2)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--t3)'}
              >
                <CollapseIcon collapsed={collapsed}/>
              </button>
            )}
            <h1 style={{ fontSize:15, fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {title}
            </h1>
          </div>

          {/* Right: bell + avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <NotificationBell/>
            <div style={{ width:1, height:22, background:'var(--border)' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:30, height:30, borderRadius:'50%', flexShrink:0,
                background:`rgba(${accent},.14)`,
                color:`rgb(${accent})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700,
              }}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span style={{ fontSize:13, fontWeight:500, color:'var(--t2)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} className="hide-md">
                {user?.name?.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:'var(--page-pad,28px)', overflowX:'hidden', minWidth:0 }}>
          <Outlet/>
        </main>
        <Footer/>
      </div>
    </div>
  );
};

export const UserLayout    = () => <AppLayout SidebarComp={UserSidebar}    accent="200,241,53"/>;
export const TrainerLayout = () => <AppLayout SidebarComp={TrainerSidebar} accent="255,95,31"/>;
export const AdminLayout   = () => <AppLayout SidebarComp={AdminSidebar}   accent="78,159,255"/>;

export default UserLayout;
