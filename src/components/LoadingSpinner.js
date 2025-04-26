import React from 'react';

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <p style={{ marginTop: '1rem', color: '#555', fontSize: '1.1rem' }}>{message}</p>
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

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '5px solid #ccc',
  borderTopColor: '#007bff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

// Inject simple keyframes animation
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
}