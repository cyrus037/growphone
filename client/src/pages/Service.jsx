import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { api } from '../api';

const Service = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    const loadService = async () => {
      try {
        const data = await api(`/api/services/${slug}`);
        if (!cancelled) {
          setService(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading service:', err);
          setError('Service not found');
          setLoading(false);
        }
      }
    };

    if (slug) {
      loadService();
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Parse content with markdown-like formatting
  const parseContent = (content) => {
    if (!content) return '';
    
    return content
      .split('\n')
      .map((line, index) => {
        // Handle headers
        if (line.startsWith('## ')) {
          return (
            <h3 key={index} className="service-subtitle">
              {line.replace('## ', '')}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={index} className="service-title">
              {line.replace('# ', '')}
            </h2>
          );
        }
        
        // Handle bullet points with checkmarks
        if (line.includes('✅')) {
          return (
            <div key={index} className="service-feature">
              <span className="service-check">✅</span>
              <span>{line.replace('✅', '').trim()}</span>
            </div>
          );
        }
        
        // Handle regular bullet points
        if (line.startsWith('- ')) {
          return (
            <div key={index} className="service-bullet">
              <span>{line.replace('- ', '')}</span>
            </div>
          );
        }
        
        // Handle pricing sections
        if (line.startsWith('- **') && line.includes('**:**')) {
          const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
          if (match) {
            return (
              <div key={index} className="service-pricing-item">
                <strong>{match[1]}:</strong> {match[2]}
              </div>
            );
          }
        }
        
        // Handle regular paragraphs
        if (line.trim()) {
          return (
            <p key={index} className="service-paragraph">
              {line}
            </p>
          );
        }
        
        return null;
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="service-loading">
        <div className="container">
          <div className="loading-spinner">Loading service...</div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-error">
        <div className="container">
          <h1>Service Not Found</h1>
          <p>The service you're looking for doesn't exist or has been removed.</p>
          <Link to="/services" className="back-link">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={service.metaTitle || service.title}
        description={service.metaDescription || service.description}
        keywords={service.metaKeywords}
        ogImage={service.ogImage}
        canonical={`https://growphone.in/services/${service.slug}`}
      />
      
      <motion.div
        className="service-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <section className="service-hero">
          <div className="container">
            <div className="service-hero-content">
              <div className="service-hero-icon">{service.icon || '📋'}</div>
              <h1 className="service-hero-title">{service.title}</h1>
              <p className="service-hero-description">{service.description}</p>
              {service.price && (
                <div className="service-hero-price">{service.price}</div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="service-content">
          <div className="container">
            <div className="service-content-wrapper">
              <div className="service-content-main">
                {parseContent(service.content)}
              </div>
              
              {/* Sidebar */}
              <div className="service-sidebar">
                <div className="service-sidebar-card">
                  <h3>Get Started</h3>
                  <p>Ready to grow with our {service.title} service?</p>
                  <Link to="/contact" className="service-cta">
                    Get Free Consultation →
                  </Link>
                </div>
                
                {service.pricingModel && (
                  <div className="service-sidebar-card">
                    <h3>Pricing Model</h3>
                    <p className="service-pricing-model">
                      {service.pricingModel.charAt(0).toUpperCase() + service.pricingModel.slice(1)}
                    </p>
                  </div>
                )}
                
                <div className="service-sidebar-card">
                  <h3>Other Services</h3>
                  <div className="service-links">
                    <Link to="/services" className="service-link">
                      All Services →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="service-cta-section">
          <div className="container">
            <div className="service-cta-content">
              <h2>Ready to Transform Your Business?</h2>
              <p>Let's discuss how our {service.title} service can help you achieve your goals.</p>
              <div className="service-cta-buttons">
                <Link to="/contact" className="service-cta-primary">
                  Get Started →
                </Link>
                <Link to="/contact" className="service-cta-secondary">
                  Schedule a Call
                </Link>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default Service;
