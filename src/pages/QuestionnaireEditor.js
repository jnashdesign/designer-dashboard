import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import GroupList from '../components/GroupList';
import AddGroupButton from '../components/AddGroupButton';
import SaveTemplateModal from '../components/SaveTemplateModal';
import { saveTemplateToFirestore } from '../firebase/saveTemplate';
import { defaultQuestions } from '../data/defaultQuestions';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export default function QuestionnaireEditor() {
  const [groups, setGroups] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { templateId, type } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (templateId === 'default') {
          setGroups([{
            id: 'default-group',
            groupName: 'Default Questions',
            questions: defaultQuestions
          }]);
        } else {
          const user = auth.currentUser;
          if (!user) throw new Error("No authenticated user found.");
          
          const templateRef = doc(db, "users", user.uid, "questionnaireTemplates", templateId);
          const templateSnap = await getDoc(templateRef);
          
          if (templateSnap.exists()) {
            const templateData = templateSnap.data();
            setGroups(templateData.groups || []);
          } else {
            console.error("Template not found");
            // Optionally redirect or show error
          }
        }
      } catch (error) {
        console.error("Error loading template:", error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  if (loading) {
    return <div>Loading template...</div>;
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newGroups = [...groups];

    // Handle dragging between groups
    if (source.droppableId !== destination.droppableId) {
      const sourceGroup = newGroups.find(g => g.id === source.droppableId);
      const destGroup = newGroups.find(g => g.id === destination.droppableId);
      
      const [movedQuestion] = sourceGroup.questions.splice(source.index, 1);
      destGroup.questions.splice(destination.index, 0, movedQuestion);
    } 
    // Handle dragging within the same group
    else {
      const group = newGroups.find(g => g.id === source.droppableId);
      const [movedQuestion] = group.questions.splice(source.index, 1);
      group.questions.splice(destination.index, 0, movedQuestion);
    }

    setGroups(newGroups);
  };

  const addGroup = (groupName) => {
    const newGroup = { id: Date.now().toString(), groupName, questions: [] };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleSaveTemplate = async (name) => {
    try {
      setSaving(true);
      const templateData = {
        name,
        type: "branding",
        groups,
        createdAt: new Date(),
        projectId
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

  const handleCancel = () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.');
    if (confirmCancel) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Edit Questionnaire</h2>

      <AddGroupButton addGroup={addGroup} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <GroupList groups={groups} setGroups={setGroups} />
      </DragDropContext>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button 
          onClick={handleCancel}
          style={{
            padding: '0.75rem 2rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button onClick={() => setShowSaveModal(true)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Template'}
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