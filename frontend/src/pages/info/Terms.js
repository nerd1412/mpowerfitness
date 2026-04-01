import React from 'react';
import { InfoLayout } from './About';

const Section = ({ title, children }) => (
  <div style={{ marginBottom:32 }}>
    <h2 style={{ fontSize:19, fontWeight:700, marginBottom:10, color:'var(--t1)' }}>{title}</h2>
    <div style={{ fontSize:14, color:'var(--t2)', lineHeight:1.8 }}>{children}</div>
  </div>
);

const TermsPage = () => (
  <InfoLayout>
    <div style={{ marginBottom:40 }}>
      <div style={{ display:'inline-block', background:'rgba(78,159,255,.1)', border:'1px solid rgba(78,159,255,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--info)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Legal</div>
      <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, marginBottom:12 }}>Terms of <span style={{ color:'var(--lime)' }}>Use</span></h1>
      <p style={{ fontSize:13, color:'var(--t3)' }}>Last updated: January 2025 · Effective: January 1, 2025</p>
    </div>

    <div className="card" style={{ marginBottom:32, background:'rgba(255,176,32,.06)', borderColor:'rgba(255,176,32,.2)' }}>
      <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.7 }}>
        Please read these Terms of Use carefully before using the Mpower Fitness platform. By creating an account or using our services, you agree to be bound by these terms. If you do not agree, please do not use our platform.
      </p>
    </div>

    <Section title="1. Eligibility">
      <p>You must be at least 16 years old to use Mpower Fitness. Users between 16–18 require parental or guardian consent. By using the platform, you represent that you meet these requirements and are legally capable of entering into a binding agreement.</p>
    </Section>

    <Section title="2. Account Responsibilities">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You must provide accurate and truthful information during registration.</li>
        <li>You agree to notify us immediately of any unauthorised use of your account.</li>
        <li>One person may not maintain multiple accounts. Duplicate accounts will be terminated.</li>
      </ul>
    </Section>

    <Section title="3. Fitness & Health Disclaimer">
      <p style={{ marginBottom:10 }}>
        <strong style={{ color:'var(--warning)' }}>Important:</strong> The fitness content, workouts, and nutrition information on Mpower Fitness are for informational purposes only and do not constitute medical advice.
      </p>
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        <li>Consult a qualified medical professional before starting any new exercise or diet programme.</li>
        <li>Mpower Fitness and its trainers are not liable for any injury arising from improper exercise execution.</li>
        <li>Trainers on the platform provide fitness coaching, not medical diagnosis or treatment.</li>
      </ul>
    </Section>

    <Section title="4. Payments & Refunds">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes.</li>
        <li>Subscription fees are charged in advance and are non-refundable once a billing period has begun.</li>
        <li>Session bookings cancelled at least 24 hours in advance are eligible for a full credit refund.</li>
        <li>No-shows or cancellations within 24 hours of a session are non-refundable.</li>
        <li>Refund requests must be raised within 7 days of the disputed transaction.</li>
      </ul>
    </Section>

    <Section title="5. Trainer Code of Conduct">
      <p style={{ marginBottom:10 }}>All trainers on the platform agree to:</p>
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        <li>Maintain valid certifications and update credentials annually.</li>
        <li>Conduct sessions professionally and punctually.</li>
        <li>Not solicit clients for services outside the platform during active subscriptions.</li>
        <li>Maintain client confidentiality and professional boundaries at all times.</li>
      </ul>
    </Section>

    <Section title="6. Prohibited Uses">
      <p style={{ marginBottom:10 }}>You may not use Mpower Fitness to:</p>
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        <li>Upload false, misleading, or fraudulent information.</li>
        <li>Harass, abuse, or threaten other users or trainers.</li>
        <li>Attempt to circumvent payments or engage in chargebacks fraudulently.</li>
        <li>Reverse-engineer, scrape, or copy platform content without permission.</li>
        <li>Promote or sell competing fitness services to users contacted through our platform.</li>
      </ul>
    </Section>

    <Section title="7. Intellectual Property">
      <p>All content on Mpower Fitness — including workout programmes, nutrition plans, videos, and software — is owned by Mpower Fitness Pvt. Ltd. or its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.</p>
    </Section>

    <Section title="8. Limitation of Liability">
      <p>To the maximum extent permitted by law, Mpower Fitness's total liability for any claim arising out of these terms or use of the platform shall not exceed the amount paid by you in the three months preceding the claim.</p>
    </Section>

    <Section title="9. Governing Law">
      <p>These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra. We encourage resolution through our support team before initiating legal proceedings.</p>
    </Section>

    <Section title="10. Contact">
      <p>For questions about these terms: <a href="mailto:legal@mpowerfitness.in" style={{ color:'var(--lime)' }}>legal@mpowerfitness.in</a><br/>
      Mpower Fitness Pvt. Ltd., Mumbai, Maharashtra 400001, India.</p>
    </Section>
  </InfoLayout>
);

export default TermsPage;
