import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadTemplatesByType } from '../firebase/loadTemplates';

export default function TemplateChooser() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { type } = useParams(); // branding, website, app

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const loaded = await loadTemplatesByType(type);
        setTemplates(loaded);
      } catch (err) {
        console.error('Error loading templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [type]);

  const handleContinue = () => {
    if (selectedTemplateId) {
      navigate(`/start-project/${type}/${selectedTemplateId}`);
    } else {
      alert("Please select a template to continue.");
    }
  };

  if (loading) return <p>Loading templates...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Choose a {type.charAt(0).toUpperCase() + type.slice(1)} Template</h2>

      {templates.length === 0 ? (
        <p>No templates found. You can start with a default brief.</p>
      ) : (
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1rem' }}
        >
          <option value="">Select a template</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleContinue}
        disabled={!selectedTemplateId && templates.length > 0}
        style={{
          padding: '1rem 2rem',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Continue
      </button>
    </div>
  );
}