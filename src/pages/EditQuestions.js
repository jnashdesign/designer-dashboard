import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import GroupList from '../components/GroupList';
import AddGroupButton from '../components/AddGroupButton';
import SaveTemplateModal from '../components/SaveTemplateModal';
import { saveTemplateToFirestore } from '../firebase/saveTemplate';

export default function EditQuestions() {
  const [groups, setGroups] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDragEnd = (result) => { /* unchanged for now */ };

  const addGroup = (groupName) => {
    const newGroup = { id: Date.now().toString(), groupName, questions: [] };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleSaveTemplate = async (name) => {
    try {
      setSaving(true);
      const templateData = {
        name,
        type: "branding", // temporary hardcode, can be extended later for website/app
        groups,
        createdAt: new Date()
      };
      await saveTemplateToFirestore(templateData);
      alert('Template saved successfully!');
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Failed to save template.');
    } finally {
      setSaving(false);
      setShowSaveModal(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Edit Grouped Questionnaire</h2>

      <AddGroupButton addGroup={addGroup} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <GroupList groups={groups} setGroups={setGroups} />
      </DragDropContext>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setShowSaveModal(true)} disabled={saving}>
          {saving ? 'Saving...' : 'Save As Template'}
        </button>
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