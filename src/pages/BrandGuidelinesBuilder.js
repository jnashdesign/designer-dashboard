import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';
import opentype from 'opentype.js';

// Font preview generation function
const generateFontPreview = async (fontBuffer, text = 'AaBbCc123') => {
  try {
    const font = opentype.parse(fontBuffer);
    
    // Render preview
    const renderedText = 'AaBbCc123!@#$%^&*()';
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const fontSize = 48;
    // Measure bounding box for the font name
    const tempPath = font.getPath(renderedText, 0, 0, fontSize);
    const bbox = tempPath.getBoundingBox();
    canvas.width = canvas.width + 200;
    const x = (canvas.width - (bbox.x2 - bbox.x1)) / 2 - bbox.x1;
    const y = (canvas.height - (bbox.y2 - bbox.y1)) / 2 - bbox.y1;
    const path = font.getPath(renderedText, x, y, fontSize);
    path.draw(ctx);
    const preview = canvas.toDataURL('image/png');
    
    return preview;
  } catch (error) {
    console.error('Error generating font preview:', error);
    return null;
  }
};

// Font metadata extraction function
const extractFontMetadata = async (fontBuffer) => {
  try {
    const font = await opentype.load(fontBuffer);
    return {
      fullName: font.names.fullName?.en || font.names.postScriptName?.en || 'Unknown',
      familyName: font.names.fontFamily?.en || font.names.preferredFamily?.en || 'Unknown',
      subFamilyName: font.names.fontSubfamily?.en || font.names.preferredSubfamily?.en || 'Unknown',
      copyright: font.names.copyright?.en || '',
      version: font.names.version?.en || '1.0'
    };
  } catch (error) {
    console.error('Error extracting font metadata:', error);
    return null;
  }
};

// Helper function to read file as ArrayBuffer
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to validate font file
const validateFontFile = (file) => {
  // Check file extension
  const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!validExtensions.includes(extension)) {
    throw new Error(`Invalid file extension. Supported formats: ${validExtensions.join(', ')}`);
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Check MIME type
  const validMimeTypes = [
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'application/x-font-ttf',
    'application/x-font-otf',
    'application/font-woff',
    'application/font-woff2'
  ];
  
  if (!validMimeTypes.includes(file.type)) {
    // If MIME type is not recognized, check extension
    if (!validExtensions.includes(extension)) {
      throw new Error('Invalid file type. Please upload a valid font file.');
    }
  }
};

