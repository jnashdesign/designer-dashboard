import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { addProject } from '../../firebase/addProject';
import { addClient } from '../../firebase/addClient';
import SubmissionModal from './SubmissionModal';
import LoadingSpinner from '../LoadingSpinner';

import '../../bootstrap.min.css';
import './Dashboard.css';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [briefs, setBriefs] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBriefs, setExpandedBriefs] = useState({});
  const [selectedBrief, setSelectedBrief] = useState(null);

  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showNewQuestionnaire, setShowNewQuestionnaire] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  const [notification, setNotification] = useState({ message: '', type: '' });

  const [showAddQuestionnaireForm, setShowAddQuestionnaireForm] = useState(false);
  const [questionnaireType, setQuestionnaireType] = useState('branding');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    const uid = user.uid; // Use UID directly, not a document reference!
  
    // Correctly query only projects owned by this designer
    const projectQuery = query(collection(db, 'projects'), where('designerId', '==', uid));
    const projectSnapshot = await getDocs(projectQuery);
    const projectsList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjects(projectsList);
  
    // Correct: fetch only briefs linked to your projects (NOT all briefs!)
    const briefsSnapshot = await getDocs(query(collection(db, 'creativeBriefs')));
    const subs = {};
    briefsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const pid = data.projectId;
      if (projectsList.find(p => p.id === pid)) {  // Only use briefs from your projects
        if (!subs[pid]) subs[pid] = [];
        subs[pid].push({ id: doc.id, ...data });
      }
    });
    setBriefs(subs);
  
    // Correct: fetch only clients owned by this designer
    const clientQuery = query(collection(db, 'clients'), where('designerId', '==', uid));
    const clientsSnapshot = await getDocs(clientQuery);
    const clientsList = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClients(clientsList);
  
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const designerId = auth.currentUser.uid;
      const clientId = await addClient(newClientName, newClientEmail, designerId);
      showNotification('Client added successfully!', 'success');
      setShowAddClient(false);
      setNewClientName('');
      setNewClientEmail('');
      await fetchData();
    } catch (err) {
      showNotification('Failed to add client.', 'error');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const designerId = auth.currentUser.uid;
      const projectId = await addProject(selectedClient, designerId, questionnaireType);
      showNotification('Project added successfully!', 'success');
      setShowAddProject(false);
      setSelectedClient('');
      setQuestionnaireType('branding');
      await fetchData();
    } catch (err) {
      showNotification('Failed to add project.', 'error');
    }
  };

  const getClientNameByRef = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const toggleExpandBriefs = (projectId) => {
    setExpandedBriefs(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const openBrief = (brief) => {
    setSelectedBrief(brief);
  };

  const closeBrief = () => {
    setSelectedBrief(null);
  };

  const handleCreateQuestionnaire = () => {
    if (!selectedProjectId) {
      alert('Please select a project');
      return;
    }
    const project = projects.find(p => p.id === selectedProjectId);
    navigate(`/choose-template/${project.type}?projectId=${selectedProjectId}`);
    setShowAddQuestionnaireForm(false);
    setSelectedProjectId('');
  };

  if (loading) return <LoadingSpinner message="Fetching your dashboard..." />;

  return (
    <div className="dashboard-container">
    <h2>Dashboard</h2>
      <div className="d-flex justify-content-between align-items-left mb-4">
        <div>
          <button 
            className="btn btn-primary me-2 mr-3" 
            onClick={() => setShowAddClient(true)}
          >
            Add Client
          </button>
          <button 
            className="btn btn-primary me-2 mr-3" 
            onClick={() => setShowAddProject(true)}
          >
            Add Project
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowNewQuestionnaire(true)}
          >
            Create New Questionnaire
          </button>
        </div>
      </div>

      {notification.message && (
        <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {notification.message}
        </div>
      )}

      <h3 className="h3 text-gray-800">Your Projects</h3>
      {projects.length === 0 ? (
        <div className="card shadow">
          <div className="card-body">No projects yet.</div>
        </div>
      ) : (
        <div className="projects-container">
          {projects.map((project) => (
            <div key={project.id} className="card shadow">
              <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 text-primary">
                  Client: {getClientNameByRef(project.clientId)}
                </h6>
                <span className={`badge badge-${project.type}`}>
                  {project.type.charAt(0).toUpperCase() + project.type.slice(1)} Project - {project.status}
                </span>
              </div>
              <div className="card-body">
                <div className='project-info col-6'>
                <div className="client-info mb-3">
                </div>
                <div className="project-actions">
                <button 
                  className="btn btn-secondary mb-2 w-100"
                  onClick={() => navigate(`/project/${project.id}/assets`)}
                >
                  Assets
                </button>
              </div>

                <div className="action-buttons">
                  {project.type === 'branding' && (
                    <button 
                      className="btn btn-info btn-sm mb-2 w-100"
                      onClick={() => navigate(`/choose-template/${project.type}?projectId=${project.id}&wizard=true`)}
                    >
                      Start Creative Brief
                    </button>
                  )}
                  {project.type === 'website' && (
                    <button 
                      className="btn btn-info btn-sm mb-2 w-100"
                      onClick={() => navigate(`/choose-template/${project.type}?projectId=${project.id}&wizard=true`)}
                    >
                    Start Creative Brief
                    </button>
                  )}
                  {project.type === 'app' && (
                    <button 
                      className="btn btn-info btn-sm mb-2 w-100"
                      onClick={() => navigate(`/choose-template/${project.type}?projectId=${project.id}&wizard=true`)}
                    >
                    Start Creative Brief
                    </button>
                  )}
                </div>

                <div 
                  className="brief-toggle text-primary cursor-pointer"
                  onClick={() => toggleExpandBriefs(project.id)}
                >
                  {expandedBriefs[project.id] ? '▾' : '▸'} Briefs ({briefs[project.id]?.length || 0})
                </div>
                
                {expandedBriefs[project.id] && (
                  <div className="briefs-container mt-2">
                    {briefs[project.id]?.length > 0 ? (
                      briefs[project.id]
                        .sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.())
                        .map((brief) => (
                          <button
                            key={brief.id}
                            className="btn btn-light btn-sm w-100 text-left mb-2"
                            onClick={() => openBrief(brief)}
                          >
                            View Brief ({brief.type}) - {brief.createdAt?.toDate?.().toLocaleDateString()}
                          </button>
                        ))
                    ) : (
                      <p className="text-muted font-italic">No creative briefs yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          ))}
        </div>
        
      )}

      {selectedBrief && (
        <SubmissionModal isOpen={true} onClose={closeBrief} brief={selectedBrief} />
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Client</h5>
                <button 
                  type="button" 
                  className="btn btn-outline-danger ms-2 delete-question" 
                  onClick={() => setShowAddClient(false)}
                >X</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddClient}>
                  <div className="mb-3">
                    <label className="form-label">Client Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Client Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddClient(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                    >
                      Add Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Project</h5>
                <button 
                  type="button" 
                  className="btn btn-outline-danger ms-2 delete-question" 
                  onClick={() => setShowAddProject(false)}
                >X</button>
              </div>  
              <div className="modal-body">
                <form onSubmit={handleAddProject}>
                  <div className="mb-3">
                    <label className="form-label">Project Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Client</label>
                    <select 
                      className="form-select"
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddProject(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                    >
                      Add Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Questionnaire Modal */}
      {showNewQuestionnaire && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Questionnaire</h5>
                <button 
                  type="button" 
                  className="btn btn-outline-danger ms-2 delete-question" 
                  onClick={() => setShowNewQuestionnaire(false)}
                >X</button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h5>What type of questionnaire do you want to create?</h5>
                  <div className="d-grid gap-2 questionnaire-types">
                    <button 
                      className="btn btn-secondary mr-3"
                      onClick={() => {
                        setShowNewQuestionnaire(false);
                        navigate('/choose-template/website');
                      }}
                    >
                      Website Questionnaire
                    </button>
                    <button 
                      className="btn btn-secondary mr-3"
                      onClick={() => {
                        setShowNewQuestionnaire(false);
                        navigate('/choose-template/app');
                      }}
                    >
                      App Questionnaire
                    </button>
                    <button 
                      className="btn btn-secondary mr-3"
                      onClick={() => {
                        setShowNewQuestionnaire(false);
                        navigate('/choose-template/branding');
                      }}
                    >
                      Branding Questionnaire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}