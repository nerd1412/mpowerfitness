import React from 'react';
import { Link } from 'react-router-dom';

/*
 * Original Styled Logo (v2.0)
 *
 * Design logic:
 * • Base: Italic "Ghost M" (the brand symbol) #1e2230.
 * • Accent: Orange vertical bar #FF5F1F.
 * • Wordmark: "MPower" Bold #F0F2F5.
 * • Baseline: Neon lime underline #C8F135.
 * • Symmetrical "FITNESS" sub-branded block.
 * • All dots removed as requested.
 */
const OriginalLogoSVG = ({ size = 36 }) => {
  const scale = size / 36;
  return (
    <svg viewBox="0 0 540 180" width={Math.round(112 * scale)} height={Math.round(38 * scale)} fill="none" style={{ display: 'block' }}>
      {/* Ghost italic M — visual foundation */}
      <text x="0" y="160"
        fontFamily="'Inter', 'Arial Black', sans-serif"
        fontSize="172" fontWeight="900" fontStyle="italic"
        fill="#1e2230" letterSpacing="-6">M</text>

      {/* Orange accent bar */}
      <rect x="25" y="44" width="8" height="72" rx="2.5" fill="#FF5F1F"/>

      {/* MPower wordmark — the brand name */}
      <text x="44" y="106"
        fontFamily="'Inter', 'Arial Black', sans-serif"
        fontSize="82" fontWeight="900"
        fill="#F0F2F5" letterSpacing="-2">MPower</text>

      {/* Underline bar — the lime streak */}
      <rect x="44" y="122" width="460" height="12" rx="3" fill="#C8F135"/>

      {/* FITNESS text — spaced perfectly for symmetry */}
      <text x="44" y="162"
        fontFamily="'Inter', sans-serif"
        fontSize="24" fontWeight="700"
        letterSpacing="28" fill="#C8F135" textTransform="uppercase">FITNESS</text>
    </svg>
  );
};

/* ─── Full logo (brand name version) ────────────────────────────── */
export const LogoFull = ({ height = 44, linkTo = '/', style }) => {
  const scale = height / 44;
  const logo = <OriginalLogoSVG size={Math.round(44 * scale)} />;

  if (!linkTo) return <div style={{ display:'flex', alignItems:'center', ...style }}>{logo}</div>;
  return (
    <Link to={linkTo} style={{ display:'flex', alignItems:'center', textDecoration:'none', ...style }} aria-label="MPower Fitness">
      {logo}
    </Link>
  );
};

/* ─── Icon-only (sidebar / favicon style) ────────────────────────── */
export const LogoIcon = ({ size = 40, style }) => {
  const scale = size / 40;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(13 * scale),
      background: '#111318', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style
    }}>
      <svg viewBox="0 0 100 100" width={Math.round(size * 0.85)} height={Math.round(size * 0.85)} fill="none">
        {/* Ghost M */}
        <text x="-15" y="90"
          fontFamily="'Inter', 'Arial Black', sans-serif"
          fontSize="110" fontWeight="900" fontStyle="italic"
          fill="#1e2230" letterSpacing="-4">M</text>

        {/* Orange vertical */}
        <rect x="18" y="24" width="7" height="44" rx="2" fill="#FF5F1F"/>

        {/* M foreground */}
        <text x="28" y="60"
          fontFamily="'Inter', 'Arial Black', sans-serif"
          fontSize="54" fontWeight="900"
          fill="#F0F2F5" letterSpacing="-2">M</text>

        {/* Lime slash */}
        <rect x="22" y="68" width="56" height="8" rx="1.5" fill="#C8F135"/>
      </svg>
    </div>
  );
};

/* ─── Mark (Static component) ───────────────────────────────────── */
export const LogoMark = ({ height = 32 }) => <LogoFull height={height} linkTo={null} />;

export default LogoFull;
