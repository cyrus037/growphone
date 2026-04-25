import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Nav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Load services data
  useEffect(() => {
    let cancelled = false;
    const loadServices = async () => {
      try {
        const data = await api('/api/services');
        if (!cancelled) {
          setServices(data);
        }
      } catch (error) {
        console.error('Error loading services:', error);
      }
    };
    loadServices();
    return () => {
      cancelled = true;
    };
  }, []);

  const goPricing = () => {
    navigate('/');
    setOpen(false);
    setTimeout(() => {
      document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <>
      <nav className="site-nav">
        <Link to="/" className="logo logo-link" onClick={() => setOpen(false)} title="GrowPhone — Home">
          <img
            src="/logo.png"
            alt=""
            className="logo-img"
            width={40}
            height={40}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.dataset.fallback === '1') return;
              el.dataset.fallback = '1';
              el.src = '/logo.svg';
            }}
          />
          <span className="logo-wordmark" aria-hidden="true">
            Grow<span className="logo-phone">Phone</span>
          </span>
          <span className="sr-only">GrowPhone — Home</span>
        </Link>

        <div className={`nav-links ${open ? 'nav-links--open' : ''}`}>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/"
            end
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>
          
          {/* Services Dropdown */}
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button 
              type="button" 
              className={`nav-link nav-dropdown-toggle ${servicesOpen ? 'nav-dropdown-toggle--open' : ''}`}
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              Services
              <span className="nav-dropdown-arrow">▼</span>
            </button>
            {servicesOpen && (
              <div className="nav-dropdown-menu">
                {services.map((service) => (
                  <Link
                    key={service._id}
                    to={`/services/${service.slug}`}
                    className="nav-dropdown-item"
                    onClick={() => {
                      setOpen(false);
                      setServicesOpen(false);
                    }}
                  >
                    <span className="nav-dropdown-icon">{service.icon || '📋'}</span>
                    <div className="nav-dropdown-content">
                      <div className="nav-dropdown-title">{service.title}</div>
                      <div className="nav-dropdown-desc">{service.shortDescription || service.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <button type="button" className="nav-link" onClick={goPricing}>
            Pricing
          </button>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/blog"
            onClick={() => setOpen(false)}
          >
            Blog
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/contact"
            onClick={() => setOpen(false)}
          >
            Contact
          </NavLink>
          <button
            type="button"
            className="nav-cta nav-cta--mobile"
            onClick={() => {
              setOpen(false);
              navigate('/contact');
            }}
          >
            Get Free Audit →
          </button>
        </div>

        <button
          type="button"
          className="nav-hamburger"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-hamburger-bar" />
          <span className="nav-hamburger-bar" />
          <span className="nav-hamburger-bar" />
        </button>

        <button type="button" className="nav-cta nav-cta--desktop" onClick={() => navigate('/contact')}>
          Get Free Audit →
        </button>
      </nav>
      {open ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
