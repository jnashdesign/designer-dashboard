import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import GroupList from '../components/GroupList';
import AddGroupButton from '../components/AddGroupButton';
import SaveTemplateModal from '../components/SaveTemplateModal';

export default function EditQuestions() {
  const [groups, setGroups] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;

    if (sourceId === destinationId) {
      const groupIndex = groups.findIndex((g) => g.id === sourceId);
      const updatedQuestions = Array.from(groups[groupIndex].questions);
      const [moved] = updatedQuestions.splice(result.source.index, 1);
      updatedQuestions.splice(result.destination.index, 0, moved);
      const updatedGroups = [...groups];
      updatedGroups[groupIndex].questions = updatedQuestions;
      setGroups(updatedGroups);
    } else {
      const sourceGroupIndex = groups.findIndex((g) => g.id === sourceId);
      const destinationGroupIndex = groups.findIndex((g) => g.id === destinationId);
      const sourceQuestions = Array.from(groups[sourceGroupIndex].questions);
      const destinationQuestions = Array.from(groups[destinationGroupIndex].questions);
      const [moved] = sourceQuestions.splice(result.source.index, 1);
      destinationQuestions.splice(result.destination.index, 0, moved);
      const updatedGroups = [...groups];
      updatedGroups[sourceGroupIndex].questions = sourceQuestions;
      updatedGroups[destinationGroupIndex].questions = destinationQuestions;
      setGroups(updatedGroups);
    }
  };

  const addGroup = (groupName) => {
    const newGroup = { id: Date.now().toString(), groupName, questions: [] };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleSaveTemplate = (name) => {
    const templateData = {
      name,
      groups,
      createdAt: new Date()
    };
    console.log('Saving Template:', templateData);
    alert('TODO: Save template to Firestore!');
    setShowSaveModal(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Edit Grouped Questionnaire</h2>

      <AddGroupButton addGroup={addGroup} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <GroupList groups={groups} setGroups={setGroups} />
      </DragDropContext>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setShowSaveModal(true)}>Save As Template</button>
      </div>

      {showSaveModal && (
        <SaveTemplateModal
          onSave={handleSaveTemplate}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}