import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

/* App metadata: icon emoji + display name */
const UPI_APPS = [
  { key:'gpay',    name:'Google Pay', icon:'G',  color:'#4285F4' },
  { key:'phonepe', name:'PhonePe',    icon:'P',  color:'#5F259F' },
  { key:'paytm',   name:'Paytm',      icon:'₹',  color:'#00BAF2' },
  { key:'bhim',    name:'BHIM',       icon:'B',  color:'#FF6D00' },
  { key:'cred',    name:'CRED',       icon:'C',  color:'#1A1A2E' },
  { key:'jio',     name:'JioPay',     icon:'J',  color:'#0F4C81' },
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
              <p style={{ color:'var(--t2)', fontSize:13, lineHeight:1.6, marginBottom:18 }}>
                Scan the QR or open your UPI app. Once paid, enter the 12-digit UTR to confirm instantly.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
                {UPI_APPS.map(a => (
                  <span key={a.key} style={{ display:'inline-flex', alignItems:'center', gap:5,
                    padding:'4px 10px', background:'var(--s2)', border:'1px solid var(--border)',
                    borderRadius:'var(--r-sm)', fontSize:12, color:'var(--t2)' }}>
                    <span style={{ width:16, height:16, borderRadius:4, background:a.color,
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      fontSize:9, fontWeight:700, color:'#fff', flexShrink:0 }}>{a.icon}</span>
                    {a.name}
                  </span>
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

              {/* App deep links */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:16 }}>
                {UPI_APPS.map(a => (
                  <a key={a.key} href={payment.appLinks?.[a.key] || payment.upiLink}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                      padding:'10px 4px', background:'var(--s2)', border:'1px solid var(--border)',
                      borderRadius:'var(--r-md)', textDecoration:'none', color:'var(--t2)',
                      fontSize:11, transition:'border-color .12s, background .12s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--lime)'; e.currentTarget.style.background='var(--s3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--s2)'; }}>
                    <span style={{ width:24, height:24, borderRadius:6, background:a.color,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:800, color:'#fff' }}>{a.icon}</span>
                    {a.name}
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
