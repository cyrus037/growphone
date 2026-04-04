import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useSiteSettings } from '../context/SettingsContext';
import { FALLBACK_PRICING_PLANS } from '../constants/fallbackPricingPlans';
import ServicesSection from '../components/ServicesSection';

function PlanCard({ plan, pricingMode, onCta }) {
  const price = pricingMode === 'monthly' ? plan.monthly : plan.quarterly;
  const entries = Object.entries(plan.features || {});

  return (
    <div className={`plan-card ${plan.popular ? 'popular' : ''}`}>
      {plan.popular ? <div className="popular-badge">⭐ Most Popular</div> : null}
      <div className="plan-name">{plan.name}</div>
      <div className="plan-price">₹{Number(price).toLocaleString('en-IN')}</div>
      <div className="plan-period">
        {pricingMode === 'monthly' ? 'per month' : 'per month (billed quarterly)'}
      </div>
      <ul className="plan-features">
        {entries.map(([k, v]) => (
          <li key={k}>
            <span
              className={
                typeof v === 'boolean' ? (v ? 'feat-yes' : 'feat-no') : 'feat-yes'
              }
            >
              {typeof v === 'boolean' ? (v ? '✓' : '✗') : '✓'}
            </span>{' '}
            <span>{typeof v === 'number' ? `${v} ${k}` : k}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="plan-btn" onClick={onCta}>
        {plan.name === 'Elite' ? 'Talk to Us' : 'Get Started'}
      </button>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const [plans, setPlans] = useState([]);
  const [pricingMode, setPricingMode] = useState('monthly');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/pricing/public');
        if (cancelled) return;
        const list = Array.isArray(data) && data.length > 0 ? data : FALLBACK_PRICING_PLANS;
        setPlans(list);
      } catch {
        if (!cancelled) setPlans(FALLBACK_PRICING_PLANS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (location.hash === '#pricing') {
      requestAnimationFrame(() => {
        document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [location]);

  const showQuarterly = settings.quarterlyPricingToggle;

  return (
    <div>
      <div className="hero">
        <div className="hero-badge">
          <span /> India&apos;s #1 Social Growth Agency
        </div>
        <h1>
          {settings.heroHeadline}
          <br />
          <em>{settings.heroAccent}</em>
        </h1>
        <p className="hero-sub">{settings.heroSubtext}</p>
        <div className="hero-btns">
          <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>
            Start Growing →
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/blog')}>
            See Case Studies
          </button>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <div className="stat-num">500+</div>
          <div className="stat-label">Clients Served</div>
        </div>
        <div className="stat">
          <div className="stat-num">₹2Cr+</div>
          <div className="stat-label">Revenue Generated</div>
        </div>
        <div className="stat">
          <div className="stat-num">98%</div>
          <div className="stat-label">Retention Rate</div>
        </div>
        <div className="stat">
          <div className="stat-num">4.9★</div>
          <div className="stat-label">Average GMB Rating</div>
        </div>
      </div>

      <ServicesSection />

      <div className="section" id="pricing-section">
        <div className="section-label">Pricing</div>
        <div className="section-title">Transparent Plans, Zero Surprises</div>
        {showQuarterly ? (
          <div className="pricing-toggle">
            <button
              type="button"
              className={`toggle-btn ${pricingMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setPricingMode('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`toggle-btn ${pricingMode === 'quarterly' ? 'active' : ''}`}
              onClick={() => setPricingMode('quarterly')}
            >
              Quarterly <span className="badge-save">Save 15%</span>
            </button>
          </div>
        ) : null}
        <div className="pricing-grid">
          {plans.map((p) => (
            <PlanCard
              key={p._id || p.name}
              plan={p}
              pricingMode={showQuarterly ? pricingMode : 'monthly'}
              onCta={() => navigate('/contact')}
            />
          ))}
        </div>
      </div>

      <div
        className="section"
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          maxWidth: 'none',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>
            Ready to grow?
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-1px', marginBottom: '1rem' }}>
            Get a <em style={{ fontStyle: 'normal', color: 'var(--blue2)' }}>Free Audit</em> Today
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: '2rem' }}>
            We&apos;ll review your current social presence and tell you exactly what to fix — no strings
            attached.
          </p>
          <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>
            Claim Your Free Audit →
          </button>
        </div>
      </div>
    </div>
  );
}
