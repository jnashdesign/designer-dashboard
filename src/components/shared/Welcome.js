import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1>Welcome to BrandEZ</h1>
      <p>Your guided path to better brand, web, or app design discovery.</p>
      <button onClick={() => navigate('/dashboard')}>Enter Dashboard</button>
    </div>
  );
}