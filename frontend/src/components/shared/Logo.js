import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Standard Logo Component (Final Brand Version)
 * 
 * Objectives:
 * 1. HIGH VISIBILITY: Scaled to 55px height to ensure readability of the tagline across all screens.
 * 2. NO OTHER CHANGES: Strictly sizing.
 */
const FinalLogoFixed = ({ height = 55, style }) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      userSelect: 'none',
      ...style
    }}>
      {/* 
          Using your exact provided logo file: oglogo_final1.png
          Standard height: 55px.
      */}
      <img 
        src="/oglogo_final1.png" 
        alt="MPower Fitness"
        style={{
          height: height,
          width: 'auto', /* Preserves exact aspect ratio for the tagline */
          display: 'block',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

/* ─── Ready-to-use Standard Components ───────────────────────────── */
export const LogoFull = ({ height = 55, linkTo = '/', style }) => {
  const logo = <FinalLogoFixed height={height} style={style} />;

  if (!linkTo) return logo;
  return (
    <Link to={linkTo} style={{ display:'flex', alignItems:'center', textDecoration:'none' }} aria-label="MPower Fitness">
      {logo}
    </Link>
  );
};

export const LogoIcon = ({ size = 40, style }) => {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '10px',
      background: '#0D0E12', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      ...style
    }}>
      <img 
        src="/oglogo_final1.png" 
        alt="MP"
        style={{
          height: size * 1.8,
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'left center',
          marginLeft: '40%' /* Focuses specifically on the MP icon mark */
        }}
      />
    </div>
  );
};

export const LogoMark = ({ height = 55 }) => <LogoFull height={height} linkTo={null} />;

export default LogoFull;
