import React from 'react';

export default function GroupList({ groups, setGroups }) {
  return (
    <div style={{ marginTop: '2rem' }}>
      {groups.map((group, index) => (
        <div key={group.id}>{group.name || 'Unnamed Group'}</div>
      ))}
    </div>
  );
}