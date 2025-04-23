import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveWizardAnswers } from '../../firebase/saveWizardAnswers';
import { storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function DynamicWizard() {
  const { type, projectId } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    fetch('/wizardQuestions.json')
      .then(res => res.json())
      .then(data => {
        if (data[type]) {
          setSections(data[type]);
        } else {
          console.warn("No sections found for this type");
        }
      });
  }, [type]);

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

  if (!sections.length) return <p>Loading questions...</p>;
  if (sectionIndex >= sections.length) {
    return (
      <div>
        <h2>Review Your Answers</h2>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
        <button onClick={async () => {
          try {
            await saveWizardAnswers(projectId, formData, type);
            alert('Submission saved!');
            navigate('/dashboard');
          } catch (err) {
            alert('Failed to save submission.');
          }
        }}>Submit</button>
      </div>
    );
  }

  const section = sections[sectionIndex];

  return (
    <div className="container">
      <h2>{section.title}</h2>
      {section.questions.map((q) => (
        <div key={q.name} style={{ marginBottom: '1rem' }}>
          <label>{q.label}</label>
          {q.type === 'imageUpload' ? (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ marginTop: '0.5rem' }}>
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
              <input
                key={idx}
                placeholder={`Example link ${idx + 1}`}
                value={(formData[q.name] && formData[q.name][idx]) || ''}
                onChange={e => {
                  const updatedList = [...(formData[q.name] || [])];
                  updatedList[idx] = e.target.value;
                  setFormData(prev => ({ ...prev, [q.name]: updatedList }));
                }}
                style={{ display: 'block', marginTop: '0.5rem' }}
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
      <div>
        {sectionIndex > 0 && (
          <button onClick={() => setSectionIndex(sectionIndex - 1)}>Back</button>
        )}
        <button onClick={() => setSectionIndex(sectionIndex + 1)}>Next</button>
      </div>
    </div>
  );
}