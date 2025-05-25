import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import FullPageSpinner from '../FullPageSpinner';

export default function ClientDashboard() {
  const [clientName, setClientName] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetsPresence, setAssetsPresence] = useState({});
  const [briefsPresence, setBriefsPresence] = useState({});
  const [guidelinesPresence, setGuidelinesPresence] = useState({});

  useEffect(() => {
    const fetchClientData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Get client's user document
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setClientName(userSnap.data().name);

          // Query projects where clientEmail matches the user's email
          const projectsQuery = query(
            collection(db, 'projects'), 
            where('clientEmail', '==', user.email)
          );
          
          const projectSnapshot = await getDocs(projectsQuery);
          const clientProjects = projectSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(clientProjects);

          // For each project, check if any asset exists, if briefs exist, and if guidelines exist
          const assets = {};
          const briefs = {};
          const guidelines = {};
          for (const project of clientProjects) {
            // Assets
            const categories = [
              'logos',
              'brandmarks',
              'typography',
              'colors',
              'guidelines',
              'templates',
              'other'
            ];
            let hasAssets = false;
            for (const category of categories) {
              const assetRef = doc(db, 'projects', project.id, 'assets', category);
              const assetDoc = await getDoc(assetRef);
              if (assetDoc.exists() && Array.isArray(assetDoc.data().files) && assetDoc.data().files.length > 0) {
                hasAssets = true;
                break;
              }
            }
            assets[project.id] = hasAssets;

            // Briefs
            const briefsQuery = query(
              collection(db, 'creativeBriefs'),
              where('projectId', '==', project.id)
            );
            const briefsSnap = await getDocs(briefsQuery);
            briefs[project.id] = !briefsSnap.empty;

            // Brand Guidelines
            const guidelinesRef = doc(db, 'projects', project.id, 'brandGuidelines', 'guidelines');
            const guidelinesDoc = await getDoc(guidelinesRef);
            guidelines[project.id] = guidelinesDoc.exists();
          }
          setAssetsPresence(assets);
          setBriefsPresence(briefs);
          setGuidelinesPresence(guidelines);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  if (loading) {
    return <FullPageSpinner message="Loading your projects..." />;
  }

  return (
    <div className="container p-4">
      <h3 className="mb-3">Your Projects</h3>
      {projects.length === 0 ? (
        <div className="text-center mt-5">
          <p>No projects yet. Your designer will add projects here.</p>
        </div>
      ) : (
        <div className="row">
          {projects.map((project) => (
            <div key={project.id} className="col-12 col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">{project.name || project.projectName || 'Untitled Project'}</h5>
                  <p className="mb-0">{project.designerName}</p>
                </div>
                <div className="card-body">

                  {project.description && (
                    <p className="mb-0">
                      <strong>Description:</strong> {project.description}
                    </p>
                  )}
                  <div className="w-100 mt-3">
                    {assetsPresence[project.id] && (
                      <button
                        className="btn btn-outline-primary w-100 mb-2"
                        onClick={() => window.location.href = `/project/${project.id}/assets`}
                      >
                        View Assets
                      </button>
                    )}
                    {briefsPresence[project.id] && (
                      <button
                        className="btn btn-outline-info w-100 mb-2"
                        onClick={() => window.location.href = `/project/${project.id}/briefs`}
                      >
                        View Briefs
                      </button>
                    )}
                    {guidelinesPresence[project.id] && (
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={() => window.location.href = `/project/${project.id}/guidelines`}
                      >
                        View Brand Guidelines
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}