import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

export default function QuestionItem({ question, index, onChange }) {
  return (
    <Draggable draggableId={question.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            padding: '0.5rem',
            marginBottom: '0.5rem',
            background: '#f9f9f9',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            ...provided.draggableProps.style
          }}
        >
          <input
            type="text"
            value={question.text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter question"
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
      )}
    </Draggable>
  );
}