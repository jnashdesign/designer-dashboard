import React, { useState } from 'react';

export default function SaveTemplateModal({ onSave, onClose }) {
  const [templateName, setTemplateName] = useState('');

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Name Your Questionnaire Template</h3>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Ex: Modern Brand Discovery"
          style={{ width: '80%', margin: '1rem 0' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSave} className='btn btn-primary'>Save Template</button>
          <button className='btn btn-secondary' onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}