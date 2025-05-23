import React from 'react';
import './FullPageSpinner.css';

export default function FullPageSpinner({ message }) {
  return (
    <div className="fullpage-spinner-overlay">
      <div className="fullpage-spinner-content">
        <div className="spinner"></div>
        {message && <div className="spinner-message">{message}</div>}
      </div>
    </div>
  );
} 