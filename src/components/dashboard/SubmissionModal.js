import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import './SubmissionModal.css';

export default function SubmissionModal({ isOpen, onClose, brief }) {
  const [editing, setEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState(brief?.answers || {});

  if (!isOpen || !brief) return null;

  const handleSave = async () => {
    try {
      const briefRef = doc(db, 'creativeBriefs', brief.id);
      await updateDoc(briefRef, { answers: editedAnswers });
      alert('Brief updated successfully!');
      onClose();
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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{brief.type} Brief – {new Date(brief.createdAt?.seconds * 1000).toLocaleDateString()}</h2>
        <div style={{ maxHeight: '400px', overflowY: 'scroll', backgroundColor: '#f9f9f9', padding: '1em' }}>
          {Object.entries(editedAnswers).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold' }}>{key}</label>
              {editing ? (
                typeof value === 'string' ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    style={{ width: '100%', marginTop: '0.5rem' }}
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
                    rows="3"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  />
                )
              ) : (
                <div style={{ marginTop: '0.5rem' }}>
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          {editing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}
          <button onClick={onClose} style={{ marginLeft: '1rem' }}>Close</button>
        </div>
      </div>
    </div>
  );
}