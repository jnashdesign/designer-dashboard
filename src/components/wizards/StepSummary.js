import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveWizardAnswers } from '../../firebase/saveWizardAnswers';

export default function StepSummary({ formData }) {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleSubmit = async () => {
    if (!projectId) {
      alert("No project ID found.");
      return;
    }

    try {
      await saveWizardAnswers(projectId, formData);
      alert("Thanks! We'll review your answers and follow up soon.");
      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving submission:", err);
      alert("Something went wrong saving your answers.");
    }
  };

  return (
    <div className="container">
      <h2>Review Your Answers</h2>
      <pre style={{ background: '#f9f9f9', padding: '1rem' }}>
        {JSON.stringify(formData, null, 2)}
      </pre>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}