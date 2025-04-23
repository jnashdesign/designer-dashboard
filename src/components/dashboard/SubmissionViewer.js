import React, { useState } from 'react';
import { doc, getDocs, query, where, collection, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function SubmissionViewer({ answers, projectId }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(answers || {});

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const q = query(
        collection(db, 'creativeBriefs'),
        where('projectId', '==', doc(db, 'projects', projectId))
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(db, 'creativeBriefs', docId), {
          answers: formData,
        });
        alert('Updated successfully!');
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update.');
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>Submitted Answers</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Field</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Answer</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(formData).map(([key, value]) => (
            <tr key={key}>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                <strong style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                {editing ? (
                  <input
                    style={{ width: '100%' }}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing ? (
        <button onClick={handleSave}>Save</button>
      ) : (
        <button onClick={() => setEditing(true)}>Edit</button>
      )}
    </div>
  );
}
