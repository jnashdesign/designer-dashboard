import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [briefs, setBriefs] = useState({});
  const [clients, setClients] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [loading, setLoading] = useState(true);

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
      const pid = data.projectId.id;
      if (!subs[pid]) subs[pid] = [];
      subs[pid].push({ id: doc.id, ...data });
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

  const getClientNameByRef = (clientRef) => {
    const id = clientRef?.id;
    const client = clients.find((c) => c.id === id);
    return client ? client.name : 'Unknown Client';
  };

  const toggleExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Designer Dashboard</h2>

      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: '1px solid #ccc',
                padding: '1.5rem',
                borderRadius: '8px',
                width: '320px',
                background: '#fafafa',
                position: 'relative'
              }}
            >
              <strong>{project.type}</strong> – <em>{project.status}</em>
              <p style={{ margin: '0.5rem 0' }}>
                <small>Client: {getClientNameByRef(project.clientId)}</small>
              </p>

              <button
                onClick={() => toggleExpand(project.id)}
                style={{ marginBottom: '1rem', marginTop: '0.5rem' }}
              >
                {expandedProjects[project.id] ? '▾ Hide Briefs' : '▸ View Briefs'} ({briefs[project.id]?.length || 0})
              </button>

              {expandedProjects[project.id] && (
                <div style={{ marginBottom: '1rem' }}>
                  {briefs[project.id]?.length > 0 ? (
                    briefs[project.id]
                      .sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.()) // newest first
                      .map((brief) => (
                        <div key={brief.id} style={{ marginBottom: '0.5rem' }}>
                          <button
                            style={{ width: '100%', textAlign: 'left' }}
                            onClick={() => navigate(`/view-brief/${brief.id}`)}
                          >
                            View Brief ({brief.type}) - {brief.createdAt?.toDate?.().toLocaleDateString()}
                          </button>
                        </div>
                      ))
                  ) : (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>No creative briefs yet.</p>
                  )}
                </div>
              )}

              <button
                style={{ marginTop: '0.5rem' }}
                onClick={() => navigate(`/choose-template/${project.type}?projectId=${project.id}`)}
              >
                ➕ Create New Questionnaire
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}