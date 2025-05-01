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

  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [projectClientId, setProjectClientId] = useState('');
  const [projectType, setProjectType] = useState('branding');

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
      const clientId = await addClient(clientName, clientEmail, designerId);
      showNotification('Client added successfully!', 'success');
      setShowAddClientForm(false);
      setClientName('');
      setClientEmail('');
      await fetchData();
    } catch (err) {
      showNotification('Failed to add client.', 'error');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const designerId = auth.currentUser.uid;
      const projectId = await addProject(projectClientId, designerId, projectType);
      showNotification('Project added successfully!', 'success');
      setShowAddProjectForm(false);
      setProjectClientId('');
      setProjectType('branding');
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
      <h2 className="dashboard-title">Designer Dashboard</h2>

      {notification.message && (
        <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {notification.message}
        </div>
      )}

      <div className="action-buttons col-12">
        <button 
          className={`btn ${showAddClientForm ? 'btn-secondary' : 'btn-primary'} shadow-sm mr-2`}
          onClick={() => setShowAddClientForm(!showAddClientForm)}
        >
          {showAddClientForm ? 'Cancel Add Client' : 'Add Client'}
        </button>
        <button 
          className={`btn ${showAddProjectForm ? 'btn-secondary' : 'btn-primary'} shadow-sm mr-2`}
          onClick={() => setShowAddProjectForm(!showAddProjectForm)}
        >
          {showAddProjectForm ? 'Cancel Add Project' : 'Add Project'}
        </button>
        <button 
          className={`btn ${showAddQuestionnaireForm ? 'btn-secondary' : 'btn-primary'} shadow-sm`}
          onClick={() => setShowAddQuestionnaireForm(!showAddQuestionnaireForm)}
        >
          {showAddQuestionnaireForm ? 'Cancel New Questionnaire' : 'Create New Questionnaire'}
        </button>
      </div>

      {showAddClientForm && (
        <div className="card shadow">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Add New Client</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddClient}>
              <div className="form-group">
                <label>Client Name
                <input 
                  className="form-control"
                  placeholder="Client Name" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  required 
                />
                </label>
                <label>Client Email
                <input 
                  className="form-control"
                  placeholder="Client Email" 
                  value={clientEmail} 
                  onChange={(e) => setClientEmail(e.target.value)} 
                  required 
                />
                </label>
              
              <button type="submit" className="btn btn-primary">Create Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddProjectForm && (
        <div className="card shadow">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Add New Client</h6>
        </div>
        <div className="card-body">
        <form onSubmit={handleAddProject} style={{ marginBottom: '2rem' }}>
          <label>
            Client
            <select value={projectClientId} onChange={(e) => setProjectClientId(e.target.value)} required>
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            Project Type
            <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
              <option value="branding">Branding</option>
              <option value="website">Website</option>
              <option value="app">App</option>
              <option value="graphic design">Graphic Design</option>
            </select>
          </label>
          <button type="submit">Create Project</button>
        </form>
        </div>
        </div>
      )}

      {showAddQuestionnaireForm && (
        <div className="card shadow">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Create New Questionnaire</h6>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateQuestionnaire(); }}>
              <div className="form-group">
                <label>Select Project</label>
                <select 
                  className="form-control"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.type.charAt(0).toUpperCase() + project.type.slice(1)} - {getClientNameByRef(project.clientId)}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Create Questionnaire</button>
            </form>
          </div>
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
    </div>
  );
}