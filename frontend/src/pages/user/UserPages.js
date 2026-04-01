import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import UpiPaymentModal from '../../components/shared/UpiPaymentModal';
import useAuthStore from '../../store/authStore';

const statusColors = { pending: 'badge-warning', confirmed: 'badge-success', cancelled: 'badge-error', completed: 'badge-info', no_show: 'badge-neutral' };

// ════════════════════════════════════════════
// BOOKINGS
// ════════════════════════════════════════════
export const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingReview, setRatingReview] = useState('');

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => { if (data.success) setBookings(data.bookings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: 'Cancelled by user' });
      toast.success('Booking cancelled');
      setBookings(b => b.map(x => (x.id || x._id) === id ? { ...x, status: 'cancelled' } : x));
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to cancel'); }
  };

  const handleRate = async () => {
    try {
      await api.post(`/bookings/${ratingBooking}/rate`, { rating: ratingVal, review: ratingReview });
      toast.success('Rating submitted!');
      setBookings(b => b.map(x => (x.id || x._id) === ratingBooking ? { ...x, rating: ratingVal } : x));
      setRatingBooking(null);
    } catch { toast.error('Failed to submit rating'); }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My <span style={{ color: 'var(--lime)' }}>Bookings</span></h1>
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>Manage your trainer sessions</p>
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookings.map((b, i) => (
            <div key={b.id || b._id} className="card" style={{ animation: `fadeIn 0.4s ease ${i * 0.06}s forwards`, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,95,31,0.15)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{b.trainer?.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Session with {b.trainer?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)' }}>
                      📅 {new Date(b.sessionDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} &nbsp;
                      ⏰ {b.startTime} – {b.endTime} &nbsp;
                      {b.sessionType === 'online' ? '🖥 Online' : '📍 In Person'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${statusColors[b.status] || 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>{b.status}</span>
                  <strong style={{ color: 'var(--lime)' }}>₹{b.amount}</strong>
                </div>
              </div>
              {b.trainerNotes && <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--s2)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--t2)' }}>📝 {b.trainerNotes}</div>}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {b.status === 'pending' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id || b._id)}>Cancel</button>
                )}
                {b.status === 'completed' && !b.rating && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setRatingBooking(b.id || b._id)}>⭐ Rate Session</button>
                )}
                {b.rating && (
                  <span style={{ fontSize: 13, color: 'var(--warning)' }}>{'⭐'.repeat(b.rating)} Rated {b.rating}/5</span>
                )}
                <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 11 }}>
                  {b.paymentStatus === 'paid' ? '✓ Paid' : 'Payment pending'}
                </span>
              </div>
            </div>
          ))}
          {!loading && bookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--t3)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
              <p>No bookings yet. <a href="/user/trainers" style={{ color: 'var(--lime)' }}>Find a trainer</a> to book your first session!</p>
            </div>
          )}
        </div>
      )}

      {/* Rating modal */}
      {ratingBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <h3 style={{ marginBottom: 16 }}>Rate Your Session</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRatingVal(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, opacity: s <= ratingVal ? 1 : 0.3 }}>⭐</button>
              ))}
            </div>
            <textarea className="form-input" rows={3} placeholder="Leave a review (optional)..." value={ratingReview} onChange={e => setRatingReview(e.target.value)} style={{ marginBottom: 14, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary flex-1" onClick={handleRate}>Submit Rating</button>
              <button className="btn btn-ghost" onClick={() => setRatingBooking(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// NUTRITION
// ════════════════════════════════════════════
export const UserNutrition = () => {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/nutrition')
      .then(({ data }) => { if (data.success) setPlans(data.plans); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goalColors = { weight_loss: 'var(--orange)', muscle_gain: 'var(--lime)', maintenance: 'var(--info)', endurance: 'var(--warning)' };
  const plan = selected || plans[0];

  const MacroPill = ({ label, value, unit, color }) => (
    <div style={{ textAlign: 'center', background: 'var(--s2)', borderRadius: 'var(--r-sm)', padding: '10px 14px' }}>
      <div style={{ fontWeight: 800, fontSize: 22, color }}>{value}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t3)' }}>{unit}</span></div>
      <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Nutrition <span style={{ color: 'var(--lime)' }}>Plans</span></h1>
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>Your personalised meal guidance</p>
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div> : (
        <div className="nutrition-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 20 }}>
          {/* Plan list */}
          <div className="nutrition-plan-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plans.map(p => (
              <div key={p.id || p._id} onClick={() => setSelected(p)}
                className="card card-hover nutrition-plan-item"
                style={{ cursor: 'pointer', borderColor: (selected?.id || selected?._id || plans[0]?.id) === (p.id || p._id) ? 'var(--lime)' : 'transparent' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: goalColors[p.goal] || 'var(--t3)', textTransform: 'capitalize', marginBottom: 6 }}>{p.goal?.replace(/_/g,' ')}</div>
                <div style={{ fontSize: 13, color: 'var(--t2)' }}>{p.caloriesPerDay} kcal/day</div>
              </div>
            ))}
            {plans.length === 0 && <div style={{ color: 'var(--t3)', padding: 20, textAlign: 'center' }}>No nutrition plans available</div>}
          </div>

          {/* Plan detail */}
          {plan && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 16 }}>{plan.description}</p>
                <div className="macro-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 0 }}>
                  <MacroPill label="Calories" value={plan.caloriesPerDay} unit="kcal" color="var(--orange)" />
                  <MacroPill label="Protein" value={plan.proteinGrams} unit="g" color="var(--lime)" />
                  <MacroPill label="Carbs" value={plan.carbsGrams} unit="g" color="var(--info)" />
                  <MacroPill label="Fat" value={plan.fatGrams} unit="g" color="var(--warning)" />
                </div>
              </div>
              {(plan.meals || []).map((meal, mi) => (
                <div key={mi} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{meal.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>⏰ {meal.time}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(meal.items || []).map((item, ii) => (
                      <div key={ii} className="meal-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '8px 0', borderBottom: ii < meal.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--t3)' }}>{item.quantity}</div>
                        </div>
                        <div className="meal-macros" style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                          <span style={{ color: 'var(--orange)' }}>{item.calories} kcal</span>
                          <span style={{ color: 'var(--lime)' }}>P:{item.protein}g</span>
                          <span style={{ color: 'var(--info)' }}>C:{item.carbs}g</span>
                          <span style={{ color: 'var(--warning)' }}>F:{item.fat}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 13 }}>
                    <span style={{ color: 'var(--t3)' }}>Total: <strong style={{ color: 'var(--orange)' }}>{(meal.items || []).reduce((s, i) => s + (i.calories || 0), 0)} kcal</strong></span>
                    <span style={{ color: 'var(--t3)' }}>Protein: <strong style={{ color: 'var(--lime)' }}>{(meal.items || []).reduce((s, i) => s + (i.protein || 0), 0)}g</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// PROGRAMS
// ════════════════════════════════════════════
export const UserPrograms = () => {
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState({});

  useEffect(() => {
    api.get('/programs')
      .then(({ data }) => { if (data.success) setPrograms(data.programs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const planLabels = { monthly: '1 Month', quarterly: '3 Months (Save ~20%)', premium: '12 Months (Best Value)' };
  const planKeys = ['monthly', 'quarterly', 'premium'];

  const handleSubscribe = (prog, planKey) => {
    const amount = planKey === 'monthly' ? prog.pricingMonthly : planKey === 'quarterly' ? prog.pricingQuarterly : prog.pricingPremium;
    setPaymentModal({ amount, type: 'subscription', subscriptionPlan: planKey, description: `${prog.title} - ${planLabels[planKey]}` });
  };

  const levelColor = { beginner: 'var(--success)', intermediate: 'var(--warning)', advanced: 'var(--error)' };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Fitness <span style={{ color: 'var(--lime)' }}>Programs</span></h1>
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>Choose a program tailored to your goals</p>
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {programs.map((prog, i) => {
            const myPlan = selectedPlan[prog.id || prog._id] || 'monthly';
            const price = myPlan === 'monthly' ? prog.pricingMonthly : myPlan === 'quarterly' ? prog.pricingQuarterly : prog.pricingPremium;
            const isSubscribed = user?.subscription?.plan !== 'free' && user?.subscription?.isActive;
            return (
              <div key={prog.id || prog._id} className="card" style={{ animation: `fadeIn 0.4s ease ${i * 0.07}s both`, display: 'flex', flexDirection: 'column' }}>
                {prog.isFeatured && <div style={{ background: 'var(--lime)', color: '#000', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--r-full)', display: 'inline-block', marginBottom: 12, width: 'fit-content', letterSpacing: 1 }}>⭐ FEATURED</div>}
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{prog.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 12, flexGrow: 1 }}>{prog.description}</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{prog.level}</span>
                  <span className="badge" style={{ background: 'rgba(78,159,255,0.12)', color: 'var(--info)' }}>{prog.duration}w program</span>
                  <span className="badge badge-neutral">{prog.enrolledCount || 0} enrolled</span>
                </div>
                {/* Plan selector */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {planKeys.map(k => {
                    const amt = k === 'monthly' ? prog.pricingMonthly : k === 'quarterly' ? prog.pricingQuarterly : prog.pricingPremium;
                    const active = myPlan === k;
                    return (
                      <button key={k} onClick={() => setSelectedPlan(sp => ({ ...sp, [prog.id || prog._id]: k }))}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: 'var(--r-sm)', border: `2px solid ${active ? 'var(--lime)' : 'var(--border)'}`, background: active ? 'rgba(200,241,53,0.1)' : 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--lime)' : 'var(--t2)', transition: 'all 0.15s' }}>
                        <div>₹{amt?.toLocaleString()}</div>
                        <div style={{ fontSize: 10, opacity: 0.8 }}>{k === 'monthly' ? '/ month' : k === 'quarterly' ? '/ 3 months' : '/ year'}</div>
                      </button>
                    );
                  })}
                </div>
                {/* Features */}
                <div style={{ marginBottom: 16 }}>
                  {(prog.features || []).slice(0, 4).map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--t2)' }}>
                      <span style={{ color: 'var(--lime)', marginTop: 1, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleSubscribe(prog, myPlan)}>
                  Get Started — ₹{price?.toLocaleString()}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {paymentModal && (
        <UpiPaymentModal {...paymentModal} onClose={() => setPaymentModal(null)} onSuccess={() => { toast.success('Subscription activated! 🎉'); setPaymentModal(null); }} />
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════
export const UserProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', phone: '', age: '', height: '', weight: '', targetWeight: '', fitnessGoal: '', fitnessLevel: '', lifestyle: '', workoutDaysPerWeek: 3 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', age: user.age || '', height: user.height || '', weight: user.weight || '', targetWeight: user.targetWeight || '', fitnessGoal: user.fitnessGoal || 'general_fitness', fitnessLevel: user.fitnessLevel || 'beginner', lifestyle: user.lifestyle || 'sedentary', workoutDaysPerWeek: user.workoutDaysPerWeek || 3 });
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      if (data.success) { updateUser(form); toast.success('Profile updated!'); }
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  const bmi = form.height && form.weight ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : null;
  const bmiColor = bmi ? (bmi < 18.5 ? 'var(--info)' : bmi < 25 ? 'var(--success)' : bmi < 30 ? 'var(--warning)' : 'var(--error)') : null;

  const F = ({ label, field, type = 'text', options }) => (
    <div>
      <label style={{ fontSize: 12, color: 'var(--t3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      {options ? (
        <select className="form-input" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input className="form-input" type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My <span style={{ color: 'var(--lime)' }}>Profile</span></h1>
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>Manage your personal information and fitness settings</p>
      </div>

      {/* Avatar & subscription */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(200,241,53,0.12)', border: '3px solid var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'var(--lime)', flexShrink: 0 }}>
          {user?.name?.[0]}
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${user?.subscription?.isActive || user?.subscriptionActive ? 'badge-success' : 'badge-neutral'}`}>
              {(user?.subscription?.plan || user?.subscriptionPlan || 'free').charAt(0).toUpperCase() + (user?.subscription?.plan || user?.subscriptionPlan || 'free').slice(1)} Plan
            </span>
            {bmi && <span className="badge" style={{ background: `${bmiColor}18`, color: bmiColor }}>BMI: {bmi} ({bmiLabel})</span>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <F label="Full Name" field="name" />
          <F label="Phone" field="phone" />
          <F label="Age" field="age" type="number" />
          <F label="Gender" field="gender" options={[{value:'',label:'Select'},{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} />
          <F label="Height (cm)" field="height" type="number" />
          <F label="Weight (kg)" field="weight" type="number" />
          <F label="Target Weight (kg)" field="targetWeight" type="number" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Fitness Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <F label="Fitness Goal" field="fitnessGoal" options={[{value:'weight_loss',label:'Weight Loss'},{value:'muscle_gain',label:'Muscle Gain'},{value:'endurance',label:'Endurance'},{value:'flexibility',label:'Flexibility'},{value:'general_fitness',label:'General Fitness'},{value:'sports_performance',label:'Sports Performance'}]} />
          <F label="Fitness Level" field="fitnessLevel" options={[{value:'beginner',label:'Beginner'},{value:'intermediate',label:'Intermediate'},{value:'advanced',label:'Advanced'}]} />
          <F label="Lifestyle" field="lifestyle" options={[{value:'sedentary',label:'Sedentary'},{value:'lightly_active',label:'Lightly Active'},{value:'moderately_active',label:'Moderately Active'},{value:'very_active',label:'Very Active'}]} />
          <F label="Workout Days/Week" field="workoutDaysPerWeek" type="number" />
        </div>
      </div>

      <button className="btn btn-primary" onClick={save} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>

      {/* Assigned Trainer Card */}
      {(user?.assignedTrainerId) && (
        <AssignedTrainerCard trainerId={user.assignedTrainerId}/>
      )}
    </div>
  );
};

const AssignedTrainerCard = ({ trainerId }) => {
  const [trainer, setTrainer] = useState(null);
  useEffect(() => {
    if (!trainerId) return;
    api.get(`/trainers/${trainerId}`)
      .then(({ data }) => { if (data.success) setTrainer(data.trainer); })
      .catch(() => {});
  }, [trainerId]);

  if (!trainer) return null;
  return (
    <div className="card" style={{ marginTop: 16, borderColor: 'rgba(255,95,31,.2)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--orange)' }}>🏋️ Your Assigned Trainer</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="avatar-placeholder" style={{ width: 52, height: 52, fontSize: 20, background: 'rgba(255,95,31,.12)', color: 'var(--orange)', flexShrink: 0 }}>{trainer.name?.[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{trainer.name}</div>
          <div style={{ fontSize: 12, color: 'var(--warning)', marginBottom: 4 }}>⭐ {(trainer.rating || 0).toFixed(1)} · {trainer.experience}yr exp</div>
          {trainer.city && <div style={{ fontSize: 12, color: 'var(--t3)' }}>📍 {[trainer.city, trainer.state].filter(Boolean).join(', ')}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {(trainer.specializations || []).slice(0, 3).map(s => (
              <span key={s} className="badge badge-neutral" style={{ fontSize: 10, textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--lime)', fontSize: 16 }}>₹{(trainer.sessionRate || 0).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>/session</div>
        </div>
      </div>
      {trainer.bio && <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 10, lineHeight: 1.5 }}>{trainer.bio}</p>}
    </div>
  );
};

// ════════════════════════════════════════════
// CHAT
// ════════════════════════════════════════════
export const UserChat = () => {
  const { user } = useAuthStore();
  const [convos, setConvos] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/chat/conversations')
      .then(({ data }) => { if (data.success) { setConvos(data.conversations); if (data.conversations.length > 0) setActiveConvo(data.conversations[0]); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConvo) return;
    api.get(`/chat/${activeConvo.id || activeConvo._id}/messages`)
      .then(({ data }) => { if (data.success) setMessages(data.messages); })
      .catch(() => {});
  }, [activeConvo]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      // Get recipientId from active conversation's other participant, fallback to assignedTrainerId
      const getRecipientId = () => {
        if (activeConvo) {
          const other = (activeConvo.participants || []).find(p => p.participantId !== user?.id);
          if (other?.participantId) return { recipientId: other.participantId, recipientModel: other.participantModel || 'Trainer' };
        }
        const trainer = user?.assignedTrainer || user?.assignedTrainerId;
        return {
          recipientId: typeof trainer === 'object' ? (trainer?._id || trainer?.id) : trainer,
          recipientModel: 'Trainer'
        };
      };
      const { recipientId, recipientModel } = getRecipientId();
      const { data } = await api.post('/chat/send', {
        conversationId: activeConvo?.id || activeConvo?._id,
        recipientId,
        recipientModel,
        content: newMsg.trim()
      });
      if (data.success) {
        setMessages(m => [...m, data.message]);
        setNewMsg('');
        if (!activeConvo) {
          // New conversation created - reload convos and set active
          const r = await api.get('/chat/conversations');
          if (r.data.success) {
            setConvos(r.data.conversations);
            const nc = r.data.conversations.find(x => (x.id||x._id) === data.conversationId);
            if (nc) setActiveConvo(nc);
          }
        }
      }
    } catch { toast.error('Failed to send message'); }
  };

  const getOtherParticipant = (convo) => {
    const parts = convo.participants || [];
    return parts.find(p => p.participantId !== user?.id) || parts[0];
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Messages</h1>
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>Chat with your trainer</p>
      </div>
      <div className="chat-layout" style={{ display: 'flex', gap: 14, minHeight: 520, height: 'calc(100vh - 220px)' }}>
        {/* Conversations list */}
        <div className="chat-sidebar" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          {loading ? <div className="spinner" style={{ margin: 'auto' }} /> :
            convos.length > 0 ? convos.map(c => {
              const other = getOtherParticipant(c);
              const isActive = (activeConvo?.id || activeConvo?._id) === (c.id || c._id);
              return (
                <div key={c.id || c._id} onClick={() => setActiveConvo(c)}
                  className="chat-conv-item"
                  style={{ padding: '12px', borderRadius: 'var(--r-md)', background: isActive ? 'rgba(200,241,53,0.1)' : 'var(--s1)', border: `1px solid ${isActive ? 'var(--lime)' : 'var(--border)'}`, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{other?.name || 'Trainer'}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.lastMessage?.content || 'No messages yet'}
                  </div>
                </div>
              );
            }) : (
              <div style={{ fontSize: 13, padding: '10px 0' }}>
                {(user?.assignedTrainerId) ? (
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                    onClick={async () => {
                      try {
                        const { data } = await api.post('/chat/send', {
                          recipientId: user.assignedTrainerId,
                          recipientModel: 'Trainer',
                          content: 'Hi! Just checking in about my training plan. Looking forward to working together! 💪'
                        });
                        if (data.success) {
                          const r = await api.get('/chat/conversations');
                          if (r.data.success) {
                            setConvos(r.data.conversations);
                            const nc = r.data.conversations.find(x => (x.id||x._id) === data.conversationId);
                            if (nc) setActiveConvo(nc);
                          }
                          toast.success('Conversation started!');
                        }
                      } catch { toast.error('Failed to start conversation'); }
                    }}>
                    💬 Message My Trainer
                  </button>
                ) : (
                  <div style={{ color: 'var(--t3)', textAlign: 'center' }}>
                    No trainer assigned yet.<br/>
                    <a href="/user/trainers" style={{ color: 'var(--lime)', fontSize: 12 }}>Find a trainer →</a>
                  </div>
                )}
              </div>
            )
          }
        </div>

        {/* Chat window */}
        <div className="card chat-window" style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, padding:0, overflow:'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
            {activeConvo ? getOtherParticipant(activeConvo)?.name || 'Trainer' : 'Select a conversation'}
          </div>
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(m => {
              const isMine = m.senderId === user?.id;
              return (
                <div key={m.id || m._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMine ? 'var(--lime)' : 'var(--s2)', color: isMine ? '#000' : 'var(--t1)', fontSize: 14 }}>
                    <div>{m.content}</div>
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                      {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && activeConvo && (
              <div style={{ textAlign: 'center', color: 'var(--t3)', padding: 40 }}>No messages yet. Say hello! 👋</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input className="form-input" placeholder="Type a message…" value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              style={{ flexGrow: 1 }} />
            <button className="btn btn-primary" onClick={sendMessage} disabled={!newMsg.trim()}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};
