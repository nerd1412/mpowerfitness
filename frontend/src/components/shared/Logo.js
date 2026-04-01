import React from 'react';
import { Link } from 'react-router-dom';

/*
 * MP Monogram Icon
 * Design principles applied:
 *  - Geometric, single-weight strokes for scalability
 *  - Negative space letter "P" implied inside "M" strokes
 *  - Neon-lime accent on connective bridge for brand colour
 *  - Renders crisply from 20px to 200px
 */
const MPMark = ({ size = 32 }) => {
  const s = size;
  return (
    <svg
      viewBox="0 0 40 40"
      width={s}
      height={s}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background square with rounded corners */}
      <rect width="40" height="40" rx="9" fill="#0A0B0D" />

      {/* M strokes — two outer legs + centre peak */}
      {/* Left outer leg */}
      <path d="M7 31 L7 10" stroke="#F0F2F5" strokeWidth="3.2" strokeLinecap="round" />
      {/* Left roof slope */}
      <path d="M7 10 L20 21" stroke="#F0F2F5" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right roof slope */}
      <path d="M20 21 L33 10" stroke="#F0F2F5" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right outer leg (shortened — becomes P vertical) */}
      <path d="M33 10 L33 31" stroke="#F0F2F5" strokeWidth="3.2" strokeLinecap="round" />

      {/* Neon-lime P bowl – horizontal bridge gives P shape on right column */}
      <path
        d="M33 10 Q38 18 33 23"
        stroke="#C8F135"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Horizontal midbar connecting P bowl to vertical */}
      <line x1="33" y1="23" x2="33" y2="23" stroke="#C8F135" strokeWidth="2.8" strokeLinecap="round" />

      {/* Accent dot — brand punctuation (bottom-left) */}
      <circle cx="7" cy="35" r="1.8" fill="#C8F135" />
    </svg>
  );
};

/* ─── Full logo (icon + wordmark) ─────────────────────────────────── */
export const LogoFull = ({ height = 44, linkTo = '/', style }) => {
  const scale = height / 44;
  const iconSize = Math.round(36 * scale);

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
      {/* MP Icon */}
      <MPMark size={iconSize} />

      {/* Wordmark: Mpower Fitness */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        {/* "Mpower" — one visual unit */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{
            fontFamily: "'Outfit', 'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 900,
            fontSize: Math.round(20 * scale),
            letterSpacing: '-0.02em',
            color: '#C8F135',
            lineHeight: 1,
          }}>M</span>
          <span style={{
            fontFamily: "'Outfit', 'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 800,
            fontSize: Math.round(20 * scale),
            letterSpacing: '-0.02em',
            color: '#F0F2F5',
            lineHeight: 1,
          }}>power</span>
        </div>

        {/* "Fitness" sub-label */}
        <span style={{
          fontFamily: "'Outfit', 'Inter', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 500,
          fontSize: Math.round(9 * scale),
          letterSpacing: '0.16em',
          color: '#C8F135',
          opacity: 0.80,
          lineHeight: 1,
          textTransform: 'uppercase',
          marginTop: Math.round(2 * scale),
        }}>Fitness</span>
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

/* ─── Icon-only (collapsed sidebar / favicon) ───────────────────── */
export const LogoIcon = ({ size = 40, style }) => (
  <div style={{ display: 'inline-flex', ...style }}>
    <MPMark size={size} />
  </div>
);

/* ─── Mark (no link wrapper) ────────────────────────────────────── */
export const LogoMark = ({ height = 32 }) => <LogoFull height={height} linkTo={null} />;

export default LogoFull;
