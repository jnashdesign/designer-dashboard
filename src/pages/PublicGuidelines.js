import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/shared/Logo';

export default function PublicGuidelines() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [guidelines, setGuidelines] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGuidelines();
  }, [projectId]);

  const loadGuidelines = async () => {
    try {
      const guidelinesRef = doc(db, "projects", projectId, "brandGuidelines", "guidelines");
      const guidelinesDoc = await getDoc(guidelinesRef);

      if (guidelinesDoc.exists()) {
        setGuidelines(guidelinesDoc.data());
      } else {
        setError("No guidelines found for this project");
      }
    } catch (error) {
      console.error("Error loading guidelines:", error);
      setError("Failed to load guidelines");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading guidelines..." />;
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!guidelines) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">No guidelines found for this project.</div>
      </div>
    );
  }

  return (
    <div>
      <nav style={{ 
        display: 'flex', 
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem', 
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="nav-logo d-flex align-items-center text-decoration-none">
            <Logo />
          </Link>
        </div>
      </nav>
      <div className="container p-4" style={{ marginTop: '120px', marginLeft: '-40px', marginRight: '-40px', width: 'calc(100% + 80px)' }}>
        <div className="container py-4 brand-guidelines">
          <h2>Brand Guidelines</h2>
          <div className="row">
            <div className="col-md-12">
              {/* Primary Logo */}
              {guidelines.logoUrl && (
                <div className="card mb-4 logo-card">
                  <div className="card-body">
                    <h3 className="card-title">Primary Logo</h3>
                    <img src={guidelines.logoUrl} alt="Primary Logo" className="img-fluid" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* Logo Variations */}
              {guidelines.logoVariations?.length > 0 && (
                <div className="card mb-3 logo-variations-card">
                  <div className="card-body">
                    <h3 className="card-title">Logo Variations</h3>
                    <div className="row">
                      {guidelines.logoVariations.map((variation, index) => (
                        variation.url && (
                          <div key={index} className="col-md-4 mb-3">
                            <img src={variation.url} alt={variation.name} className="img-fluid" style={{ maxHeight: '150px' }} />
                            <h6 className="text-muted mt-2">{variation.name}</h6>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Color Palette */}
              {guidelines.colorPalette && guidelines.colorPalette.length > 0 && (
                <div className="card mb-4 color-palette-card">
                  <div className="card-body">
                    <h3 className="card-title">Color Palette</h3>
                    <div className="row">
                      {guidelines.colorPalette.map((color, index) => (
                        console.log(color),
                        <div key={index} className="col-md-3 mb-3">
                          <div style={{ height: '100px', backgroundColor: color.hex, border: '1px solid #ccc' }}></div>
                          <h6 className="text-muted mt-2">{color.name || `Color ${index + 1}`}</h6>
                          {color.hex && (
                            <div style={{ fontSize: '0.95em', color: '#555' }}>
                            <div><strong>HEX:</strong> {color.hex}</div>
                            <div><strong>RGB:</strong> {color.rgb.r}, {color.rgb.g}, {color.rgb.b}</div>
                              <div><strong>CMYK:</strong> {color.cmyk.c}, {color.cmyk.m}, {color.cmyk.y}, {color.cmyk.k}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Typography */}
              <div className="card col-md-12 mb-12 typography-card">
                <div className="card-body">
                  <h3 className="card-title">Typography</h3>
                  {/* Primary Font */}
                  {guidelines.primaryFontPreview && (
                    <div className="mb-3 col-md-12">
                      <label className="form-label">Primary Font</label>
                      {guidelines.primaryFontMetadata && (
                        <div>
                          <h2><strong>{guidelines.primaryFontMetadata.familyName}</strong></h2>
                          <div className="typography-weight">{guidelines.primaryFontMetadata.subFamilyName}</div>
                        </div>
                      )}
                      <div className="mb-2">
                        <img
                          src={guidelines.primaryFontPreview}
                          alt="Primary font preview"
                          style={{ background: '#fff', maxWidth: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Secondary Font */}
                  {guidelines.secondaryFontPreview && (
                    <div className="mb-3 col-md-12 secondary-font">
                      <label className="form-label">Secondary Font</label>
                      {guidelines.secondaryFontMetadata && (
                        <div>
                          <h2><strong>{guidelines.secondaryFontMetadata.familyName}</strong></h2>
                          <div className="typography-weight">{guidelines.secondaryFontMetadata.subFamilyName}</div>
                        </div>
                      )}
                      <div className="mb-2">
                        <img
                          src={guidelines.secondaryFontPreview}
                          alt="Secondary font preview"
                          style={{ background: '#fff', maxWidth: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Content */}
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title">Brand Content</h3>
                  {guidelines.brandStory && (
                    <div className="mb-4">
                      <h6>Brand Story</h6>
                      <p className="text-muted">{guidelines.brandStory}</p>
                    </div>
                  )}
                  {guidelines.brandValues && (
                    <div className="mb-4">
                      <h6>Brand Values</h6>
                      <p className="text-muted">{guidelines.brandValues}</p>
                    </div>
                  )}
                  {guidelines.brandVoice && (
                    <div className="mb-4">
                      <h6>Brand Voice</h6>
                      <p className="text-muted">{guidelines.brandVoice}</p>
                    </div>
                  )}
                  {guidelines.notes && (
                    <div className="mb-4">
                      <h6>Additional Notes</h6>
                      <p className="text-muted">{guidelines.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 