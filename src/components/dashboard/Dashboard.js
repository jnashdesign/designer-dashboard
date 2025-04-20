import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h2>Designer Dashboard</h2>
      <button onClick={() => navigate('/onboarding/branding')}>Start Branding Wizard</button>
    </div>
  );
}