import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadTemplatesByType } from '../firebase/loadTemplates';
import { auth } from '../firebase/config';

export default function TemplateChooser() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { type } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            const loaded = await loadTemplatesByType(type);
            setTemplates(loaded);
          }
          setLoading(false);
          unsubscribe();
        });
      } catch (err) {
        console.error('Error loading templates:', err);
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [type]);

  const handleContinue = () => {
    if (selectedTemplateId) {
      navigate(`/start-project/${type}/${selectedTemplateId}?projectId=${projectId}`);
    } else {
      alert("Please select a template to continue.");
    }
  };

  const handleStartWithDefault = () => {
    navigate(`/start-project/${type}/default?projectId=${projectId}`);
  };

  if (loading) return <p>Loading templates...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Choose a {type.charAt(0).toUpperCase() + type.slice(1)} Template</h2>

      {templates.length === 0 ? (
        <div style={{ marginBottom: '2rem' }}>
          <p>No templates found. You can start with a default brief.</p>
        </div>
      ) : (
        <>
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

          <button
            onClick={handleContinue}
            disabled={!selectedTemplateId}
            style={{
              padding: '1rem 2rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedTemplateId ? 'pointer' : 'not-allowed',
              marginBottom: '2rem'
            }}
          >
            Continue With Selected Template
          </button>
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleStartWithDefault}
          style={{
            padding: '1rem 2rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Start With Default Brief
        </button>
      </div>
    </div>
  );
}