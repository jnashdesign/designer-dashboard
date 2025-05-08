import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="welcome-container">
      <h1>Welcome to BrandEZ</h1>
      <p className="lead">
        Streamline your brand asset management and client collaboration
      </p>
      <button onClick={() => navigate('/dashboard')}>Enter Dashboard</button>
    </div>
  );
}