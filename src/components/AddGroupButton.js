import React, { useState } from 'react';

export default function AddGroupButton({ addGroup }) {
  const [groupName, setGroupName] = useState('');

  const handleAdd = () => {
    if (groupName.trim()) {
      addGroup(groupName.trim());
      setGroupName('');
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="New Group Name"
        style={{ marginRight: '1rem' }}
      />
      <button onClick={handleAdd}>Add Group</button>
    </div>
  );
}