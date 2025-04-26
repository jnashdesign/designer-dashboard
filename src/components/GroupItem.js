import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import QuestionItem from './QuestionItem';

export default function GroupItem({ group, index, setGroups }) {
  const [groupName, setGroupName] = useState(group.groupName);

  const addQuestion = () => {
    const newQuestion = { id: Date.now().toString(), text: '' };
    setGroups(prev => {
      const updated = [...prev];
      const targetGroup = updated.find(g => g.id === group.id);
      targetGroup.questions.push(newQuestion);
      return updated;
    });
  };

  const handleGroupNameChange = (e) => {
    const newName = e.target.value;
    setGroupName(newName);
    setGroups(prev => {
      const updated = [...prev];
      const targetGroup = updated.find(g => g.id === group.id);
      targetGroup.groupName = newName;
      return updated;
    });
  };

  const handleQuestionChange = (questionId, newText) => {
    setGroups(prev => {
      const updated = [...prev];
      const targetGroup = updated.find(g => g.id === group.id);
      const targetQuestion = targetGroup.questions.find(q => q.id === questionId);
      targetQuestion.text = newText;
      return updated;
    });
  };

  return (
    <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <input
        type="text"
        value={groupName}
        onChange={handleGroupNameChange}
        style={{ fontSize: '1.2rem', marginBottom: '1rem', width: '100%' }}
      />

      <Droppable droppableId={group.id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {group.questions.map((question, idx) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={idx}
                onChange={(newText) => handleQuestionChange(question.id, newText)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button style={{ marginTop: '1rem' }} onClick={addQuestion}>+ Add Question</button>
    </div>
  );
}