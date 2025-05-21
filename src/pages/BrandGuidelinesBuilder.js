import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BrandGuidelinesBuilder() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    logoUrl: '',
    logoVariations: [],
    colorPaletteUrl: '',
    typographyUrl: '',
    brandStory: '',
    brandValues: '',
    brandVoice: '',
    notes: ''
  });
  const [previews, setPreviews] = useState({
    logo: null,
    colorPalette: null,
    typography: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadExistingGuidelines();
  }, [projectId]);

  const loadExistingGuidelines = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const guidelinesRef = doc(db, "projects", projectId, "brandGuidelines", "guidelines");
      const guidelinesDoc = await getDoc(guidelinesRef);

      if (guidelinesDoc.exists()) {
        const data = guidelinesDoc.data();
        setFormData(data);
        // Set previews for existing images
        setPreviews({
          logo: data.logoUrl,
          colorPalette: data.colorPaletteUrl,
          typography: data.typographyUrl
        });
      }
    } catch (error) {
      console.error("Error loading guidelines:", error);
      setErrors(prev => ({ ...prev, load: "Failed to load existing guidelines" }));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: "Only JPG, PNG and SVG files are allowed" }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [type]: "File size must be less than 5MB" }));
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const storageRef = ref(storage, `projects/${projectId}/guidelines/${type}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      setFormData(prev => ({ ...prev, [`${type}Url`]: url }));
      setPreviews(prev => ({ ...prev, [type]: url }));
      setErrors(prev => ({ ...prev, [type]: null }));
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setErrors(prev => ({ ...prev, [type]: "Failed to upload file" }));
    }
  };

  const handleLogoVariationAdd = () => {
    setFormData(prev => ({
      ...prev,
      logoVariations: [...prev.logoVariations, { name: '', url: '' }]
    }));
  };

  const handleLogoVariationRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      logoVariations: prev.logoVariations.filter((_, i) => i !== index)
    }));
  };

  const handleLogoVariationChange = async (index, field, value, file) => {
    if (field === 'url' && file) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");

        const storageRef = ref(storage, `projects/${projectId}/guidelines/logo-variations/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        setFormData(prev => ({
          ...prev,
          logoVariations: prev.logoVariations.map((variation, i) => 
            i === index ? { ...variation, url } : variation
          )
        }));
      } catch (error) {
        console.error("Error uploading logo variation:", error);
        setErrors(prev => ({ ...prev, [`logoVariation${index}`]: "Failed to upload file" }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        logoVariations: prev.logoVariations.map((variation, i) => 
          i === index ? { ...variation, [field]: value } : variation
        )
      }));
    }
  };

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const guidelinesRef = doc(db, "projects", projectId, "brandGuidelines", "guidelines");
      await setDoc(guidelinesRef, {
        ...formData,
        updatedAt: new Date(),
        designerId: user.uid
      }, { merge: true });

      navigate(`/project/${projectId}/guidelines`);
    } catch (error) {
      console.error("Error saving guidelines:", error);
      setErrors(prev => ({ ...prev, save: "Failed to save guidelines" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading guidelines..." />;
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8">
          <h2 className="mb-4">Brand Guidelines Builder</h2>
          
          {/* Primary Logo Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Primary Logo</h5>
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  className="form-control"
                />
                {errors.logo && <div className="text-danger mt-2">{errors.logo}</div>}
                {previews.logo && (
                  <div className="mt-2">
                    <img src={previews.logo} alt="Logo preview" style={{ maxHeight: '100px' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logo Variations Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Logo Variations</h5>
              {formData.logoVariations.map((variation, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <div className="row">
                    <div className="col-md-4">
                      <input
                        type="text"
                        value={variation.name}
                        onChange={(e) => handleLogoVariationChange(index, 'name', e.target.value)}
                        placeholder="Variation name"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoVariationChange(index, 'url', null, e.target.files[0])}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        onClick={() => handleLogoVariationRemove(index)}
                        className="btn btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {variation.url && (
                    <div className="mt-2">
                      <img src={variation.url} alt={`${variation.name} preview`} style={{ maxHeight: '100px' }} />
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={handleLogoVariationAdd}
                className="btn btn-outline-primary"
              >
                Add Logo Variation
              </button>
            </div>
          </div>

          {/* Color Palette Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Color Palette</h5>
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'colorPalette')}
                  className="form-control"
                />
                {errors.colorPalette && <div className="text-danger mt-2">{errors.colorPalette}</div>}
                {previews.colorPalette && (
                  <div className="mt-2">
                    <img src={previews.colorPalette} alt="Color palette preview" style={{ maxHeight: '100px' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Typography</h5>
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'typography')}
                  className="form-control"
                />
                {errors.typography && <div className="text-danger mt-2">{errors.typography}</div>}
                {previews.typography && (
                  <div className="mt-2">
                    <img src={previews.typography} alt="Typography preview" style={{ maxHeight: '100px' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brand Content Sections */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Brand Content</h5>
              <div className="mb-3">
                <label className="form-label">Brand Story</label>
                <textarea
                  value={formData.brandStory}
                  onChange={(e) => handleTextChange('brandStory', e.target.value)}
                  className="form-control"
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Brand Values</label>
                <textarea
                  value={formData.brandValues}
                  onChange={(e) => handleTextChange('brandValues', e.target.value)}
                  className="form-control"
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Brand Voice</label>
                <textarea
                  value={formData.brandVoice}
                  onChange={(e) => handleTextChange('brandVoice', e.target.value)}
                  className="form-control"
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleTextChange('notes', e.target.value)}
                  className="form-control"
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Guidelines'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 