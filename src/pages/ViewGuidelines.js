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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Brand Guidelines</h2>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate(`/project/${projectId}/guidelines/edit`)}
            className="btn btn-primary"
          >
            Edit Guidelines
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Guidelines'}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          {/* Primary Logo */}
          {guidelines.logoUrl && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Primary Logo</h5>
                <img src={guidelines.logoUrl} alt="Primary Logo" className="img-fluid" style={{ maxHeight: '200px' }} />
              </div>
            </div>
          )}

          {/* Logo Variations */}
          {guidelines.logoVariations?.length > 0 && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Logo Variations</h5>
                <div className="row">
                  {guidelines.logoVariations.map((variation, index) => (
                    variation.url && (
                      <div key={index} className="col-md-6 mb-3">
                        <h6 className="text-muted">{variation.name}</h6>
                        <img src={variation.url} alt={variation.name} className="img-fluid" style={{ maxHeight: '150px' }} />
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Color Palette */}
          {guidelines.colorPaletteUrl && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Color Palette</h5>
                <img src={guidelines.colorPaletteUrl} alt="Color Palette" className="img-fluid" style={{ maxHeight: '200px' }} />
              </div>
            </div>
          )}

          {/* Typography */}
          {guidelines.typographyUrl && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Typography</h5>
                <img src={guidelines.typographyUrl} alt="Typography" className="img-fluid" style={{ maxHeight: '200px' }} />
              </div>
            </div>
          )}

          {/* Brand Content */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Brand Content</h5>
              
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
  );
} 