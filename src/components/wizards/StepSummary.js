import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveWizardAnswers } from '../../firebase/saveWizardAnswers';

export default function StepSummary({ formData }) {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleSubmit = async () => {
    try {
      await saveWizardAnswers(projectId, formData);
      alert("Submission saved!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Submission failed.");
    }
  };

  return (
    <div className="container">
      <h2>Review & Submit</h2>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}