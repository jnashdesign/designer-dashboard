import React from 'react';
import { createPortal } from 'react-dom';
import '../../bootstrap.min.css';

export default function SubmissionModal({ isOpen, onClose, brief }) {
  if (!isOpen || !brief) return null;

  const { answers, type, createdAt } = brief;

  return createPortal(
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>×</button>
        <h2 style={{ marginBottom: '0.5rem' }}>{type?.charAt(0).toUpperCase() + type?.slice(1)} Brief</h2>
        <p style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>
          Created: {createdAt?.toDate?.().toLocaleDateString()}
        </p>

        {answers ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(answers).map(([qid, answerObj]) => (
              <div key={qid} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  Q: {answerObj?.questionText || "Unknown Question"}
                </p>
                <p style={{ marginLeft: '1rem', color: answerObj?.answerText ? '#333' : '#888', fontStyle: answerObj?.answerText ? 'normal' : 'italic' }}>
                  {answerObj?.answerText || '(No answer provided)'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No answers available.</p>
        )}
      </div>
    </div>,
    document.body
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '12px',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#333'
};