import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { saveWizardAnswers } from '../../firebase/saveWizardAnswers';
import { storage, db, auth } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { defaultQuestions } from '../../data/defaultQuestions';

export default function DynamicWizard() {
  const { type, templateId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const clientId = searchParams.get('clientId');
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      let groups = [];
      try {
        if (templateId === 'default' || !templateId) {
          groups = defaultQuestions;
          console.log('Loaded default questions:', groups);
        } else {
          const user = auth.currentUser;
          if (!user) throw new Error("No authenticated user found.");
          const templateRef = doc(db, "users", user.uid, "questionnaireTemplates", templateId);
          const templateSnap = await getDoc(templateRef);
          if (templateSnap.exists()) {
            const templateData = templateSnap.data();
            groups = templateData.groups || [];
            console.log('Loaded custom template groups:', groups);
          } else {
            throw new Error('Template not found, falling back to default questions.');
          }
        }
        if (!Array.isArray(groups) || groups.length === 0) {
          throw new Error('No groups found in template.');
        }
        // Map each group to a section
        const wizardSections = groups.map(group => ({
          title: group.name || 'Untitled Group',
          questions: (group.questions || []).map(q => ({
            name: q.id || `q-${Date.now()}`,
            label: q.text || 'Unnamed Question',
            type: q.type || 'text'
          }))
        })).filter(section => section.questions.length > 0);
        setSections(wizardSections);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err.message);
        // Fallback to defaultQuestions
        const fallbackSections = (defaultQuestions || []).map(group => ({
          title: group.name || 'Untitled Group',
          questions: (group.questions || []).map(q => ({
            name: q.id || `q-${Date.now()}`,
            label: q.text || 'Unnamed Question',
            type: q.type || 'text'
          }))
        })).filter(section => section.questions.length > 0);
        setSections(fallbackSections);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [type, templateId]);

  const handleImageUpload = async (e, name, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;
    const errors = [];

    if (!validTypes.includes(file.type)) {
      errors.push(`${file.name} is not a valid image type.`);
    } else if (file.size > maxSize) {
      errors.push(`${file.name} exceeds 5MB.`);
    } else {
      try {
        const storageRef = ref(storage, `projects/${projectId}/${name}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        setFormData(prev => {
          const updated = [...(prev[name] || [])];
          updated[index] = url;
          return { ...prev, [name]: updated };
        });

        setImagePreviews(prev => {
          const updated = [...(prev[name] || [])];
          updated[index] = URL.createObjectURL(file);
          return { ...prev, [name]: updated };
        });

      } catch (err) {
        errors.push(`Failed to upload ${file.name}`);
      }
    }

    setUploadErrors(prev => ({ ...prev, [name]: errors }));
  };

  const handleRemoveImage = (name, index) => {
    setFormData(prev => {
      const updated = [...(prev[name] || [])];
      updated[index] = null;
      return { ...prev, [name]: updated };
    });

    setImagePreviews(prev => {
      const updated = [...(prev[name] || [])];
      updated[index] = null;
      return { ...prev, [name]: updated };
    });
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel? Your progress will be lost.');
    if (confirmCancel) {
      navigate('/dashboard');
    }
  };

  const handleComplete = async () => {
    // ... save brief data
    
    if (type === 'branding') {
      return (
        <div className="completion-actions">
          <h4>What's Next?</h4>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/project/${projectId}/assets/upload`)}
          >
            Upload Brand Assets
          </button>
        </div>
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Questions</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="no-questions">
        <h2>No Questions Available</h2>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (sectionIndex >= sections.length) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Brief Review
        </h2>
        <p style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>
          Please review your answers before submitting
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(formData).map(([questionId, answer]) => {
            // Find the question text from sections
            const question = sections.flatMap(s => s.questions).find(q => q.name === questionId);
            
            if (Array.isArray(answer)) {
              // Handle array type answers (like image URLs or text lists)
              return (
                <div key={questionId} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    Q: {question?.label || "Unknown Question"}
                  </p>
                  <div style={{ marginLeft: '1rem' }}>
                    {answer.map((item, index) => (
                      <div key={index} style={{ marginBottom: '0.5rem' }}>
                        {question?.type === 'imageUpload' && item ? (
                          <img src={item} alt={`Upload ${index + 1}`} style={{ maxWidth: '80px', marginTop: '0.5rem' }} />
                        ) : (
                          <p style={{ color: item ? '#333' : '#888', fontStyle: item ? 'normal' : 'italic' }}>
                            {item || '(No answer provided)'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={questionId} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  Q: {question?.label || "Unknown Question"}
                </p>
                <p style={{ 
                  marginLeft: '1rem', 
                  color: answer ? '#333' : '#888', 
                  fontStyle: answer ? 'normal' : 'italic' 
                }}>
                  {answer || '(No answer provided)'}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            onClick={handleCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              try {
                await saveWizardAnswers(projectId, formData, type, clientId);
                alert('Submission saved!');
                navigate('/dashboard');
              } catch (err) {
                alert('Failed to save submission.');
              }
            }}
            className="primary"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  const section = sections[sectionIndex];

  return (
    <div className="container">
      <h2>{section.title}</h2>
      {section.questions.map((q) => (
        <div key={q.name}>
          <label>{q.label}</label>
          {q.type === 'imageUpload' ? (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, q.name, i)}
                  />
                  {imagePreviews[q.name]?.[i] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                      <img src={imagePreviews[q.name][i]} alt="preview" width="80" />
                      <button type="button" onClick={() => handleRemoveImage(q.name, i)}>Remove</button>
                    </div>
                  )}
                </div>
              ))}
              {uploadErrors[q.name]?.length > 0 && (
                <ul style={{ color: 'red' }}>
                  {uploadErrors[q.name].map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </>
          ) : q.type === 'textarea' ? (
            <textarea
              value={formData[q.name] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [q.name]: e.target.value }))}
            />
          ) : q.type === 'textList' ? (
            [...Array(3)].map((_, idx) => (
              <input type="text"
                key={idx}
                className="col-8"
                placeholder={`Example link ${idx + 1}`}
                value={(formData[q.name] && formData[q.name][idx]) || ''}
                onChange={e => {
                  const updatedList = [...(formData[q.name] || [])];
                  updatedList[idx] = e.target.value;
                  setFormData(prev => ({ ...prev, [q.name]: updatedList }));
                }}
              />
            ))
          ) : (
            <input
              type={q.type}
              value={formData[q.name] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [q.name]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button 
          onClick={handleCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        {sectionIndex > 0 && (
          <button onClick={() => setSectionIndex(sectionIndex - 1)} className="btn-primary">Back</button>
        )}
        <button onClick={() => setSectionIndex(sectionIndex + 1)} className="btn-primary">Next</button>
      </div>
    </div>
  );
}