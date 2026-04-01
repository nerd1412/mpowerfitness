import React from 'react';
import { Link } from 'react-router-dom';

/**
 * MPOWER FITNESS Logo
 * - No decorative dots
 * - Scales cleanly via height prop
 * - Orange accent bar + lime slash + FITNESS text
 */

export const LogoFull = ({ height = 44, linkTo = '/', style }) => {
  const w = Math.round((540 / 150) * height);
  const svg = (
    <svg
      width={w}
      height={height}
      viewBox="0 0 540 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {/* Ghost italic M background */}
      <text
        x="16" y="142"
        fontFamily="'Arial Black','Helvetica Neue','Impact',sans-serif"
        fontSize="175" fontWeight="900" fontStyle="italic"
        fill="#1e2230" letterSpacing="-6"
      >M</text>

      {/* Orange left accent bar */}
      <rect x="20" y="44" width="6" height="72" rx="2" fill="#FF5F1F"/>

      {/* MPOWER wordmark */}
      <text
        x="34" y="108"
        fontFamily="'Arial Black','Helvetica Neue','Impact',sans-serif"
        fontSize="68" fontWeight="900"
        fill="#F0F2F5" letterSpacing="-1"
      >MPOWER</text>

      {/* Neon lime slash bar */}
      <polygon points="34,118 490,118 487,127 31,127" fill="#C8F135"/>

      {/* FITNESS label */}
      <text
        x="490" y="143"
        textAnchor="end"
        fontFamily="'Helvetica Neue',Arial,sans-serif"
        fontSize="12" fontWeight="600"
        letterSpacing="6" fill="#C8F135"
      >FITNESS</text>
    </svg>
  );

  if (!linkTo) return svg;
  return (
    <Link to={linkTo} style={{ display: 'inline-block', textDecoration: 'none', lineHeight: 0 }} aria-label="Mpower Fitness">
      {svg}
    </Link>
  );
};

export const LogoIcon = ({ size = 40, style }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 80 80" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0, ...style }}
  >
    <rect width="80" height="80" rx="13" fill="#07080A"/>
    {/* Ghost M */}
    <text x="-6" y="76"
      fontFamily="'Arial Black','Helvetica Neue','Impact',sans-serif"
      fontSize="80" fontWeight="900" fontStyle="italic"
      fill="#1e2230" letterSpacing="-3"
    >M</text>
    {/* Orange bar */}
    <rect x="10" y="22" width="4" height="38" rx="1.5" fill="#FF5F1F"/>
    {/* Upright M */}
    <text x="16" y="56"
      fontFamily="'Arial Black','Helvetica Neue','Impact',sans-serif"
      fontSize="38" fontWeight="900"
      fill="#F0F2F5" letterSpacing="-1"
    >M</text>
    {/* Slash */}
    <polygon points="14,60 68,60 66,67 12,67" fill="#C8F135"/>
  </svg>
);

export const LogoMark = ({ height = 32 }) => <LogoFull height={height} linkTo={null}/>;

export default LogoFull;
