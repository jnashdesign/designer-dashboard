import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { defaultQuestions } from '../data/defaultQuestions';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { questionSuggestions } from '../data/questionSuggestions';
import AutocompleteInput from '../components/AutocompleteInput';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const QuestionInput = ({ question, onChange, onFileUpload }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  const validateFile = (file) => {
    setError('');
    
    if (!file) return false;
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, JPEG, PNG and PDF files are allowed.');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB.');
      return false;
    }
    
    return true;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;

    try {
      setUploading(true);
      setError('');
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      const storage = getStorage();
      const fileRef = ref(storage, `uploads/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      onFileUpload(downloadURL);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Get relevant suggestions based on group name or question context
  const getSuggestions = () => {
    if (question.text.toLowerCase().includes('color') || 
        question.text.toLowerCase().includes('design') ||
        question.text.toLowerCase().includes('brand')) {
      return questionSuggestions.design;
    } else if (question.text.toLowerCase().includes('audience') || 
               question.text.toLowerCase().includes('customer') ||
               question.text.toLowerCase().includes('market')) {
      return questionSuggestions.audience;
    }
    return questionSuggestions.business;
  };

  switch (question.type) {
    case 'textarea':
      return (
        <AutocompleteInput
          value={question.text}
          onChange={onChange}
          type="textarea"
          suggestions={getSuggestions()}
        />
      );
    case 'file':
      return (
        <div className="w-100">
          <div className="mb-2">
            <AutocompleteInput
              value={question.text}
              onChange={onChange}
              suggestions={getSuggestions()}
            />
          </div>
          <div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="form-control"
              style={{ maxWidth: '300px' }}
              disabled={uploading}
            />
            {error && (
              <div className="text-danger mt-2" style={{ maxWidth: '300px' }}>
                {error}
              </div>
            )}
            {uploading && (
              <div className="progress mt-2" style={{ maxWidth: '300px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}
            {(preview || question.fileUrl) && (
              <div className="mt-2" style={{ maxWidth: '80px' }}>
                {question.fileUrl && question.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <div className="d-flex align-items-center">
                    <i className="fas fa-file-pdf me-2" style={{ fontSize: '24px' }}></i>
                    <a href={question.fileUrl} target="_blank" rel="noopener noreferrer">
                      View PDF
                    </a>
                  </div>
                ) : (
                  <img 
                    src={preview || question.fileUrl} 
                    alt="Upload preview" 
                    className="img-fluid"
                    style={{ 
                      width: '80px', 
                      objectFit: 'contain',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      );
    default:
      return (
        <AutocompleteInput
          value={question.text}
          onChange={onChange}
          suggestions={getSuggestions()}
        />
      );
  }
};

const QuestionGroup = React.memo(({ group, groupIndex, onQuestionChange, onQuestionDelete, onGroupNameChange, isExpanded, onToggleExpand, onAddQuestion }) => {
  const [newQuestionType, setNewQuestionType] = useState('text');

  const handleAddQuestion = () => {
    onAddQuestion(groupIndex, newQuestionType);
  };

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
                className="form-control questionnaire-editor-input"
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
                        className="p-3 mb-2 rounded d-flex align-items-center bg-white border draggable-item"
                      >
                        <div {...provided.dragHandleProps} className="me-3">⋮⋮</div>
                        <QuestionInput
                          question={question}
                          onChange={(value) => onQuestionChange(groupIndex, index, value)}
                          onFileUpload={(fileUrl) => {/* Handle file upload */}}
                        />
                        <button
                          onClick={() => onQuestionDelete(groupIndex, index)}
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
                <div className="d-flex mt-3">
                  <select
                    className="form-select me-2 mr-3"
                    style={{ width: 'auto' }}
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value)}
                  >
                    <option value="text">Text Input</option>
                    <option value="textarea">Text Area</option>
                    <option value="file">File Upload</option>
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddQuestion}
                  >
                    Add Question
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
});

const QuestionnaireEditor = () => {
  const { templateId, type } = useParams();
  const [searchParams] = useSearchParams();
  const baseTemplateId = searchParams.get('baseTemplate');
  const [groups, setGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");

        // Clear expanded groups when loading new template
        setExpandedGroups(new Set());

        if (templateId === 'create') {
          const useDefaults = searchParams.get("useDefaults");
          const empty = searchParams.get("empty");

          if (empty === "true") {
            const newGroup = {
              id: `group-${Date.now()}`,
              name: 'New Group',
              questions: []
            };
            setGroups([newGroup]);
            // Auto-expand the new group
            setExpandedGroups(new Set([newGroup.id]));
          } else if (useDefaults === "true") {
            setGroups(defaultQuestions);
            // Auto-expand all default groups
            setExpandedGroups(new Set(defaultQuestions.map(g => g.id)));
          } else if (baseTemplateId && baseTemplateId !== 'default') {
            const templateRef = doc(db, "questionnaireTemplates", baseTemplateId);
            const templateDoc = await getDoc(templateRef);
            
            if (templateDoc.exists()) {
              const data = templateDoc.data();
              const loadedGroups = data.groups.map(group => ({
                id: group.id || `group-${Date.now()}`,
                name: group.name,
                questions: group.questions.map(q => ({
                  id: q.id || `question-${Date.now()}`,
                  text: q.text,
                  type: q.type || 'text',
                  accept: q.accept,
                  fileUrl: q.fileUrl
                }))
              }));
              setGroups(loadedGroups);
              // Auto-expand all loaded groups
              setExpandedGroups(new Set(loadedGroups.map(g => g.id)));
              setTemplateName(data.name);
            } else {
              setGroups(defaultQuestions);
              // Auto-expand all default groups
              setExpandedGroups(new Set(defaultQuestions.map(g => g.id)));
            }
          }
          return;
        }

        const templateRef = doc(db, "questionnaireTemplates", templateId);
        const templateDoc = await getDoc(templateRef);
        
        if (templateDoc.exists()) {
          const data = templateDoc.data();
          const loadedGroups = data.groups.map(group => ({
            id: group.id || `group-${Date.now()}`,
            name: group.name,
            questions: group.questions.map(q => ({
              id: q.id || `question-${Date.now()}`,
              text: q.text,
              type: q.type || 'text',
              accept: q.accept,
              fileUrl: q.fileUrl
            }))
          }));
          setGroups(loadedGroups);
          // Auto-expand all loaded groups
          setExpandedGroups(new Set(loadedGroups.map(g => g.id)));
          setTemplateName(data.name);
        } else {
          console.error("Template not found");
          setGroups(defaultQuestions);
          // Auto-expand all default groups
          setExpandedGroups(new Set(defaultQuestions.map(g => g.id)));
        }
      } catch (error) {
        console.error("Error loading template:", error);
        setGroups(defaultQuestions);
        // Auto-expand all default groups
        setExpandedGroups(new Set(defaultQuestions.map(g => g.id)));
      }
    };

    loadTemplate();
  }, [templateId, type, baseTemplateId, searchParams]);

  const handleSave = async (name = '') => {
    if (templateId === 'default' && !name) {
      setShowNameDialog(true);
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const saveTemplateId = templateId === 'default' ? `template-${Date.now()}` : templateId;
      const templateRef = doc(db, "questionnaireTemplates", saveTemplateId);
      
      const templateData = {
        name: name || templateName || 'Untitled Template',
        groups: groups.map(group => ({
          ...group,
          questions: group.questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            accept: q.accept,
            fileUrl: q.fileUrl
          }))
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'branding',
        designerId: user.uid,
      };

      await setDoc(templateRef, templateData, { merge: true });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowNameDialog(false);
    handleSave(templateName);
  };

  const handleDelete = async () => {
    if (templateId === 'default') {
      alert("Cannot delete the default template");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const templateRef = doc(db, "questionnaireTemplates", templateId);
      await deleteDoc(templateRef);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template. Please try again.");
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

  const addQuestion = (groupIndex, type = 'text') => {
    const newGroups = [...groups];
    newGroups[groupIndex].questions.push({
      id: `question-${Date.now()}`,
      text: "New Question",
      type: type,
      accept: type === 'file' ? 'image/*,.pdf' : undefined,
      fileUrl: null
    });
    setGroups(newGroups);
  };

  const handleFileUpload = (groupIndex, questionIndex, fileUrl) => {
    const newGroups = [...groups];
    newGroups[groupIndex].questions[questionIndex].fileUrl = fileUrl;
    setGroups(newGroups);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2>Edit Questions</h2>
        <div>
          <button 
            className="btn btn-secondary me-2 mr-3"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          {templateId !== 'default' && (
            <button 
              className="btn btn-danger me-2 mr-3"
              onClick={handleDelete}
            >
              Delete Template
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => setShowNameDialog(true)}
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
                    onAddQuestion={addQuestion}
                  />
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

      {showNameDialog && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleNameSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Name Your Template</h5>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="templateName" className="form-label">Template Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowNameDialog(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!templateName.trim()}
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireEditor; 