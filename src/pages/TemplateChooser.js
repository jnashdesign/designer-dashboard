import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadTemplatesByType } from '../firebase/loadTemplates';
import { auth } from '../firebase/config';
import '../bootstrap.min.css';

export default function TemplateChooser() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { type } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const projectId = searchParams.get('projectId');
  const isWizard = searchParams.get('wizard') === 'true';

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
      if (isWizard) {
        navigate(`/onboarding/${type}/${projectId}/step1?templateId=${selectedTemplateId}`);
      } else {
        navigate(`/template/${selectedTemplateId}/edit?projectId=${projectId}`);
      }
    } else {
      alert("Please select a template to continue.");
    }
  };

  const handleStartWithDefault = () => {
    if (isWizard) {
      navigate(`/onboarding/${type}/${projectId}/step1?templateId=default`);
    } else {
      navigate(`/template/default/edit?projectId=${projectId}`);
    }
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
            className="btn-primary"
          >
            Continue With Selected Template
          </button>
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleStartWithDefault}
          className="btn-secondary"
        >
          Start With Default Brief
        </button>
      </div>
    </div>
  );
}