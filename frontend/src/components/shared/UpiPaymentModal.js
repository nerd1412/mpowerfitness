import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

/* ── SVG Brand Logos ─────────────────────────────────────────────── */
const GooglePayLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
    <rect width="40" height="40" rx="8" fill="white"/>
    <path d="M29.6 20.2c0-.6-.1-1.2-.2-1.8H20v3.4h5.4c-.2 1.2-.9 2.2-2 2.8v2.3h3.2c1.9-1.7 3-4.3 3-6.7z" fill="#4285F4"/>
    <path d="M20 30c2.7 0 5-.9 6.6-2.5l-3.2-2.3c-.9.6-2 1-3.3.9-2.6 0-4.8-1.8-5.6-4.1h-3.3v2.4C13.1 27.8 16.3 30 20 30z" fill="#34A853"/>
    <path d="M14.4 22c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2v-2.4H11c-.7 1.5-1.1 3.1-1.1 4.4s.4 2.9 1.1 4.4l3.4-2.4z" fill="#FBBC04"/>
    <path d="M20 14c1.5 0 2.8.5 3.8 1.5l2.8-2.8C24.8 11 22.5 10 20 10c-3.7 0-6.9 2.2-8.5 5.4l3.4 2.4C15.7 15.6 17.7 14 20 14z" fill="#EA4335"/>
  </svg>
);

const PhonePeLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
    <rect width="40" height="40" rx="8" fill="#5F259F"/>
    <path d="M22.5 11h-6.5v18l4.5-3.5V21h2c3.5 0 6.5-2.5 6.5-6 0-2.2-2-4-6.5-4zm0 7H20v-4h2.5c1.1 0 2 .9 2 2s-.9 2-2 2z" fill="white"/>
  </svg>
);

const PaytmLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
    <rect width="40" height="40" rx="8" fill="#00BAF2"/>
    <rect x="8" y="14" width="24" height="3" rx="1.5" fill="white"/>
    <rect x="8" y="19" width="16" height="3" rx="1.5" fill="white"/>
    <rect x="8" y="24" width="20" height="3" rx="1.5" fill="white"/>
  </svg>
);

const BhimLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
    <clipPath id="bhim-clip">
      <rect width="40" height="40" rx="8"/>
    </clipPath>
    <g clipPath="url(#bhim-clip)">
      <rect width="40" height="40" fill="#FF6D00"/>
      <rect y="13" width="40" height="14" fill="white"/>
      <rect y="27" width="40" height="13" fill="#00A650"/>
      <circle cx="20" cy="20" r="4.5" fill="none" stroke="#00008B" strokeWidth="1.5"/>
      <line x1="20" y1="16" x2="20" y2="24" stroke="#00008B" strokeWidth="1.2"/>
    </g>
  </svg>
);

const CredLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
    <rect width="40" height="40" rx="8" fill="#1A1A2E"/>
    <path d="M23 14c-3.9 0-7 3.1-7 7s3.1 7 7 7c1.9 0 3.6-.8 4.9-2l-2.1-2c-.7.7-1.7 1.1-2.8 1.1-2.4 0-4.2-1.9-4.2-4.1s1.8-4.1 4.2-4.1c1 0 2 .4 2.7 1.1l2-2.1C26.4 14.8 24.8 14 23 14z" fill="white"/>
  </svg>
);

const JioPayLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
    <rect width="40" height="40" rx="8" fill="#003087"/>
    <rect x="8" y="16" width="6" height="12" rx="2" fill="white"/>
    <circle cx="11" cy="12" r="3" fill="white"/>
    <rect x="17" y="11" width="6" height="17" rx="2" fill="white"/>
    <path d="M26 16h-2v7c0 1.7 1.3 3 3 3h3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* App metadata */
const UPI_APPS = [
  { key:'gpay',    name:'Google Pay', Logo: GooglePayLogo },
  { key:'phonepe', name:'PhonePe',    Logo: PhonePeLogo },
  { key:'paytm',   name:'Paytm',      Logo: PaytmLogo },
  { key:'bhim',    name:'BHIM',       Logo: BhimLogo },
  { key:'cred',    name:'CRED',       Logo: CredLogo },
  { key:'jio',     name:'JioPay',     Logo: JioPayLogo },
];

const planLabel = { monthly:'1 Month', quarterly:'3 Months', premium:'1 Year' };
const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

