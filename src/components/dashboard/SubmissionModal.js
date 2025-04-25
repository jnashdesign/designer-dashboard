import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import './SubmissionModal.css';

export default function SubmissionModal({ isOpen, onClose, brief }) {
  const [editedAnswers, setEditedAnswers] = useState({});
  const [originalAnswers, setOriginalAnswers] = useState({});
  const [editing, setEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    if (brief?.answers) {
      setEditedAnswers(brief.answers);
      setOriginalAnswers(brief.answers);
      setEditing(false);
      setShowConfirmClose(false);
    }
  }, [brief]);

  if (!isOpen || !brief) return null;

  const handleSave = async () => {
    try {
      const briefRef = doc(db, 'creativeBriefs', brief.id);
      await updateDoc(briefRef, { answers: editedAnswers });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Failed to update brief:", err);
      alert('Error saving changes.');
    }
  };

  const handleFieldChange = (key, value) => {
    setEditedAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRequestClose = () => {
    if (JSON.stringify(editedAnswers) !== JSON.stringify(originalAnswers)) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmSaveAndExit = async () => {
    await handleSave();
  };

  const confirmDiscardAndExit = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{brief.type} Brief – {brief.createdAt?.seconds ? new Date(brief.createdAt.seconds * 1000).toLocaleDateString() : ''}</h2>
        <div style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '1em' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Field</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Answer</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(editedAnswers).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ padding: '8px', verticalAlign: 'top' }}>{key}</td>
                  <td style={{ padding: '8px' }}>
                    {editing ? (
                      typeof value === 'string' ? (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          style={{ width: '100%' }}
                        />
                      ) : Array.isArray(value) ? (
                        value.map((item, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newArray = [...value];
                              newArray[idx] = e.target.value;
                              handleFieldChange(key, newArray);
                            }}
                            style={{ width: '100%', marginTop: '0.5rem' }}
                          />
                        ))
                      ) : (
                        <textarea
                          value={JSON.stringify(value, null, 2)}
                          onChange={(e) => handleFieldChange(key, JSON.parse(e.target.value))}
                          rows="2"
                          style={{ width: '100%' }}
                        />
                      )
                    ) : (
                      typeof value === 'string' ? value : JSON.stringify(value)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {editing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}
          <button onClick={handleRequestClose} style={{ marginLeft: '1rem' }}>Close</button>
        </div>
      </div>

      {showConfirmClose && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes. What would you like to do?</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
              <button onClick={confirmSaveAndExit}>Save & Exit</button>
              <button onClick={confirmDiscardAndExit}>Discard Changes</button>
              <button onClick={() => setShowConfirmClose(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast">✅ Changes saved successfully!</div>
      )}
    </div>
  );
}