export default function BrandGuidelinesBuilder() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    logoUrl: '',
    logoVariations: [],
    colorPalette: [
      { hex: '#000000', name: '' },
      { hex: '#FFFFFF', name: '' },
      { hex: '#FF0000', name: '' },
      { hex: '#00FF00', name: '' }
    ],
    primaryFontUrl: '',
    primaryFontMetadata: null,
    secondaryFontUrl: '',
    secondaryFontMetadata: null,
    brandStory: '',
    brandValues: '',
    brandVoice: '',
    notes: ''
  });
  const [previews, setPreviews] = useState({
    logo: null,
    colorPalette: null,
    primaryFont: null,
    secondaryFont: null
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
        setFormData(prev => ({
          ...prev,
          ...data,
          colorPalette: (data.colorPalette && Array.isArray(data.colorPalette))
            ? data.colorPalette.map(c => {
                const hex = c.hex || '#000000';
                const rgb = c.rgb || hexToRgb(hex);
                const cmyk = c.cmyk || rgbToCmyk(rgb.r, rgb.g, rgb.b);
                return { hex, name: c.name || '', rgb, cmyk };
              })
            : prev.colorPalette,
          primaryFontMetadata: data.primaryFontMetadata || prev.primaryFontMetadata,
          secondaryFontMetadata: data.secondaryFontMetadata || prev.secondaryFontMetadata
        }));
        setPreviews(prev => ({
          ...prev,
          logo: data.logoUrl,
          primaryFont: data.primaryFontPreview || prev.primaryFont,
          secondaryFont: data.secondaryFontPreview || prev.secondaryFont
        }));
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

    const validImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    const isFont = type === 'primaryFont' || type === 'secondaryFont';

    try {
      if (isFont) {
        // Validate font file
        validateFontFile(file);

        // Debug: log file info
        console.log('Selected file:', file);
        console.log('File type:', file.type, 'File size:', file.size);

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        // Debug: log first few bytes
        const arr = new Uint8Array(arrayBuffer);
        console.log('First 8 bytes:', Array.from(arr.slice(0, 8)));

        // Parse font and extract metadata
        let font;
        try {
          font = opentype.parse(arrayBuffer);
        } catch (err) {
          console.error('opentype.js parse error:', err);
          throw new Error('Could not parse font file. The file may be corrupted or not a valid font.');
        }
        const metadata = {
          familyName: font.names.fontFamily?.en || font.names.preferredFamily?.en || 'Unknown',
          subFamilyName: font.names.fontSubfamily?.en || font.names.preferredSubfamily?.en || 'Unknown',
            };
        // Render preview
        const preview = await generateFontPreview(arrayBuffer);
        // Update state
        setFormData(prev => ({
          ...prev,
          [`${type}Metadata`]: metadata,
          [`${type}Url`]: '' // No URL since not uploaded
        }));
        setPreviews(prev => ({ ...prev, [type]: preview }));
        setErrors(prev => ({ ...prev, [type]: null }));
      } else {
        // Handle regular image upload
        if (!validImageTypes.includes(file.type)) {
          throw new Error('Only JPG, PNG and SVG files are allowed');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");
        const storageRef = ref(storage, `projects/${projectId}/guidelines/${type}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setFormData(prev => ({ ...prev, [`${type}Url`]: url }));
        setPreviews(prev => ({ ...prev, [type]: url }));
        setErrors(prev => ({ ...prev, [type]: null }));
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setErrors(prev => ({ ...prev, [type]: `Failed to process file: ${error.message}` }));
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

  const ensureColorFields = (color) => {
    const hex = color.hex || '#000000';
    const rgb = color.rgb || hexToRgb(hex);
    const cmyk = color.cmyk || rgbToCmyk(rgb.r, rgb.g, rgb.b);
    return { ...color, rgb, cmyk };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const guidelinesRef = doc(db, "projects", projectId, "brandGuidelines", "guidelines");
      const colorPaletteWithFields = formData.colorPalette.map(ensureColorFields);
      console.log('Saving colorPalette:', colorPaletteWithFields);
      await setDoc(guidelinesRef, {
        ...formData,
        colorPalette: colorPaletteWithFields,
        primaryFontPreview: previews.primaryFont || formData.primaryFontPreview || '',
        secondaryFontPreview: previews.secondaryFont || formData.secondaryFontPreview || '',
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

  // Color conversion helpers
  function hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255),
        m = 1 - (g / 255),
        y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    c = ((c - k) / (1 - k)) * 100;
    m = ((m - k) / (1 - k)) * 100;
    y = ((y - k) / (1 - k)) * 100;
    k = k * 100;
    return {
      c: Math.round(c),
      m: Math.round(m),
      y: Math.round(y),
      k: Math.round(k)
    };
  }

  const handleColorChange = (index, hex) => {
    const rgb = hexToRgb(hex);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setFormData(prev => {
      const updated = [...prev.colorPalette];
      updated[index] = { ...updated[index], hex, rgb, cmyk };
      return { ...prev, colorPalette: updated };
    });
  };

  const handleHexInput = (index, value) => {
    let hex = value.startsWith('#') ? value : '#' + value;
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) {
      handleColorChange(index, hex);
    } else {
      setFormData(prev => {
        const updated = [...prev.colorPalette];
        updated[index] = { ...updated[index], hex: value };
        return { ...prev, colorPalette: updated };
      });
    }
  };

  const handleColorNameChange = (index, name) => {
    setFormData(prev => {
      const updated = [...prev.colorPalette];
      const hex = updated[index].hex || '#000000';
      const rgb = hexToRgb(hex);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      updated[index] = { ...updated[index], name, rgb, cmyk };
      return { ...prev, colorPalette: updated };
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading guidelines..." />;
  }

  return (
    <div className="container py-4 brand-guidelines">
      <div className="row">
        <div className="col-md-12">
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
                  <input
                        type="text"
                        value={variation.name}
                        onChange={(e) => handleLogoVariationChange(index, 'name', e.target.value)}
                        placeholder="Variation name"
                        className="form-control"
                      />
                    <div className="row">

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
                        className="btn btn-close"
                        style={{ marginTop: 0 }}
                      >
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

          {/* Color Palette Section (4 color pickers) */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Color Palette</h5>
              <div className="row">
                {formData.colorPalette.map((color, idx) => {
                  return (
                    <div className="col-md-6 mb-3 mt-2 mb-4" key={idx}>
                      <div className="color-name-input">
                        <input
                          type="text"
                          value={color.name || ''}
                          onChange={e => handleColorNameChange(idx, e.target.value)}
                          className="form-control"
                          style={{ width: 'calc(100% - 12px) !important' }}
                          placeholder="Color name"
                        />
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <input
                          type="color"
                          value={color.hex || '#000000'}
                          onChange={e => handleColorChange(idx, e.target.value)}
                          style={{ cursor: 'pointer', width: 80, height: 40, border: '1px solid #eee', borderRadius: '0 !important', background: 'none', marginTop: -10, marginRight: 5 }}
                        />
                        <input
                          type="text"
                          value={color.hex || ''}
                          onChange={e => handleHexInput(idx, e.target.value)}
                          className="form-control"
                          style={{ marginRight: 20 }}
                          maxLength={7}
                        />
                      </div>
                      <div style={{ fontSize: '0.95em', color: '#555' }}>
                        <input
                          type="text"
                          value={`RGB: ${color.rgb?.r ?? ''}, ${color.rgb?.g ?? ''}, ${color.rgb?.b ?? ''}`}
                          className="form-control mb-1"
                          disabled
                        />
                        <input
                          type="text"
                          value={`CMYK: ${color.cmyk?.c ?? ''}, ${color.cmyk?.m ?? ''}, ${color.cmyk?.y ?? ''}, ${color.cmyk?.k ?? ''}`}
                          className="form-control"
                          disabled
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Typography Section: Primary and Secondary Font Uploaders */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Typography</h5>
              
              {/* Primary Font */}
              <div className="mb-4">
                <label className="form-label">Primary Font</label>
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={(e) => handleImageUpload(e, 'primaryFont')}
                  className="form-control"
                />
                {errors.primaryFont && (
                  <div className="text-danger mt-2">{errors.primaryFont}</div>
                )}
                {formData.primaryFontMetadata && (
                  <div className="mt-3 p-3 border rounded">
                    <h6 className="mb-3">Font Details</h6>
                    <p><strong>Full Name:</strong> {formData.primaryFontMetadata.fullName}</p>
                  </div>
                )}
                {previews.primaryFont && (
                  <div className="mt-3">
                    <p className="mb-2">Preview:</p>
                    <img 
                      src={previews.primaryFont} 
                      alt="Primary Font preview" 
                      className="img-fluid"
                      style={{ maxWidth: '100%', background: '#fff' }}
                    />
                  </div>
                )}
              </div>

              {/* Secondary Font */}
              <div className="mb-3">
                <label className="form-label">Secondary Font</label>
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={(e) => handleImageUpload(e, 'secondaryFont')}
                  className="form-control"
                />
                {errors.secondaryFont && (
                  <div className="text-danger mt-2">{errors.secondaryFont}</div>
                )}
                {formData.secondaryFontMetadata && (
                  <div className="mt-3 p-3 border rounded">
                    <h6 className="mb-3">Font Details</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>{formData.secondaryFontMetadata.familyName}</strong></p>
                        <p>{formData.secondaryFontMetadata.subFamilyName}</p>
                      </div>
                    </div>
                  </div>
                )}
                {previews.secondaryFont && (
                  <div className="mt-3">
                    <p className="mb-2">Preview:</p>
                    <img 
                      src={previews.secondaryFont} 
                      alt="Secondary Font preview" 
                      className="img-fluid"
                      style={{ maxWidth: '100%', background: '#fff' }}
                    />
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
              className="btn btn-secondary mr-2"
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