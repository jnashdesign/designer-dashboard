import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { addProject } from '../../firebase/addProject';
import { addClient } from '../../firebase/addClient';
import SubmissionModal from './SubmissionModal';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [briefs, setBriefs] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBriefs, setExpandedBriefs] = useState({});

  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [projectClientId, setProjectClientId] = useState('');
  const [projectType, setProjectType] = useState('branding');

  const [selectedBrief, setSelectedBrief] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const designerRef = doc(db, 'users', user.uid);

    const projectQuery = query(collection(db, 'projects'), where('designerId', '==', designerRef));
    const projectSnapshot = await getDocs(projectQuery);
    const projectsList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjects(projectsList);

    const briefsSnapshot = await getDocs(collection(db, 'creativeBriefs'));
    const subs = {};
    briefsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const pid = data.projectId?.id;
      if (pid) {
        if (!subs[pid]) subs[pid] = [];
        subs[pid].push({ id: doc.id, ...data });
      }
    });
    setBriefs(subs);

    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    const clientsList = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClients(clientsList);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const designerId = auth.currentUser.uid;
      const projectId = await addProject(projectClientId, designerId, projectType);
      alert('Project created: ' + projectId);
      setShowAddProjectForm(false);
      await fetchData();
    } catch (err) {
      alert('Failed to add project');
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const designerId = auth.currentUser.uid;
      const clientId = await addClient(clientName, clientEmail, designerId);
      alert('Client created: ' + clientId);
      setShowAddClientForm(false);
      await fetchData();
    } catch (err) {
      alert('Failed to add client');
    }
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

  const getClientNameByRef = (clientRef) => {
    const id = clientRef?.id;
    const client = clients.find((c) => c.id === id);
    return client ? client.name : 'Unknown Client';
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Designer Dashboard</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setShowAddClientForm(!showAddClientForm)}>
          {showAddClientForm ? 'Cancel Add Client' : 'Add Client'}
        </button>
        <button onClick={() => setShowAddProjectForm(!showAddProjectForm)}>
          {showAddProjectForm ? 'Cancel Add Project' : 'Add Project'}
        </button>
      </div>

      {showAddClientForm && (
        <form onSubmit={handleAddClient} style={{ marginBottom: '1rem' }}>
          <input placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          <input placeholder="Client Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
          <button type="submit">Create Client</button>
        </form>
      )}

      {showAddProjectForm && (
        <form onSubmit={handleAddProject} style={{ marginBottom: '2rem' }}>
          <label>
            Client:
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
            Project Type:
            <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
              <option value="branding">Branding</option>
              <option value="website">Website</option>
              <option value="app">App</option>
              <option value="graphic design">Graphic Design</option>
            </select>
          </label>
          <button type="submit">Create Project</button>
        </form>
      )}

      <h3>Your Projects</h3>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {projects.map((project) => (
            <div key={project.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '300px', background: '#fafafa' }}>
              <strong>{project.type}</strong> – <em>{project.status}</em>
              <p style={{ margin: '0.5rem 0' }}>
                <small>Client: {getClientNameByRef(project.clientId)}</small>
              </p>
              <button
                style={{ marginTop: '0.5rem' }}
                onClick={() => navigate(`/choose-template/${project.type}?projectId=${project.id}`)}
              >
                + Create New Questionnaire
              </button>
              {project.type === 'branding' && (
                <button style={{ marginTop: '0.5rem' }} onClick={() => navigate(`/onboarding/branding/${project.id}/step1`)}>
                  Start Branding Wizard
                </button>
              )}
              {project.type === 'website' && (
                <button style={{ marginTop: '0.5rem' }} onClick={() => navigate(`/onboarding/website/${project.id}/step1`)}>
                  Start Website Wizard
                </button>
              )}
              {project.type === 'app' && (
                <button style={{ marginTop: '0.5rem' }} onClick={() => navigate(`/onboarding/app/${project.id}/step1`)}>
                  Start App Wizard
                </button>
              )}

              <p style={{ cursor: 'pointer', color: 'blue', marginTop: '1rem' }} onClick={() => toggleExpandBriefs(project.id)}>
                Creative Briefs {expandedBriefs[project.id] ? '▲' : '▼'}
              </p>

              {expandedBriefs[project.id] && (
                <div style={{ marginTop: '0.5rem' }}>
                  {briefs[project.id]?.map((brief) => (
                    <button key={brief.id} style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }} onClick={() => openBrief(brief)}>
                      View Brief ({new Date(brief.createdAt?.seconds * 1000).toLocaleDateString()})
                    </button>
                  ))}
                </div>
              )}
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