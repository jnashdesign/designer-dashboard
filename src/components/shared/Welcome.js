import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/brandEZ_logo_vert.png';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="main-container">
      <div className="dashboard-container" style={{textAlign: 'center'}}>
        <img style={{display: 'block', margin: '0 auto', width: '300px'}} src={logo} alt="BrandEZ Logo" />
        <p className="lead mt-3 mb-3">
        Streamline your brand asset management and client collaboration
      </p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-3">Go To Dashboard</button>
    </div>
    </div>
  );
}