import React, { useState } from 'react';
import '../../bootstrap.min.css';

export default function SubmissionViewer({ answers, projectId, briefId }) {
  const [editing, setEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState(answers || {});

  const handleFieldChange = (key, value) => {
    setEditedAnswers(prev => ({ ...prev, [key]: value }));
  };

  console.log('Edited Answers:', editedAnswers);

  const handleSave = () => {
    // Hook up saving logic here
    setEditing(false);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(editedAnswers).map(([key, value]) => (

            <tr key={key}>
              <td>{key}</td>
              <td>
                {editing ? (
                  <input
                    value={typeof value === 'string' ? value : JSON.stringify(value)}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                  />
                ) : Array.isArray(value) ? (
                  value.map((item, i) => (
                    <div key={i}>
                      {typeof item === 'string' &&
                      item.startsWith('https://firebasestorage.googleapis.com') &&
                      /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/.test(item) ? (
                        <img src={item} alt={`img-${i}`} style={{ maxWidth: '100px', margin: '0.5rem 0' }} />
                      ) : (
                        <span>{item}</span>
                      )}
                    </div>
                  ))
                ) : typeof value === 'string' &&
                  value.startsWith('https://firebasestorage.googleapis.com') &&
                  /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/.test(value) ? (
                  <img src={value} alt={key} style={{ maxWidth: '100px' }} />
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem' }}>
        {editing ? (
          <button onClick={handleSave}>Save</button>
        ) : (
          <button onClick={() => setEditing(true)}>Edit</button>
        )}
      </div>
    </div>
  );
}