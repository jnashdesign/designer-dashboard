import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ViewGuidelines() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [guidelines, setGuidelines] = useState(null);
  const [error, setError] = useState(null);

  const publicUrl = `/public/guidelines/${projectId}`;

  useEffect(() => {
    loadGuidelines();
  }, [projectId]);

  const loadGuidelines = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete these guidelines? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const guidelinesRef = doc(db, "projects", projectId, "brandGuidelines", "guidelines");
      await deleteDoc(guidelinesRef);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error deleting guidelines:", error);
      setError("Failed to delete guidelines");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading guidelines..." />;
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!guidelines) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">No guidelines found for this project.</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => window.open(publicUrl, '_blank', 'noopener,noreferrer')}
        >
          View Public Guidelines
        </button>
      </div>
      <div className="container py-4 brand-guidelines">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Brand Guidelines</h2>
          <div className="d-flex gap-2 action-buttons">
            <button
              onClick={() => navigate(`/project/${projectId}/guidelines/edit`)}
              style={{ borderRadius: '50%',padding: '8px 13px' }}
            >
            <i className="fas fa-pencil-alt" style={{ color: '#fff' }}/>
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-close"
              style={{ marginTop: '0' }}
              disabled={deleting}
            >
            </button>
          </div>
        </div>

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
            {guidelines.colorPaletteUrl && (
              <div className="card mb-4 color-palette-card">
                <div className="card-body">
                  <h3 className="card-title">Color Palette</h3>
                  <img src={guidelines.colorPaletteUrl} alt="Color Palette" className="img-fluid" style={{ maxHeight: '200px' }} />
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
                  <div className="mb-3 col-md-12 ">
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
  );
} 