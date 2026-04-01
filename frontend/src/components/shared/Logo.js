import React from 'react';
import { Link } from 'react-router-dom';

/* ─── Lightning bolt icon paths ─────────────────────────────────── */
const BoltPath = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
    <path
      d="M13 2L4.5 13.5H11L10 22L20.5 9.5H14L13 2Z"
      fill="#C8F135"
      stroke="#C8F135"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Full logo (icon + wordmark) ───────────────────────────────── */
export const LogoFull = ({ height = 44, linkTo = '/', style }) => {
  const scale = height / 44;

  const logo = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(10 * scale),
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Icon box */}
      <div style={{
        width:  Math.round(38 * scale),
        height: Math.round(38 * scale),
        borderRadius: Math.round(9 * scale),
        background: '#07080A',
        border: '1.5px solid rgba(200,241,53,0.35)',
        boxShadow: '0 0 14px rgba(200,241,53,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Math.round(7 * scale),
        flexShrink: 0,
      }}>
        <BoltPath />
      </div>

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: Math.round(2 * scale) }}>
        {/* M + POWER on same line */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{
            fontFamily: "'Outfit', 'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 900,
            fontSize: Math.round(22 * scale),
            letterSpacing: '-0.03em',
            color: '#C8F135',
            lineHeight: 1,
          }}>M</span>
          <span style={{
            fontFamily: "'Outfit', 'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 800,
            fontSize: Math.round(18 * scale),
            letterSpacing: '0.04em',
            color: '#F0F2F5',
            lineHeight: 1,
          }}>POWER</span>
        </div>

        {/* Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(4 * scale) }}>
          <div style={{ height: 1, width: Math.round(10 * scale), background: '#C8F135', opacity: 0.5 }} />
          <span style={{
            fontFamily: "'Outfit', 'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 500,
            fontSize: Math.round(7 * scale),
            letterSpacing: '0.12em',
            color: '#C8F135',
            opacity: 0.75,
            lineHeight: 1,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>strength · health · nutrition</span>
          <div style={{ height: 1, width: Math.round(10 * scale), background: '#C8F135', opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );

  if (!linkTo) return logo;
  return (
    <Link to={linkTo} style={{ display: 'inline-flex', textDecoration: 'none', lineHeight: 0 }} aria-label="Mpower Fitness">
      {logo}
    </Link>
  );
};

/* ─── Icon-only (collapsed sidebar) ────────────────────────────── */
export const LogoIcon = ({ size = 40, style }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.225),
    background: '#07080A',
    border: '1.5px solid rgba(200,241,53,0.35)',
    boxShadow: '0 0 12px rgba(200,241,53,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Math.round(size * 0.18),
    flexShrink: 0,
    userSelect: 'none',
    ...style,
  }}>
    <BoltPath />
  </div>
);

/* ─── Mark (no link wrapper) ────────────────────────────────────── */
export const LogoMark = ({ height = 32 }) => <LogoFull height={height} linkTo={null} />;

export default LogoFull;
