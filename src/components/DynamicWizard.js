import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { saveCreativeBrief } from '../firebase/saveCreativeBrief';

export default function DynamicWizard({ initialQuestions }) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const { type } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');

  const groups = groupQuestions(initialQuestions);

  function groupQuestions(questions) {
    if (!Array.isArray(questions)) return [];
    if (questions.length && questions[0].questions) {
      return questions;
    } else {
      return [{ groupName: "General Questions", questions }];
    }
  }

  const currentGroup = groups[currentGroupIndex];

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!projectId) {
        throw new Error("Project ID missing.");
      }
      await saveCreativeBrief(projectId, type, answers);
      alert('Brief submitted successfully!');
    } catch (err) {
      console.error("Error submitting brief:", err);
      alert('Error submitting. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>{currentGroup.groupName}</h2>

      {currentGroup.questions.map((q) => (
        <div key={q.id} style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {q.text}
          </label>
          <input
            type="text"
            value={answers[q.id] || ''}
            onChange={(e) => handleInputChange(q.id, e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        {currentGroupIndex > 0 && (
          <button onClick={handleBack} style={navButtonStyle}>
            ← Back
          </button>
        )}
        <button onClick={handleNext} style={navButtonStyle}>
          {currentGroupIndex === groups.length - 1 ? 'Submit' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

const navButtonStyle = {
  padding: '0.75rem 2rem',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem'
};