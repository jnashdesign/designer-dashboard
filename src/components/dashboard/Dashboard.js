import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '../LoadingSpinner';
import './Dashboard.css';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [briefs, setBriefs] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBriefs, setExpandedBriefs] = useState({});
  const [guidelines, setGuidelines] = useState({});
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch projects
      const projectQuery = query(
        collection(db, 'projects'), 
        where('designerId', '==', user.uid)
      );
      const projectSnapshot = await getDocs(projectQuery);
      const projectsList = projectSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsList);

      // Fetch briefs
      const briefsSnapshot = await getDocs(collection(db, 'creativeBriefs'));
      const briefsData = {};
      briefsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (projectsList.find(p => p.id === data.projectId)) {
          if (!briefsData[data.projectId]) briefsData[data.projectId] = [];
          briefsData[data.projectId].push({ id: doc.id, ...data });
        }
      });
      setBriefs(briefsData);

      // Fetch clients
      const clientQuery = query(
        collection(db, 'clients'), 
        where('designerId', '==', user.uid)
      );
      const clientsSnapshot = await getDocs(clientQuery);
      const clientsList = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsList);

      // Check for existing guidelines for each project
      const guidelinesData = {};
      for (const project of projectsList) {
        const guidelinesRef = doc(db, "projects", project.id, "brandGuidelines", "guidelines");
        const guidelinesDoc = await getDoc(guidelinesRef);
        if (guidelinesDoc.exists()) {
          guidelinesData[project.id] = true;
        }
      }
      setGuidelines(guidelinesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getClientNameByRef = useCallback((clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }, [clients]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-container container p-4">
      <h3 className="mb-4">Project Dashboard</h3>
      {projects.length === 0 ? (
        <div className="text-center mt-5">
          <h3>Welcome to BrandEZ!</h3>
          <p>Get started by adding your first project.</p>
        </div>
      ) : (
        <div className="row">
          {projects.map(project => (
            <div key={project.id} className="col-12 col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{project.name || project.projectName || 'Untitled Project'}</h5>
                    <h6 className="mb-0 text-muted" style={{ fontWeight: 400 }}>{getClientNameByRef(project.clientId)}</h6>
                  </div>
                </div>
                <div className="card-body">
                  <div className="w-100">
                    <button 
                      className="btn btn-outline-primary w-100 mb-2"
                      onClick={() => navigate(`/project/${project.id}/assets`)}
                    >
                      View Assets
                    </button>
                    <button 
                      className="btn btn-primary w-100 mb-2"
                      onClick={() => navigate(`/choose-template/${project.type}?projectId=${project.id}&wizard=true`)}
                    >
                      Start A Brief
                    </button>
                    <button 
                      className="btn btn-info w-100 mb-2"
                      onClick={() => navigate(`/project/${project.id}/guidelines${guidelines[project.id] ? '' : '/edit'}`)}
                    >
                      {guidelines[project.id] ? 'View Guidelines' : 'Build Guidelines'}
                    </button>
                  </div>
                  {briefs[project.id]?.length > 0 && (
                    <div className="mt-3">
                      <h6>Submitted Briefs:</h6>
                      <div className="list-group">
                        {briefs[project.id].map(brief => (
                          <button
                            key={brief.id}
                            className="list-group-item list-group-item-action mb-1"
                            onClick={() => navigate(`/view-brief/${brief.id}`)}
                          >
                            {new Date(brief.createdAt?.toDate()).toLocaleDateString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}