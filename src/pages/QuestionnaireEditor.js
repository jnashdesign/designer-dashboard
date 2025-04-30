import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useParams, useNavigate } from 'react-router-dom';
import { defaultQuestions } from '../data/defaultQuestions';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const QuestionGroup = React.memo(({ group, groupIndex, onQuestionChange, onQuestionDelete, onGroupNameChange, isExpanded, onToggleExpand }) => {
  return (
    <Draggable draggableId={group.id} index={groupIndex}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="card mb-3"
        >
          <div 
            className="card-header d-flex justify-content-between align-items-center"
            {...provided.dragHandleProps}
          >
            <div className="d-flex align-items-center">
              <button
                className="btn btn-link p-0 me-2"
                onClick={() => onToggleExpand(group.id)}
                title={isExpanded ? "Collapse group" : "Expand group"}
              >
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
              </button>
              <input
                type="text"
                value={group.name}
                onChange={(e) => onGroupNameChange(groupIndex, e.target.value)}
                className="form-control w-auto"
                placeholder="Group Name"
              />
            </div>
            <span className="text-muted">
              {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Droppable droppableId={group.id} type="question">
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className={`card-body ${isExpanded ? '' : 'd-none'}`}
              >
                {group.questions.map((question, index) => (
                  <Draggable key={question.id} draggableId={question.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-3 mb-2 rounded d-flex align-items-center bg-white border"
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="me-3"
                        >
                          ⋮⋮
                        </div>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => onQuestionChange(groupIndex, index, e.target.value)}
                          className="form-control"
                        />
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this question?')) {
                              onQuestionDelete(groupIndex, index);
                            }
                          }}
                          className="btn btn-outline-danger ms-2 delete-question"
                          type="button"
                          title="Delete question"
                        >
                          x
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
});

export default function QuestionnaireEditor() {
  const [groups, setGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const { templateId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (templateId === 'default') {
          const initialGroup = {
            id: 'group-1',
            name: 'Default Questions',
            questions: defaultQuestions.map((q, index) => ({
              ...q,
              id: `question-${index}`
            }))
          };
          setGroups([initialGroup]);
          // Expand the default group
          setExpandedGroups(new Set(['group-1']));
        } else {
          const user = auth.currentUser;
          const templateRef = doc(db, "users", user.uid, "questionnaireTemplates", templateId);
          const templateSnap = await getDoc(templateRef);
          
          if (templateSnap.exists()) {
            const templateData = templateSnap.data();
            setGroups(templateData.groups || []);
          }
        }
      } catch (error) {
        console.error("Error loading template:", error);
      }
    };

    loadTemplate();
  }, [templateId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const saveTemplateId = templateId === 'default' ? `template-${Date.now()}` : templateId;
      const templateRef = doc(db, "users", user.uid, "questionnaireTemplates", saveTemplateId);
      
      await setDoc(templateRef, {
        groups,
        updatedAt: new Date(),
        type: 'branding',
      }, { merge: true });

      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "group") {
      // Reorder groups
      const reorderedGroups = Array.from(groups);
      const [removed] = reorderedGroups.splice(source.index, 1);
      reorderedGroups.splice(destination.index, 0, removed);
      setGroups(reorderedGroups);
      return;
    }

    // Moving questions within or between groups
    const sourceGroup = groups.find(g => g.id === source.droppableId);
    const destGroup = groups.find(g => g.id === destination.droppableId);

    const newGroups = [...groups];
    const sourceGroupIndex = groups.findIndex(g => g.id === source.droppableId);
    const destGroupIndex = groups.findIndex(g => g.id === destination.droppableId);

    if (source.droppableId === destination.droppableId) {
      // Moving within the same group
      const newQuestions = Array.from(sourceGroup.questions);
      const [removed] = newQuestions.splice(source.index, 1);
      newQuestions.splice(destination.index, 0, removed);
      newGroups[sourceGroupIndex].questions = newQuestions;
    } else {
      // Moving between groups
      const sourceQuestions = Array.from(sourceGroup.questions);
      const destQuestions = Array.from(destGroup.questions);
      const [removed] = sourceQuestions.splice(source.index, 1);
      destQuestions.splice(destination.index, 0, removed);
      newGroups[sourceGroupIndex].questions = sourceQuestions;
      newGroups[destGroupIndex].questions = destQuestions;
    }

    setGroups(newGroups);
  };

  const handleQuestionChange = (groupIndex, questionIndex, newText) => {
    const newGroups = [...groups];
    newGroups[groupIndex].questions[questionIndex].text = newText;
    setGroups(newGroups);
  };

  const handleQuestionDelete = (groupIndex, questionIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].questions.splice(questionIndex, 1);
    setGroups(newGroups);
  };

  const handleGroupNameChange = (groupIndex, newName) => {
    const newGroups = [...groups];
    newGroups[groupIndex].name = newName;
    setGroups(newGroups);
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return newExpanded;
    });
  };

  const addGroup = () => {
    const newGroupId = `group-${Date.now()}`;
    const newGroup = {
      id: newGroupId,
      name: 'New Group',
      questions: []
    };
    setGroups([...groups, newGroup]);
    // Auto-expand new groups
    setExpandedGroups(prev => new Set([...prev, newGroupId]));
  };

  const addQuestion = (groupIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].questions.push({
      id: `question-${Date.now()}`,
      text: "New Question"
    });
    setGroups(newGroups);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Questions</h2>
        <div>
          <button 
            className="btn btn-secondary mr-3"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="groups" type="group">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {groups.map((group, index) => (
                <div key={group.id} className="mb-4">
                  <QuestionGroup
                    group={group}
                    groupIndex={index}
                    onQuestionChange={handleQuestionChange}
                    onQuestionDelete={handleQuestionDelete}
                    onGroupNameChange={handleGroupNameChange}
                    isExpanded={expandedGroups.has(group.id)}
                    onToggleExpand={toggleGroup}
                  />
                  <button
                    className={`btn btn-outline-primary btn-sm mt-2 ${expandedGroups.has(group.id) ? '' : 'd-none'}`}
                    onClick={() => addQuestion(index)}
                  >
                    Add Question to Group
                  </button>
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-4">
        <button 
          className="btn btn-primary"
          onClick={addGroup}
        >
          Add New Group
        </button>
      </div>
    </div>
  );
} 