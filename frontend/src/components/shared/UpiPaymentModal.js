import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const UpiPaymentModal = ({ amount, type, subscriptionPlan, bookingId, programId, description, onClose, onSuccess }) => {
  const [step, setStep] = useState('initiate');
  const [payment, setPayment] = useState(null);
  const [utr, setUtr] = useState('');
  const [senderUpi, setSenderUpi] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step!=='pay') return;
    timerRef.current = setInterval(() => setTimeLeft(t => t<=1 ? (clearInterval(timerRef.current), 0) : t-1), 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const planLabel = { monthly:'1 Month', quarterly:'3 Months', premium:'1 Year' };

  const initiate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/upi/initiate', { amount, type, subscriptionPlan, bookingId, programId, description });
      if (data.success) { setPayment(data); setStep('pay'); }
      else toast.error(data.message||'Failed to initiate payment');
    } catch (e) { toast.error(e.response?.data?.message||'Failed to initiate payment'); }
    setLoading(false);
  };

  const verify = async () => {
    if (!utr.trim()) return toast.error('Enter your UTR number');
    if (!/^\d{12}$/.test(utr.trim())) return toast.error('UTR must be exactly 12 digits');
    setLoading(true);
    try {
      const { data } = await api.post('/payments/upi/verify', { paymentId: payment.payment.id, utr: utr.trim(), senderUpiId: senderUpi.trim()||undefined });
      if (data.success) { setStep('success'); if (onSuccess) onSuccess(data.payment); }
      else toast.error(data.message||'Verification failed');
    } catch (e) { toast.error(e.response?.data?.message||'Verification failed'); }
    setLoading(false);
  };

  if (step==='success') return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign:'center', padding:'40px 32px' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontWeight:800, fontSize:22, marginBottom:8, color:'var(--success)' }}>Payment Verified!</h2>
          <p style={{ color:'var(--t2)', marginBottom:24, fontSize:14 }}>₹{amount?.toLocaleString()} received. Your plan is now active!</p>
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
            <div style={{ fontWeight:700, fontSize:16 }}>UPI Payment</div>
            <div style={{ fontSize:12, color:'var(--t2)', marginTop:2 }}>{description||'Mpower Fitness'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:20, lineHeight:1, display:'flex' }}>✕</button>
        </div>

        <div className="modal-body">
          {/* Amount */}
          <div style={{ background:'rgba(200,241,53,.06)', border:'1px solid rgba(200,241,53,.15)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--t2)' }}>Amount{subscriptionPlan?` (${planLabel[subscriptionPlan]})`:''}</span>
            <span style={{ fontWeight:800, fontSize:24, color:'var(--lime)' }}>₹{amount?.toLocaleString()}</span>
          </div>

          {/* Step: Initiate */}
          {step==='initiate' && (
            <>
              <p style={{ color:'var(--t2)', fontSize:14, marginBottom:18, lineHeight:1.6 }}>
                Complete payment via UPI. After paying, enter your 12-digit UTR to activate instantly.
              </p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                {['GPay','PhonePe','Paytm','BHIM','Any UPI'].map(app => (
                  <span key={app} style={{ padding:'5px 11px', background:'var(--s2)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:12, color:'var(--t2)' }}>{app}</span>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={initiate} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }}/> Generating…</> : 'Generate Payment QR →'}
              </button>
              <button className="btn btn-ghost btn-full" style={{ marginTop:8 }} onClick={onClose}>Cancel</button>
            </>
          )}

          {/* Step: Pay */}
          {step==='pay' && payment && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <span style={{ fontSize:13, color:'var(--t2)' }}>Expires in</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:15, fontWeight:700, color:timeLeft<60?'var(--error)':'var(--warning)' }}>{fmt(timeLeft)}</span>
              </div>

              {/* QR */}
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div style={{ display:'inline-block', padding:12, background:'#fff', borderRadius:'var(--r-md)' }}>
                  <img src={payment.qrUrl} alt="UPI QR" width={200} height={200} style={{ display:'block' }}/>
                </div>
                <p style={{ fontSize:12, color:'var(--t3)', marginTop:8 }}>Scan with any UPI app</p>
              </div>

              {/* UPI ID */}
              <div style={{ background:'var(--s2)', borderRadius:'var(--r-md)', padding:'12px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:11, color:'var(--t3)', marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>Pay to</div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{payment.payment?.upiId}</div>
                  <div style={{ fontSize:12, color:'var(--t2)' }}>{payment.payment?.merchantName}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard?.writeText(payment.payment?.upiId); toast.success('Copied!'); }}>Copy</button>
              </div>

              {/* App links */}
              <div style={{ display:'flex', gap:8, marginBottom:18 }}>
                {[['GPay','💳',payment.appLinks?.gpay],['PhonePe','📱',payment.appLinks?.phonepe],['Paytm','💰',payment.appLinks?.paytm]].map(([n,e,u]) => (
                  <a key={n} href={u} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 6px', background:'var(--s2)', borderRadius:'var(--r-md)', border:'1px solid var(--border)', textDecoration:'none', fontSize:12, color:'var(--t2)', transition:'border-color .12s' }}
                    onMouseEnter={e2 => e2.currentTarget.style.borderColor='var(--lime)'}
                    onMouseLeave={e2 => e2.currentTarget.style.borderColor='var(--border)'}>
                    <span style={{ fontSize:20 }}>{e}</span>{n}
                  </a>
                ))}
              </div>

              <button className="btn btn-primary btn-full" onClick={() => setStep('verify')}>I've Made the Payment →</button>
            </>
          )}

          {/* Step: Verify */}
          {step==='verify' && (
            <>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
                <h4 style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Confirm Your Payment</h4>
                <p style={{ fontSize:13, color:'var(--t2)', lineHeight:1.6 }}>Enter the 12-digit UTR from your UPI app to verify instantly.</p>
              </div>

              <div style={{ background:'rgba(78,159,255,.06)', border:'1px solid rgba(78,159,255,.15)', borderRadius:'var(--r-md)', padding:'10px 14px', marginBottom:16, fontSize:12, color:'var(--info)' }}>
                💡 Find UTR: UPI app → Payment History → this transaction → UTR / Reference No.
              </div>

              <div className="form-group" style={{ marginBottom:14 }}>
                <label className="form-label">UTR / Reference Number *</label>
                <input className="form-input" placeholder="12-digit UTR (e.g. 123456789012)" value={utr}
                  onChange={e => setUtr(e.target.value.replace(/\D/g,'').slice(0,12))} maxLength={12}
                  style={{ letterSpacing:2, fontFamily:'var(--font-mono)', fontSize:15 }}/>
                <div style={{ fontSize:11, color:utr.length===12?'var(--success)':'var(--t3)', marginTop:4 }}>
                  {utr.length}/12 digits {utr.length===12 && '✓'}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom:20 }}>
                <label className="form-label">Your UPI ID (optional)</label>
                <input className="form-input" placeholder="yourname@upi" value={senderUpi} onChange={e => setSenderUpi(e.target.value)}/>
              </div>

              <button className="btn btn-primary btn-full" onClick={verify} disabled={loading||utr.length!==12} style={{ marginBottom:8 }}>
                {loading ? <><span className="spinner" style={{ width:16,height:16,borderWidth:2 }}/> Verifying…</> : 'Verify & Activate Plan'}
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
