import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function EditQuestionList({ questions, setQuestions }) {
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setQuestions(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <ul {...provided.droppableProps} ref={provided.innerRef} style={{ padding: 0, listStyle: 'none', marginBottom: '2rem' }}>
            {questions.map((q, index) => (
              <Draggable key={q.id} draggableId={q.id} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      background: '#f2f2f2',
                      borderRadius: '6px',
                      cursor: 'grab'
                    }}
                    className='draggable-item'
                  >
                    {q.text}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}