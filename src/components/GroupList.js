import React from 'react';
import GroupItem from './GroupItem';

export default function GroupList({ groups, setGroups }) {
  return (
    <div style={{ marginTop: '2rem' }}>
      {groups.map((group, index) => (
        <GroupItem key={group.id} group={group} index={index} setGroups={setGroups} />
      ))}
    </div>
  );
}