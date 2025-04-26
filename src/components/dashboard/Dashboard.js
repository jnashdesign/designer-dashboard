import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { addProject } from '../../firebase/addProject';
import { addClient } from '../../firebase/addClient';
import LoadingSpinner from '../LoadingSpinner';

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

  const getClientNameByRef = (clientRef) => {
    const id = clientRef?.id;
    const client = clients.find(c => c.id === id);
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

  if (loading) return <LoadingSpinner message="Fetching your dashboard..." />;

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Designer Dashboard</h2>
      {notification.message && (
        <div style={{
          backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>{notification.message}</div>
      )}
      {/* The rest stays the same */}
    </div>
  );
}