import React from 'react';
import './SubmissionModal.css';

export default function SubmissionModal({ isOpen, onClose, brief }) {
  if (!isOpen || !brief) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{brief.type} Brief – {new Date(brief.createdAt?.seconds * 1000).toLocaleDateString()}</h2>
        <pre style={{ maxHeight: '400px', overflowY: 'scroll', backgroundColor: '#f9f9f9', padding: '1em' }}>
          {JSON.stringify(brief.answers, null, 2)}
        </pre>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}