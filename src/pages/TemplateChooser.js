import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { defaultQuestions } from '../data/defaultQuestions';
import '../bootstrap.min.css';

export default function TemplateChooser() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const isWizard = searchParams.get('wizard') === 'true';

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");

        // Get user's custom templates
        const templatesRef = collection(db, "users", user.uid, "questionnaireTemplates");
        const q = query(templatesRef, where("type", "==", type));
        const querySnapshot = await getDocs(q);
        
        const loadedTemplates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Add default template
        loadedTemplates.unshift({
          id: 'default',
          name: 'Default Template',
          groups: defaultQuestions
        });

        setTemplates(loadedTemplates);
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [type]);

  const handleContinue = () => {
    if (!selectedTemplateId) return;
    
    if (isWizard) {
      // If we're starting a wizard (creative brief)
      navigate(`/wizard/${type}/${selectedTemplateId}`);
    } else {
      // If we're creating a new template based on selected template
      navigate(`/template/create/${type}?baseTemplate=${selectedTemplateId}`);
    }
  };

  const handleStartWithDefault = () => {
    if (isWizard) {
      navigate(`/wizard/${type}/default`);
    } else {
      // Start with empty default template for the selected type
      navigate(`/template/create/${type}`);
    }
  };

  if (loading) return <p>Loading templates...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>
        {isWizard 
          ? `Choose a ${type.charAt(0).toUpperCase() + type.slice(1)} Template` 
          : `Create New ${type.charAt(0).toUpperCase() + type.slice(1)} Template`
        }
      </h2>

      {templates.length === 0 ? (
        <div style={{ marginBottom: '2rem' }}>
          <p>No templates found. You can start with a default template.</p>
        </div>
      ) : (
        <>
          <div>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1rem' }}
            >
              <option value="">Select a template to start from</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleContinue}
            disabled={!selectedTemplateId}
            className="btn-primary"
          >
            {isWizard ? 'Continue With Selected Template' : 'Use As Starting Point'}
          </button>
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleStartWithDefault}
          className="btn-secondary"
        >
          {isWizard ? 'Start With Default Brief' : 'Start Fresh'}
        </button>
      </div>
    </div>
  );
}