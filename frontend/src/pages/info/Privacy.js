import React from 'react';
import { InfoLayout } from './About';

const Section = ({ title, children }) => (
  <div style={{ marginBottom:36 }}>
    <h2 style={{ fontSize:20, fontWeight:700, marginBottom:12, color:'var(--t1)' }}>{title}</h2>
    <div style={{ fontSize:14, color:'var(--t2)', lineHeight:1.8 }}>{children}</div>
  </div>
);

const PrivacyPage = () => (
  <InfoLayout>
    <div style={{ marginBottom:40 }}>
      <div style={{ display:'inline-block', background:'rgba(78,159,255,.1)', border:'1px solid rgba(78,159,255,.2)', borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:12, color:'var(--info)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>Legal</div>
      <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, marginBottom:12 }}>Privacy <span style={{ color:'var(--lime)' }}>Policy</span></h1>
      <p style={{ fontSize:13, color:'var(--t3)' }}>Last updated: January 2025 · Effective: January 1, 2025</p>
    </div>

    <div className="card" style={{ marginBottom:32, background:'rgba(78,159,255,.06)', borderColor:'rgba(78,159,255,.2)' }}>
      <p style={{ fontSize:14, color:'var(--t2)', lineHeight:1.7 }}>
        At Mpower Fitness Pvt. Ltd. ("Mpower", "we", "us"), we are committed to protecting your privacy. This policy explains what personal data we collect, how we use it, and your rights. By using our platform, you agree to these practices.
      </p>
    </div>

    <Section title="1. Information We Collect">
      <p style={{ marginBottom:10 }}><strong style={{ color:'var(--t1)' }}>Account Information:</strong> Name, email address, phone number, and password when you register.</p>
      <p style={{ marginBottom:10 }}><strong style={{ color:'var(--t1)' }}>Health & Fitness Data:</strong> Age, gender, height, weight, fitness goals, workout history, progress measurements, and nutrition logs that you voluntarily enter.</p>
      <p style={{ marginBottom:10 }}><strong style={{ color:'var(--t1)' }}>Payment Information:</strong> UPI transaction references and payment status. We do not store full payment card details.</p>
      <p><strong style={{ color:'var(--t1)' }}>Usage Data:</strong> Device type, IP address, browser, pages visited, and feature usage for analytics and improvement purposes.</p>
    </Section>

    <Section title="2. How We Use Your Information">
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        {['Provide and personalise our fitness services','Match you with suitable certified trainers','Process payments and bookings','Send service notifications and updates','Improve our platform through analytics','Comply with legal obligations under Indian law'].map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Section>

    <Section title="3. Data Sharing">
      <p style={{ marginBottom:10 }}>We do <strong style={{ color:'var(--t1)' }}>not</strong> sell your personal data to third parties. We may share limited information with:</p>
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        <li><strong style={{ color:'var(--t1)' }}>Assigned Trainers:</strong> Your fitness profile, goals, and progress to enable personalised coaching.</li>
        <li><strong style={{ color:'var(--t1)' }}>Payment Processors:</strong> UPI details to complete transactions securely.</li>
        <li><strong style={{ color:'var(--t1)' }}>Legal Authorities:</strong> When required by law or court order.</li>
      </ul>
    </Section>

    <Section title="4. Data Security">
      <p>We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, JWT authentication with short-lived tokens, and regular security audits. Health data is stored on servers located within India in compliance with the Digital Personal Data Protection Act, 2023.</p>
    </Section>

    <Section title="5. Your Rights">
      <p style={{ marginBottom:10 }}>Under the DPDP Act 2023, you have the right to:</p>
      <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
        <li>Access and download your personal data</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your account and data</li>
        <li>Withdraw consent for data processing</li>
        <li>Nominate a representative for your data rights</li>
      </ul>
      <p style={{ marginTop:10 }}>To exercise these rights, email <a href="mailto:privacy@mpowerfitness.in" style={{ color:'var(--lime)' }}>privacy@mpowerfitness.in</a>.</p>
    </Section>

    <Section title="6. Cookies">
      <p>We use essential cookies for authentication and session management. Analytics cookies (opt-out available in settings) help us understand usage patterns. We do not use advertising or third-party tracking cookies.</p>
    </Section>

    <Section title="7. Data Retention">
      <p>Account data is retained while your account is active. After deletion, personal data is removed within 30 days, except where retention is required by law (e.g., financial records for 7 years).</p>
    </Section>

    <Section title="8. Contact">
      <p>Data Protection Officer: <a href="mailto:privacy@mpowerfitness.in" style={{ color:'var(--lime)' }}>privacy@mpowerfitness.in</a><br/>
      Mpower Fitness Pvt. Ltd., Mumbai, Maharashtra 400001, India.</p>
    </Section>
  </InfoLayout>
);

export default PrivacyPage;
