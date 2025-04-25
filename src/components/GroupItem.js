import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import QuestionItem from './QuestionItem';

export default function GroupItem({ group, index, setGroups }) {
  const [groupName, setGroupName] = useState(group.groupName);

  const addQuestion = () => {
    const newQuestion = { id: Date.now().toString(), text: '' };
    setGroups(prev => 
      prev.map(g => 
        g.id === group.id
          ? { ...g, questions: [...g.questions, newQuestion] }
          : g
      )
    );
  };

  const handleGroupNameChange = (e) => {
    const newName = e.target.value;
    setGroupName(newName);
    setGroups(prev => 
      prev.map(g => 
        g.id === group.id
          ? { ...g, groupName: newName }
          : g
      )
    );
  };

  const handleQuestionChange = (questionId, newText) => {
    setGroups(prev => 
      prev.map(g => {
        if (g.id === group.id) {
          const updatedQuestions = g.questions.map(q =>
            q.id === questionId ? { ...q, text: newText } : q
          );
          return { ...g, questions: updatedQuestions };
        }
        return g;
      })
    );
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
