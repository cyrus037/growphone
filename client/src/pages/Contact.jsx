import { useState } from 'react';
import { api } from '../api';
import { useSiteSettings } from '../context/SettingsContext';
import { buildWhatsAppUrl } from '../utils/whatsapp';

export default function Contact() {
  const { settings } = useSiteSettings();
  const waHref = buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessageTemplate);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const em = email.trim();
    if (!name.trim() || !businessType || !phone.trim() || !em) {
      setErr('Please fill in all required fields.');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    if (!emailOk) {
      setErr('Please enter a valid email address.');
      return;
    }
    try {
      await api('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: em,
          businessType,
          phone: phone.trim(),
          budget: budget || '',
        }),
      });
      setDone(true);
    } catch (er) {
      setErr(er.message || 'Something went wrong.');
    }
  }

  return (
    <div className="section">
      <div className="contact-grid">
        <div className="contact-info">
          <div className="section-label">Let&apos;s Talk</div>
          <h2>
            Get Your Free
            <br />
            <em style={{ fontStyle: 'normal', color: 'var(--blue2)' }}>Strategy Call</em>
          </h2>
          <p>
            Fill in the form and our team will reach out within 2 hours on WhatsApp. No spam, no
            pressure — just a real conversation about your growth.
          </p>
          <div className="contact-detail">
            <div className="icon">📞</div>
            {waHref === '#' ? (
              <span>{settings.whatsappNumber}</span>
            ) : (
              <a className="contact-wa-link" href={waHref} target="_blank" rel="noreferrer">
                {settings.whatsappNumber}
              </a>
            )}
          </div>
          <div className="contact-detail">
            <div className="icon">📧</div>
            <span>info@growphone.in</span>
          </div>
          <div className="contact-detail">
            <div className="icon">📍</div>
            <span>Serving all of India, Remotely</span>
          </div>
        </div>
        <div className="form-card">
          {!done ? (
            <form id="contact-form-wrap" onSubmit={submit}>
              {err ? (
                <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: '1rem' }}>{err}</p>
              ) : null}
              <div className="form-group">
                <label htmlFor="cf-name">FULL NAME</label>
                <input
                  id="cf-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cf-email">EMAIL</label>
                <input
                  id="cf-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cf-type">BUSINESS TYPE</label>
                <select
                  id="cf-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                >
                  <option value="">Select your business</option>
                  <option>Restaurant / Café</option>
                  <option>Clinic / Hospital</option>
                  <option>Real Estate</option>
                  <option>D2C / E-commerce</option>
                  <option>Education / Coaching</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="cf-phone">WHATSAPP NUMBER</label>
                <input
                  id="cf-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cf-budget">MONTHLY BUDGET</label>
                <select id="cf-budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="">Select range</option>
                  <option>Under ₹5,000</option>
                  <option>₹5,000 – ₹10,000</option>
                  <option>₹10,000 – ₹25,000</option>
                  <option>₹25,000+</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">
                Send Message →
              </button>
            </form>
          ) : (
            <div className="success-msg" style={{ display: 'block' }}>
              <div className="check">🎉</div>
              <h3 style={{ marginBottom: '0.5rem' }}>You&apos;re all set!</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                We&apos;ll WhatsApp you within 2 hours. Get ready to grow!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
