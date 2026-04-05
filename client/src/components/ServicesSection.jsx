import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SERVICE_ITEMS } from '../constants/services';

function useDesktopMotion() {
  const [ok, setOk] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setOk(mq.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return ok && !reduced;
}

export default function ServicesSection() {
  const desktopAnim = useDesktopMotion();

  return (
    <section className="services-section" id="services-section" aria-labelledby="services-heading">
      <div className="services-inner">
        <div className="services-sticky-side">
          <div className="section-label">What We Do</div>
          <h2 id="services-heading" className="section-title services-title">
            Services Built to <em className="services-accent">Convert</em>
          </h2>
          <p className="services-lede">
            Six growth systems — from reels to GMB — built to turn attention into enquiries.
          </p>
        </div>

        <div className="services-grid">
          {SERVICE_ITEMS.map((item, i) => {
            const CardInner = (
              <div className="service-card-inner">
                <div className="bento-icon service-card-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            );

            if (desktopAnim) {
              return (
                <motion.article
                  key={item.title}
                  className="bento-card service-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  {CardInner}
                </motion.article>
              );
            }

            return (
              <article key={item.title} className="bento-card service-card">
                {CardInner}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
