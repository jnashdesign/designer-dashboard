import React from 'react';
import { Link } from 'react-router-dom';
import './MarketingHome.css';
import Logo_icon_3D from './Logo_icon_3D';
const features = [
  {
    icon: 'fas fa-project-diagram',
    title: 'Project Management',
    desc: 'Easily manage all your branding projects, clients, and timelines in one place.'
  },
  {
    icon: 'fas fa-file-signature',
    title: 'Creative Briefs',
    desc: 'Send, customize, and collect creative briefs with grouped questions and file uploads.'
  },
  {
    icon: 'fas fa-images',
    title: 'Asset Management',
    desc: 'Upload, organize, and share brand assets with clients. Preview images and PDFs instantly.'
  },
  {
    icon: 'fas fa-users',
    title: 'Client Collaboration',
    desc: 'Invite clients, assign projects, and keep everyone in sync with real-time updates.'
  },
  {
    icon: 'fas fa-layer-group',
    title: 'Template Library',
    desc: 'Create, edit, and reuse questionnaire templates for different project types.'
  },
  {
    icon: 'fas fa-moon',
    title: 'Light & Dark Mode',
    desc: 'Beautiful, accessible UI with instant light/dark mode switching.'
  }
];

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: [
      '1 active project',
      'Unlimited clients',
      'Default creative brief',
      'Basic asset uploads',
      'Email support'
    ],
    cta: 'Get Started',
    highlight: false,
    link: '/signup'
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    features: [
      'Unlimited projects',
      'Custom brief templates',
      'Advanced asset management',
      'Client portal',
      'Priority support'
    ],
    cta: 'Start Pro Trial',
    highlight: false,
    link: '/signup'
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/mo',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'White-label client portal',
      'Bulk asset uploads',
      'Dedicated support'
    ],
    cta: 'Contact Sales',
    highlight: true,
    link: '/signup'
  }
];

export default function MarketingHome() {
  return (
    <div className="marketing-home">
      {/* Hero Section */}
      <section className="hero text-center py-5 bg-light">
      <div className="container">
          <h1 className="display-4 mb-3">Effortlessly Manage Branding&nbsp;Projects</h1>
          <p className="lead mb-4">
            The all-in-one platform for brand designers and their clients.
          </p>
          <div className="d-flex justify-content-center gap-3 mb-2">
            <Link to="/signup" className="btn btn-primary btn-lg mr-2">Get Started Free</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-5">
        <div className="container">
          <h2 className="text-center mb-5">Features for Designers & Clients</h2>
          <div className="row">
            {features.map((f, i) => (
              <div className="col-12 col-md-4 mb-4 text-center" key={i}>
                <div className="feature-card p-4 h-100 shadow-sm bg-white rounded">
                  <i className={`${f.icon} fa-2x mb-3 text-primary`} />
                  <div className="feature-card-content">
                    <h5>{f.title}</h5>
                    <p className="text-muted">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Simple, Transparent Pricing</h2>
          <div className="row justify-content-center">
            {pricing.map((tier, i) => (
              <div className={`col-12 col-md-4 mb-4 ${tier.highlight ? 'order-md-2' : ''}`} key={i}>
                <div className={`card pricing-card h-100 ${tier.highlight ? 'border-primary shadow-lg' : 'shadow-sm'}`}>
                  <div className="card-body text-center">
                    <h5 className="card-title mb-3">{tier.name}</h5>
                    <h2 className="card-price mb-3">
                      {tier.price}
                      <span className="text-muted" style={{ fontSize: '1rem' }}>{tier.period}</span>
                    </h2>
                    <ul className="list-unstyled mb-4">
                      {tier.features.map((f, j) => (
                        <li key={j} className="mb-2">
                          <i className="fas fa-check text-success me-2 mr-2" />{f}
                        </li>
                      ))}
                    </ul>
                    <Link to={tier.link} className={`btn btn-lg ${tier.highlight ? 'btn-primary' : 'btn-outline-primary'}`}>{tier.cta}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted mt-4">No credit card required. Cancel anytime.</p>
        </div>
      </section>
    </div>
  );
} 