import React from 'react';

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={containerStyle}>
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{message}</p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 5px solid var(--border-color);
            border-top-color: #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '50vh',
  textAlign: 'center'
};