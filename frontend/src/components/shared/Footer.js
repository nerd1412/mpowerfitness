import React from 'react';
import { Link } from 'react-router-dom';
import { LogoFull } from './Logo';

/* ── Brand SVG icons (official brand colours on hover) ── */
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="20" height="14" viewBox="0 0 24 17" fill="currentColor">
    <path d="M23.495 2.205a3.02 3.02 0 0 0-2.122-2.136C19.505 0 12 0 12 0S4.495 0 2.627.069a3.02 3.02 0 0 0-2.122 2.136C0 4.069 0 8.05 0 8.05s0 3.981.505 5.845a3.02 3.02 0 0 0 2.122 2.136C4.495 16.1 12 16.1 12 16.1s7.505 0 9.373-.069a3.02 3.02 0 0 0 2.122-2.136C24 12.031 24 8.05 24 8.05s0-3.981-.505-5.845zM9.609 11.435V4.665l6.264 3.385-6.264 3.385z"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/mpowerfitness', Icon: InstagramIcon, hoverColor: '#E1306C' },
  { label: 'YouTube',   href: 'https://youtube.com/@mpowerfitness',  Icon: YouTubeIcon,   hoverColor: '#FF0000' },
  { label: 'X',         href: 'https://x.com/mpowerfitness',         Icon: XIcon,         hoverColor: '#000000' },
  { label: 'LinkedIn',  href: 'https://linkedin.com/company/mpowerfitness', Icon: LinkedInIcon, hoverColor: '#0A66C2' },
];

const FooterLink = ({ to, href, children }) => {
  const style = { fontSize:13, color:'var(--t2)', textDecoration:'none', transition:'color .13s', display:'block' };
  const hover = e => e.currentTarget.style.color = 'var(--t1)';
  const out   = e => e.currentTarget.style.color = 'var(--t2)';
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={style} onMouseEnter={hover} onMouseLeave={out}>{children}</a>;
  return <Link to={to} style={style} onMouseEnter={hover} onMouseLeave={out}>{children}</Link>;
};

const Footer = ({ variant = 'app' }) => {
  const isLanding = variant === 'landing';

  return (
    <footer style={{
      background: 'var(--carbon)',
      borderTop: '1px solid var(--border)',
      padding: isLanding ? 'clamp(32px,5vw,56px) clamp(16px,4vw,40px) 24px' : '32px var(--page-pad,28px) 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: isLanding ? 1200 : '100%', margin: '0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:32, marginBottom:32 }}>

          {/* Brand column */}
          <div style={{ gridColumn:'span 1' }}>
            <LogoFull height={32} linkTo={isLanding ? '/' : null}/>
            <p style={{ fontSize:13, color:'var(--t2)', marginTop:12, lineHeight:1.65, maxWidth:240 }}>
              India's all-in-one fitness platform — workouts, nutrition, certified trainers and progress tracking.
            </p>
            {/* Social icons */}
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              {SOCIALS.map(({ label, href, Icon, hoverColor }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                  style={{ width:36, height:36, borderRadius:'var(--r-md)', background:'var(--s2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t2)', textDecoration:'none', transition:'all .15s', flexShrink:0 }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--s3)'; e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color=hoverColor; }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--s2)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--t2)'; }}>
                  <Icon/>
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Platform</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <FooterLink to="/user/workouts">Workout Library</FooterLink>
              <FooterLink to="/user/trainers">Find a Trainer</FooterLink>
              <FooterLink to="/user/programs">Programs & Plans</FooterLink>
              <FooterLink to="/user/nutrition">Nutrition Plans</FooterLink>
              <FooterLink to="/user/progress">Progress Tracking</FooterLink>
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Company</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <FooterLink to="/info/about">About Us</FooterLink>
              <FooterLink to="/info/blog">Blog & Tips</FooterLink>
              <FooterLink to="/info/become-trainer">Become a Trainer</FooterLink>
              <FooterLink to="/info/careers">Careers</FooterLink>
              <FooterLink to="/info/contact">Contact Us</FooterLink>
            </div>
          </div>

          {/* Support */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Support</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <FooterLink to="/info/help">Help Centre</FooterLink>
              <FooterLink to="/info/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/info/terms">Terms of Use</FooterLink>
              <FooterLink to="/info/refund">Refund Policy</FooterLink>
              <FooterLink to="/info/cookies">Cookie Policy</FooterLink>
            </div>
          </div>

          {/* Login links */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Login</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <FooterLink to="/login">User Login</FooterLink>
              <FooterLink to="/trainer/login">Trainer Login</FooterLink>
              <FooterLink to="/admin/login">Admin Panel</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
              <FooterLink to="/trainer/register">Trainer Register</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <span style={{ fontSize:12, color:'var(--t3)' }}>
            © {new Date().getFullYear()} Mpower Fitness Pvt. Ltd. All rights reserved. Made with 💪 in India.
          </span>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {['UPI Payments','SSL Secured','GDPR Compliant'].map(badge => (
              <span key={badge} style={{ fontSize:11, color:'var(--t3)', padding:'2px 8px', background:'var(--s2)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)' }}>{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
