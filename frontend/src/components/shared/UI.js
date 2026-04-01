import React from 'react';

/* ==================== STAT CARD ==================== */
export const StatCard = ({ icon, label, value, sub, color = 'var(--neon-lime)', trend, prefix = '', delay = 0 }) => (
  <div className="stat-card" style={{ animation: `fadeIn 0.4s ease ${delay}s forwards`, opacity: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-md)',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
      }}>{icon}</div>
      {trend !== undefined && (
        <span style={{ fontSize: 12, color: trend >= 0 ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ fontWeight: 800, fontSize: 30, color, lineHeight: 1 }}>{prefix}{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
  </div>
);

/* ==================== MODAL ==================== */
export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 560 }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1, padding: '0 4px' }}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/* ==================== EMPTY STATE ==================== */
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
    <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.5 }}>{icon}</div>
    {title && <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>{title}</h3>}
    {description && <p style={{ fontSize: 14, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>{description}</p>}
    {action && <div style={{ marginTop: 24 }}>{action}</div>}
  </div>
);

/* ==================== LOADING SPINNER ==================== */
export const LoadingSpinner = ({ size = 'md', center = false }) => {
  const sizes = { sm: { w: 20, b: 2 }, md: { w: 32, b: 2.5 }, lg: { w: 48, b: 3 } };
  const s = sizes[size] || sizes.md;
  const spinner = (
    <div style={{
      width: s.w, height: s.w,
      border: `${s.b}px solid rgba(200,241,53,0.15)`,
      borderTopColor: 'var(--neon-lime)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  );
  if (center) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
      {spinner}
    </div>
  );
  return spinner;
};

/* ==================== PAGE HEADER ==================== */
export const PageHeader = ({ title, highlight, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        {title} {highlight && <span style={{ color: 'var(--neon-lime)' }}>{highlight}</span>}
      </h1>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/* ==================== AVATAR ==================== */
export const Avatar = ({ name, src, size = 40, color = 'var(--neon-lime)', bg = 'rgba(200,241,53,0.15)' }) => {
  if (src) return <img src={src} alt={name} className="avatar" style={{ width: size, height: size }} />;
  return (
    <div className="avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4, background: bg, color }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
};

/* ==================== BADGE COMPONENT ==================== */
export const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-warning', confirmed: 'badge-success', cancelled: 'badge-error',
    completed: 'badge-info', active: 'badge-success', inactive: 'badge-neutral',
    approved: 'badge-success', rejected: 'badge-error', free: 'badge-neutral',
    monthly: 'badge-neon', quarterly: 'badge-orange', premium: 'badge-info',
    paid: 'badge-success', success: 'badge-success', failed: 'badge-error',
    no_show: 'badge-neutral',
  };
  return (
    <span className={`badge ${map[status] || 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

/* ==================== SEARCH INPUT ==================== */
export const SearchInput = ({ value, onChange, placeholder = 'Search...', style }) => (
  <div style={{ position: 'relative', ...style }}>
    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
    <input
      className="form-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ paddingLeft: 38 }}
    />
  </div>
);

/* ==================== FILTER TABS ==================== */
export const FilterTabs = ({ options, active, onChange, style }) => (
  <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', ...style }}>
    {options.map((opt, i) => (
      <button key={opt.value || opt} onClick={() => onChange(opt.value || opt)}
        style={{
          padding: '9px 16px', background: (opt.value || opt) === active ? 'rgba(200,241,53,0.1)' : 'none',
          border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          color: (opt.value || opt) === active ? 'var(--neon-lime)' : 'var(--text-secondary)',
          fontFamily: 'var(--font-body)', textTransform: 'capitalize',
          borderRight: i < options.length - 1 ? '1px solid var(--border)' : 'none',
          transition: 'all 0.2s'
        }}>
        {opt.label || opt}
      </button>
    ))}
  </div>
);

/* ==================== INR FORMATTER ==================== */
export const formatINR = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount?.toLocaleString('en-IN') || 0}`;
};

/* ==================== PROGRESS BAR ==================== */
export const ProgressBar = ({ value, max = 100, color = 'var(--gradient-neon)', height = 6 }) => (
  <div className="progress-bar" style={{ height }}>
    <div className="progress-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
  </div>
);
