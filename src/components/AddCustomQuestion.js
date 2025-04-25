import React, { useState } from 'react';

export default function AddCustomQuestion({ addQuestion }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      addQuestion(input.trim());
      setInput('');
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Add a Custom Question</h3>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your question"
        style={{ width: '80%', marginRight: '1rem' }}
      />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}