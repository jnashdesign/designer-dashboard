import React from "react";
import { Link } from "react-router-dom";
import "./MarketingHome.css";
import Logo_icon_3D from "./Logo_icon_3D";
import ContactForm from "./ContactForm";

const features = [
  {
    icon: "fas fa-project-diagram",
    title: "Project Management Dashboard",
    desc: "Easily manage all your branding projects, clients, and timelines in one place.",
  },
  {
    icon: "fas fa-file-alt",
    title: "Brand Guidelines Builder",
    desc: "Create brand guidelines for your clients with our easy-to-use builder.",
  },
  {
    icon: "fas fa-file-signature",
    title: "Smart Creative Briefs",
    desc: "Use a professionally curated questionnaire or create your own.",
  },
  {
    icon: "fas fa-images",
    title: "Asset Management Repository",
    desc: "Upload, organize, and share brand assets instantly with your clients.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: [
      "1 active project",
      "Unlimited clients",
      "Default creative brief",
      "Basic asset uploads",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
    link: "/signup",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: [
      "Unlimited projects",
      "Custom brief templates",
      "Advanced asset management",
      "Client portal",
    ],
    cta: "Start Pro Trial",
    highlight: false,
    link: "/signup",
  },
  {
    name: "Agency",
    price: "$49",
    period: "/mo",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "White-label client portal",
      "Bulk asset uploads",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlight: true,
    link: "/signup",
  },
];

export default function MarketingHome() {
  return (
    <div className="marketing-home">
      {/* Hero Section */}
      <section className="hero text-center bg-light">
        <div className="container">
          <h1 className="display-4 mb-3">
            Effortlessly Manage Branding&nbsp;Projects
          </h1>
          <p className="lead mb-4" style={{ lineHeight: "1.5" }}>
            BrandEZ helps you manage every aspect of your client projects—from
            creative briefs to brand guidelines, asset delivery, and more—in one
            beautiful, intuitive platform.
          </p>
          <div className="d-flex justify-content-center gap-3 mb-2">
            <Link to="/signup" className="btn btn-primary btn-lg mr-2">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Designer-Focused Marketing Section */}
      <section className="designer-marketing bg-white py-5">
        <div className="container">
          <h1
            className="text-center mb-4"
            style={{ maxWidth: 700, margin: "0 auto" }}>
            Streamline your workflow, impress your clients, and keep every
            project organized from start to finish.
          </h1>
        </div>
      </section>

      <div className="text-center mb-4 pt-5 pb-3">
        <h4>Ready to level up your branding workflow?</h4>
        <Link to="/signup" className="btn btn-lg btn-primary mt-2">
          Try BrandEZ Free
        </Link>
      </div>

      {/* Features Section */}
      <section className="features pt-3">
        <div className="container full">
          <h2 className="text-center mb-5 pt-3 fw-600">
            Features for Designers & Their Clients
          </h2>
          <div className="row">
            {features.map((f, i) => (
              <div className="col-12 col-md-3 mb-4 text-center" key={i}>
                <div className="feature-card p-4 h-100 bg-white rounded">
                  <i className={`${f.icon} fa-2x mb-4 text-primar`} />
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

      {/* Feature Details Section */}
      <section className="features-details mt-5">
      <h2 className="text-center fw-600">Feature Details</h2>
        <div className="container" style={{ backgroundColor: "transparent" }}>
          <div className="row mb-4">
            <div className="col-md-6 mb-4">
              <h5>Effortless Project Management</h5>
              <ul>
                <li>
                  Instantly create, organize, and track all your branding
                  projects in a single dashboard.
                </li>
                <li>
                  Add, edit, and delete projects with just a click—no clutter,
                  no confusion.
                </li>
              </ul>
            </div>
            <div className="col-md-6 mb-4 text-right">
              <img
                src={require("../../components/shared/icons_pm.png")}
                alt="Project Management"
              />
            </div>
            </div>
            <div className="row mb-4">
            <div className="col-md-6 mb-4 text-left">
              <img
                src={require("../../components/shared/icons_briefs.png")}
                alt="Project Management"
              />
            </div>
            <div className="col-md-6 mb-4">
              <h5>Smart Creative Briefs</h5>
              <ul>
                <li>
                  Use one of our professionally curated questionnaires to capture your
                  client's vision, values, and goals.
                </li>
                <li>
                Use our brief builder to create your own briefs to fit your exact needs.
              </li>
  
                <li>
                  Guide clients through a step-by-step wizard that ensures you
                  get all the details you need for a successful brand.
                </li>
              </ul>
            </div>
            </div>
            <div className="row mb-4">
            <div className="col-md-6 mb-4">
              <h5>Brand Guidelines Builder</h5>
              <ul>
                <li>
                  Build professional, client-ready brand guidelines with
                  sections for logos, color palettes, typography, and more.
                </li>
                <li>
                  Upload and preview custom fonts—see live thumbnails and font
                  details instantly, without ever storing the font file.
                </li>
                <li>
                  Add color swatches with custom names, and see automatic
                  RGB/CMYK breakdowns for perfect print and digital consistency.
                </li>
              </ul>
            </div>
            <div className="col-md-6 mb-4 text-right">
              <img
                src={require("../../components/shared/icons_guidelines.png")}
                alt="Project Management"
              />
            </div>
            </div>
            <div className="row mb-4">
            <div className="col-md-6 mb-4 text-left">
              <img
                src={require("../../components/shared/icons_assets.png")}
                alt="Project Management"
              />
            </div>
            <div className="col-md-6 mb-4">
              <h5>Asset Repository</h5>
              <ul>
                <li>
                  Upload, preview, and organize all your brand assets—logos,
                  marks, color palettes, templates, and more.
                </li>
                <li>
                  Supports all major file types: AI, EPS, SVG, PDF, PNG, JPG,
                  JPEG, TTF, OTF, and more.
                </li>
                <li>
                  Drag-and-drop uploads, instant previews, and easy asset
                  management.
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing bg-light pt-3">
        <div className="container">
          <h2 className="text-center mb-5 fw-600">Simple, Transparent Pricing</h2>
          <div className="justify-content-center row">
            {pricing.map((tier, i) => (
              <div
                className={`col-12 col-md-4 mb-4 ${
                  tier.highlight ? "order-md-2" : ""
                }`}
                key={i}>
                <div
                  className={`card pricing-card h-100 ${
                    tier.highlight ? "border-primary shadow-lg" : "shadow-sm"
                  }`}>
                  <div className="card-body text-center">
                    <h5 className="card-title mb-3">{tier.name}</h5>
                    <h2 className="card-price mb-3">
                      {tier.price}
                      <span className="text-muted" style={{ fontSize: "1rem" }}>
                        {tier.period}
                      </span>
                    </h2>
                    <ul className="list-unstyled mb-4">
                      {tier.features.map((f, j) => (
                        <li key={j} className="mb-2">
                          <i className="fas fa-check text-success me-2 mr-2" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={tier.link}
                      className={`btn btn-lg ${
                        tier.highlight ? "btn-primary" : "btn-outline-primary"
                      }`}>
                      {tier.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <ContactForm />
      <p
        className="text-right mr-2 text-muted mt-4"
        style={{ fontSize: "0.8rem" }}>
        &copy; 2025 BrandEZ Platform. All rights reserved.
      </p>
    </div>
  );
}
