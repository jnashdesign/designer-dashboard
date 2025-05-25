import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, db } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc, arrayRemove, setDoc } from 'firebase/firestore';
import FileUploader from './FileUploader';
import FilePreview from './FilePreview';
import { auth } from '../../firebase/config';

const AssetRepository = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'uploadedAt', direction: 'desc' });
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserRole(userSnap.data().role);
      }
    };
    fetchRole();
  }, []);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const categories = [
          'logos',
          'brandmarks',
          'typography',
          'colors',
          'guidelines',
          'templates',
          'other'
        ];
        let allFiles = [];

        for (const category of categories) {
          const assetRef = doc(db, 'projects', projectId, 'assets', category);
          const assetDoc = await getDoc(assetRef);
          
          if (assetDoc.exists()) {
            const categoryFiles = assetDoc.data().files || [];
            allFiles = [...allFiles, ...categoryFiles];
          }
        }

        setFiles(allFiles);
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

    loadAssets();
  }, [projectId]);

  const sortFiles = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedFiles = () => {
    const sortedFiles = [...files];
    sortedFiles.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      switch (sortConfig.key) {
        case 'uploadedAt':
          return (new Date(a.uploadedAt) - new Date(b.uploadedAt)) * direction;
        case 'name':
          return a.name.localeCompare(b.name) * direction;
        case 'fileType':
          return a.fileType.localeCompare(b.fileType) * direction;
        default:
          return 0;
      }
    });
    return sortedFiles;
  };

  const handleDelete = async (file) => {
    if (userRole === 'client') return; // Prevent delete for clients
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      return; // Exit if user clicks Cancel
    }

    try {
      // Delete from Storage
      if (file.path) {
        const fileRef = ref(storage, file.path);
        await deleteObject(fileRef);
      } else {
        const path = `projects/${projectId}/${file.fileType}/${file.name}`;
        const fileRef = ref(storage, path);
        await deleteObject(fileRef);
      }

      // Delete from Firestore
      const assetRef = doc(db, 'projects', projectId, 'assets', file.fileType);
      const assetDoc = await getDoc(assetRef);
      
      if (assetDoc.exists()) {
        const currentFiles = assetDoc.data().files || [];
        const updatedFiles = currentFiles.filter(f => f.url !== file.url);
        
        await setDoc(assetRef, {
          files: updatedFiles
        }, { merge: true });
        
        // Update local state
        setFiles(prev => prev.filter(f => f.url !== file.url));
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      console.error('File object:', file);
      console.error('Error details:', error.message);
    }
  };

  // Route for back button
  const backRoute = userRole === 'designer' ? '/dashboard' : '/client-dashboard';

  return (
    <div className="container py-4 all-assets">
      <button className="btn btn-secondary mb-4" onClick={() => navigate(backRoute)}>&larr; Back</button>
      <h2 className="mb-4">Brand Assets</h2>

      <div className="card mb-4">
        <div className="card-body">
          {userRole !== 'client' && (
            <FileUploader 
              projectId={projectId}
              onUploadComplete={(newFiles) => {
                setFiles(prev => [...prev, ...newFiles]);
              }}
            />
          )}
          <div className="table-responsive mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}></th>
                  <th onClick={() => sortFiles('name')} style={{ cursor: 'pointer' }}>
                    File Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => sortFiles('fileType')} style={{ cursor: 'pointer' }}>
                    Asset Category {sortConfig.key === 'fileType' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => sortFiles('uploadedAt')} style={{ cursor: 'pointer' }}>
                    Upload Date {sortConfig.key === 'uploadedAt' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {getSortedFiles().length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No assets yet.
                    </td>
                  </tr>
                ) : (
                  getSortedFiles().map((file, index) => (
                    <tr key={index}>
                      <td>
                        <FilePreview file={file} width={50} />
                      </td>
                      <td className="align-middle">{file.name}</td>
                      <td className="align-middle">{file.fileType}</td>
                      <td className="align-middle">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="align-middle text-end">
                        {userRole !== 'client' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(file)}
                          >
                            X
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the fileTypes mapping at the bottom of the file
const fileTypes = {
  logos: 'Logo Files',
  brandmarks: 'Brand Marks & Icons',
  typography: 'Typography',
  colors: 'Color Palettes',
  guidelines: 'Brand Guidelines',
  templates: 'Templates & Stationery',
  other: 'Other Brand Assets'
};

export default AssetRepository; 