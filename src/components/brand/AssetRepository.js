import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { storage, db } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import FileUploader from './FileUploader';
import FilePreview from './FilePreview';

const AssetRepository = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('upload');
  const [projectType, setProjectType] = useState('');
  const [assets, setAssets] = useState({
    // Branding assets
    logos: {
      primary: [],
      secondary: [],
      submarks: [],
      variations: []
    },
    // Website assets
    images: {
      hero: [],
      gallery: [],
      products: []
    },
    // App assets
    ui: {
      icons: [],
      screenshots: [],
      mockups: []
    },
    // Common assets
    documents: [],
    other: []
  });
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const loadProjectType = async () => {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        setProjectType(projectDoc.data().type);
      }
    };
    loadProjectType();
  }, [projectId]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const categories = Object.keys(getRelevantCategories());
        const loadedAssets = { ...assets };

        for (const category of categories) {
          const assetRef = doc(db, 'projects', projectId, 'assets', category);
          const assetDoc = await getDoc(assetRef);
          
          if (assetDoc.exists()) {
            const files = assetDoc.data().files || [];
            
            // Group files by subcategory if they have one
            files.forEach(file => {
              if (file.subCategory) {
                if (!loadedAssets[category][file.subCategory]) {
                  loadedAssets[category][file.subCategory] = [];
                }
                loadedAssets[category][file.subCategory].push(file);
              } else {
                if (!Array.isArray(loadedAssets[category])) {
                  loadedAssets[category] = [];
                }
                loadedAssets[category].push(file);
              }
            });
          }
        }

        setAssets(loadedAssets);
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

    loadAssets();
  }, [projectId]);

  const getRelevantCategories = () => {
    const commonCategories = {
      documents: [],
      other: []
    };

    const typeCategories = {
      branding: {
        logos: {
          primary: [],
          secondary: [],
          submarks: [],
          variations: []
        }
      },
      website: {
        images: {
          hero: [],
          gallery: [],
          products: []
        }
      },
      app: {
        ui: {
          icons: [],
          screenshots: [],
          mockups: []
        }
      }
    };

    return {
      ...commonCategories,
      ...(typeCategories[projectType] || {})
    };
  };

  const toggleSection = (category, subcat = null) => {
    const key = subcat ? `${category}-${subcat}` : category;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Organized upload interface
  const LogoUploader = ({ category }) => (
    <div className="upload-section">
      <h4>{category}</h4>
            {/* Drag and drop zone */}
      <div className="file-types mb-2">
        Allowed file types: AI, EPS, SVG, PNG, JPG, PDF
      </div>

    </div>
  );

  // Client-facing view with organized downloads
  const AssetDownloader = () => (
    <div className="asset-grid">
      {Object.entries(assets).map(([category, files]) => (
        <div className="asset-category">
          <h3>{category}</h3>
          <div className="file-list">
            {files.map(file => (
              <DownloadCard 
                file={file}
                preview={file.type.startsWith('image')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard-container p-4">
      <h2 className="mb-4">Assets</h2>

      {Object.entries(getRelevantCategories()).map(([category, subcategories]) => (
        <div key={category} className="card mb-4">
          <div className="card-header">
            <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
          </div>
          <div className="card-body">
            {Object.keys(subcategories).length > 0 ? (
              // Handle subcategories
              Object.entries(subcategories).map(([subcat, _]) => {
                const files = assets[category]?.[subcat] || [];
                const sectionKey = `${category}-${subcat}`;
                return (
                  <div key={subcat} className="mb-4">
                    <h5>{subcat.charAt(0).toUpperCase() + subcat.slice(1)}</h5>
                    
                    {/* Expandable Files Section */}
                    {files.length > 0 && (
                      <div className="mb-3">
                        <button 
                          className="brief-toggle text-primary cursor-pointer"
                          onClick={() => toggleSection(category, subcat)}
                        >
                        {expandedSections[sectionKey] ? '▼' : '▶'} Files ({files.length})
                        </button>
                        {expandedSections[sectionKey] && (
                          <div className="table-responsive expanded-section w-100">
                            <table className="table">
                              <tbody>
                                {files.map((file, index) => (
                                  <tr key={index}>
                                    <td style={{ width: '80px' }}>
                                      <FilePreview file={file} width={50} />
                                    </td>
                                    <td className="align-middle">{file.name}</td>
                                    <td className="align-middle text-end" style={{ width: '50px' }}>
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={async () => {
                                          try {
                                            const fileRef = ref(storage, file.path);
                                            await deleteObject(fileRef);
                                            const assetRef = doc(db, 'projects', projectId, 'assets', category);
                                            await updateDoc(assetRef, {
                                              files: arrayRemove(file)
                                            });
                                            setAssets(prev => {
                                              const updated = { ...prev };
                                              updated[category][subcat] = updated[category][subcat]
                                                .filter(f => f.url !== file.url);
                                              return updated;
                                            });
                                          } catch (error) {
                                            console.error('Failed to delete file:', error);
                                          }
                                        }}
                                      >
                                        X
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload Section */}
                    <FileUploader 
                      projectId={projectId}
                      category={category}
                      subCategory={subcat}
                      onUploadComplete={(files) => {
                        setAssets(prev => {
                          const updated = { ...prev };
                          if (!updated[category]) updated[category] = {};
                          if (!updated[category][subcat]) updated[category][subcat] = [];
                          updated[category][subcat] = [...updated[category][subcat], ...files];
                          return updated;
                        });
                      }}
                    />
                    <div className="file-types mb-2">
                    Allowed file types: AI, EPS, SVG, PNG, JPG, PDF
                  </div>

                  </div>
                );
              })
            ) : (
              // Handle categories without subcategories
              <div>
                {/* Expandable Files Section */}
                {assets[category]?.length > 0 && (
                  <div className="mb-3">
                    <button 
                      className="brief-toggle text-primary cursor-pointer"
                      onClick={() => toggleSection(category)}
                    >
                    {expandedSections[category] ? '▼' : '▶'} Files ({assets[category].length}) 
                    </button>
                    {expandedSections[category] && (
                      <div className="table-responsive expanded-section w-100">
                        <table className="table">
                          <tbody>
                            {assets[category].map((file, index) => (
                              <tr key={index}>
                                <td style={{ width: '80px' }}>
                                  <FilePreview file={file} width={50} />
                                </td>
                                <td className="align-middle">{file.name}</td>
                                <td className="align-middle text-end" style={{ width: '50px' }}>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={async () => {
                                      try {
                                        const fileRef = ref(storage, file.path);
                                        await deleteObject(fileRef);
                                        const assetRef = doc(db, 'projects', projectId, 'assets', category);
                                        await updateDoc(assetRef, {
                                          files: arrayRemove(file)
                                        });
                                        setAssets(prev => {
                                          const updated = { ...prev };
                                          updated[category] = updated[category]
                                            .filter(f => f.url !== file.url);
                                          return updated;
                                        });
                                      } catch (error) {
                                        console.error('Failed to delete file:', error);
                                      }
                                    }}
                                  >
                                    X
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Section */}
                <FileUploader 
                  projectId={projectId}
                  category={category}
                  onUploadComplete={(files) => {
                    setAssets(prev => {
                      const updated = { ...prev };
                      if (!updated[category]) updated[category] = [];
                      updated[category] = [...updated[category], ...files];
                      return updated;
                    });
                  }}
                />
                <div className="file-types mb-2">
                Allowed file types: AI, EPS, SVG, PNG, JPG, PDF
              </div>

              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetRepository; 