const UpiPaymentModal = ({ amount, type, subscriptionPlan, bookingId, programId, description, onClose, onSuccess }) => {
  const [step, setStep]         = useState('initiate');
  const [payment, setPayment]   = useState(null);
  const [utr, setUtr]           = useState('');
  const [senderUpi, setSenderUpi] = useState('');
  const [loading, setLoading]   = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef(null);

  /* Countdown */
  useEffect(() => {
    if (step !== 'pay') return;
    timerRef.current = setInterval(() =>
      setTimeLeft(t => t <= 1 ? (clearInterval(timerRef.current), 0) : t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  /* Auto-poll payment status every 5s when on pay screen */
  const pollRef = useRef(null);
  useEffect(() => {
    if (step !== 'pay' || !payment?.payment?.ref) return;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/payments/upi/status/${payment.payment.ref}`);
        if (data.success && data.status === 'success') {
          clearInterval(pollRef.current);
          setStep('success');
          if (onSuccess) onSuccess(data.payment);
        }
      } catch (_) {}
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [step, payment, onSuccess]);

  const initiate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/upi/initiate', {
        amount, type, subscriptionPlan, bookingId, programId, description,
      });
      if (data.success) { setPayment(data); setStep('pay'); }
      else toast.error(data.message || 'Failed to generate payment');
    } catch (e) { toast.error(e.response?.data?.message || 'Payment initiation failed'); }
    setLoading(false);
  };

  const verify = useCallback(async () => {
    if (!utr.trim()) return toast.error('Enter your UTR number');
    if (!/^\d{12}$/.test(utr.trim())) return toast.error('UTR must be exactly 12 digits');
    setLoading(true);
    try {
      const { data } = await api.post('/payments/upi/verify', {
        paymentId: payment.payment.id, utr: utr.trim(),
        senderUpiId: senderUpi.trim() || undefined,
      });
      if (data.success) { setStep('success'); if (onSuccess) onSuccess(data.payment); }
      else toast.error(data.message || 'Verification failed');
    } catch (e) { toast.error(e.response?.data?.message || 'Verification failed'); }
    setLoading(false);
  }, [utr, senderUpi, payment, onSuccess]);

  /* ── Success screen ─────────────────────────────────────────── */
  if (step === 'success') return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:'center', padding:'44px 32px' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontWeight:800, fontSize:22, color:'var(--success)', marginBottom:8 }}>Payment Verified!</h2>
          <p style={{ color:'var(--t2)', fontSize:14, marginBottom:24 }}>
            ₹{amount?.toLocaleString('en-IN')} received. Your plan is now active!
          </p>
          <button className="btn btn-primary btn-full" onClick={onClose}>Continue →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:460 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>Pay with UPI</div>
            <div style={{ fontSize:12, color:'var(--t2)', marginTop:2 }}>{description || 'Mpower Fitness'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:20, lineHeight:1, display:'flex' }}>✕</button>
        </div>

        <div className="modal-body">
          {/* Amount badge */}
          <div style={{ background:'rgba(200,241,53,.06)', border:'1px solid rgba(200,241,53,.15)',
            borderRadius:'var(--r-md)', padding:'10px 16px', marginBottom:20,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--t2)' }}>
              Amount{subscriptionPlan ? ` · ${planLabel[subscriptionPlan]}` : ''}
            </span>
            <span style={{ fontWeight:800, fontSize:26, color:'var(--lime)' }}>
              ₹{amount?.toLocaleString('en-IN')}
            </span>
          </div>

          {/* ── STEP: initiate ────────────────────────────────────── */}
          {step === 'initiate' && (
            <>
              <p style={{ color:'var(--t2)', fontSize:13, lineHeight:1.6, marginBottom:14 }}>
                Scan the QR or open your UPI app. Once paid, enter the 12-digit UTR to confirm instantly.
              </p>
              {/* App logo pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {UPI_APPS.map(({ key, name, Logo }) => (
                  <div key={key} style={{ display:'inline-flex', alignItems:'center', gap:7,
                    padding:'5px 10px', background:'var(--s2)', border:'1px solid var(--border)',
                    borderRadius:'var(--r-sm)' }}>
                    <div style={{ width:22, height:22, flexShrink:0 }}>
                      <Logo/>
                    </div>
                    <span style={{ fontSize:12, color:'var(--t2)', fontWeight:500 }}>{name}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={initiate} disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width:15, height:15, borderWidth:2 }}/> Generating…</>
                  : 'Generate Payment QR →'}
              </button>
              <button className="btn btn-ghost btn-full" style={{ marginTop:8 }} onClick={onClose}>Cancel</button>
            </>
          )}

          {/* ── STEP: pay ─────────────────────────────────────────── */}
          {step === 'pay' && payment && (
            <>
              {/* Timer + auto-check notice */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontSize:12, color:'var(--t3)' }}>
                  <span className="spinner" style={{ width:10, height:10, borderWidth:1.5, display:'inline-block', marginRight:5 }}/>
                  Checking payment…
                </span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700,
                  color: timeLeft < 60 ? 'var(--error)' : 'var(--warning)' }}>
                  {fmt(timeLeft)}
                </span>
              </div>

              {/* QR code */}
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div style={{ display:'inline-block', padding:12, background:'#fff', borderRadius:'var(--r-md)', lineHeight:0 }}>
                  <img src={payment.qrUrl} alt="UPI QR Code" width={190} height={190} style={{ display:'block' }}/>
                </div>
                <p style={{ fontSize:11, color:'var(--t3)', marginTop:8 }}>Scan with any UPI app</p>
              </div>

              {/* UPI ID row */}
              <div style={{ background:'var(--s2)', borderRadius:'var(--r-md)', padding:'10px 14px',
                marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>Pay to</div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{payment.payment?.upiId}</div>
                  <div style={{ fontSize:12, color:'var(--t2)' }}>{payment.payment?.merchantName}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  navigator.clipboard?.writeText(payment.payment?.upiId);
                  toast.success('UPI ID copied!');
                }}>Copy</button>
              </div>

              {/* App deep links with logos */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
                {UPI_APPS.map(({ key, name, Logo }) => (
                  <a key={key} href={payment.appLinks?.[key] || payment.upiLink}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                      padding:'12px 6px', background:'var(--s2)', border:'1px solid var(--border)',
                      borderRadius:'var(--r-md)', textDecoration:'none', color:'var(--t2)',
                      fontSize:11, transition:'border-color .12s, background .12s', fontWeight:500 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--lime)'; e.currentTarget.style.background='var(--s3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--s2)'; }}>
                    <div style={{ width:32, height:32, borderRadius:8, overflow:'hidden', flexShrink:0 }}>
                      <Logo/>
                    </div>
                    <span style={{ textAlign:'center', lineHeight:1.2 }}>{name}</span>
                  </a>
                ))}
              </div>

              <button className="btn btn-primary btn-full" onClick={() => setStep('verify')}>
                I've Made the Payment →
              </button>
            </>
          )}

          {/* ── STEP: verify ──────────────────────────────────────── */}
          {step === 'verify' && (
            <>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:38, marginBottom:10 }}>🔍</div>
                <h4 style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Confirm Your Payment</h4>
                <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6 }}>
                  Enter the 12-digit UTR / Reference number from your UPI app to activate instantly.
                </p>
              </div>

              <div style={{ background:'rgba(78,159,255,.06)', border:'1px solid rgba(78,159,255,.15)',
                borderRadius:'var(--r-md)', padding:'10px 14px', marginBottom:16, fontSize:12, color:'var(--info)', lineHeight:1.6 }}>
                💡 <strong>Where to find UTR:</strong> UPI App → Transactions / History → This payment → UTR / Reference No.
              </div>

              <div className="form-group" style={{ marginBottom:14 }}>
                <label className="form-label">UTR / Reference Number *</label>
                <input className="form-input"
                  placeholder="Enter 12-digit UTR"
                  value={utr}
                  onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                  style={{ letterSpacing:2, fontFamily:'var(--font-mono)', fontSize:16 }}/>
                <div style={{ fontSize:11, marginTop:4,
                  color: utr.length === 12 ? 'var(--success)' : 'var(--t3)' }}>
                  {utr.length}/12 digits {utr.length === 12 && '✓ Ready'}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom:20 }}>
                <label className="form-label">Your UPI ID <span style={{ color:'var(--t3)' }}>(optional)</span></label>
                <input className="form-input" placeholder="yourname@upi or phone@upi"
                  value={senderUpi} onChange={e => setSenderUpi(e.target.value)}/>
              </div>

              <button className="btn btn-primary btn-full"
                onClick={verify}
                disabled={loading || utr.length !== 12}
                style={{ marginBottom:8 }}>
                {loading
                  ? <><span className="spinner" style={{ width:15, height:15, borderWidth:2 }}/> Verifying…</>
                  : 'Verify & Activate →'}
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setStep('pay')}>← Back</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentModal;
