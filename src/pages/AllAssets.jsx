import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import FilePreview from '../components/brand/FilePreview';
import '../bootstrap.min.css';

const assetCategories = [
  'logos',
  'brandmarks',
  'typography',
  'colors',
  'guidelines',
  'templates',
  'other'
];

export default function AllAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        // Fetch all projects for this designer
        const projectsQuery = query(
          collection(db, 'projects'),
          where('designerId', '==', user.uid)
        );
        const projectsSnap = await getDocs(projectsQuery);
        const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Fetch all clients for mapping
        const clientsQuery = query(
          collection(db, 'clients'),
          where('designerId', '==', user.uid)
        );
        const clientsSnap = await getDocs(clientsQuery);
        const clients = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // For each project, fetch all asset categories
        let allAssets = [];
        for (const project of projects) {
          for (const category of assetCategories) {
            const assetRef = doc(db, 'projects', project.id, 'assets', category);
            const assetDoc = await getDoc(assetRef);
            if (assetDoc.exists()) {
              const files = assetDoc.data().files || [];
              for (const file of files) {
                allAssets.push({
                  ...file,
                  fileType: category,
                  projectName: project.name || project.projectName || 'Untitled Project',
                  clientName: clients.find(c => c.id === project.clientId)?.name || 'Unknown Client',
                  projectId: project.id
                });
              }
            }
          }
        }
        setAssets(allAssets);
      } catch (err) {
        setError('Failed to load assets.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllAssets();
  }, []);

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-4" onClick={() => navigate('/dashboard')}>&larr; Back</button>
      <h2 className="mb-4">All My Assets</h2>
      {loading ? (
        <div>Loading assets...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : assets.length === 0 ? (
        <div>No assets found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Preview</th>
                <th>File Name</th>
                <th>Category</th>
                <th>Project</th>
                <th>Client</th>
                <th>Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((file, idx) => (
                <tr key={file.url || file.name + idx}>
                  <td title={file.name}><FilePreview file={file} width={50} /></td>
                  <td className="text-truncate" title={file.name}>{file.name}</td>
                  <td>{file.fileType}</td>
                  <td>{file.projectName}</td>
                  <td>{file.clientName}</td>
                  <td>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 