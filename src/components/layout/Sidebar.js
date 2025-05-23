import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { createClient, createProject, createCreativeBrief } from '../../firebase/saveFunctions';
import './Sidebar.css';

const Sidebar = ({ onCollapse, isMobileMenuOpen: propMobileMenuOpen, setIsMobileMenuOpen: propSetMobileMenuOpen, onProjectCreated }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobileMenuOpen = typeof propMobileMenuOpen === 'boolean' ? propMobileMenuOpen : internalMobileMenuOpen;
  const setIsMobileMenuOpen = propSetMobileMenuOpen || setInternalMobileMenuOpen;
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Modal states
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showNewQuestionnaire, setShowNewQuestionnaire] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Add fetchClients function
  const fetchClients = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

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
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Add fetchTemplates function
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const templatesQuery = query(
        collection(db, 'questionnaireTemplates'),
        where('type', '==', 'branding'),
        where('designerId', '==', user.uid)
      );
      
      const templatesSnapshot = await getDocs(templatesQuery);
      const templatesList = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templatesList);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Add useEffect to fetch clients and templates when component mounts
  useEffect(() => {
    fetchClients();
    fetchTemplates();
  }, []);

  // Add Client Handler
  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await createClient(newClientName, newClientEmail);
      setShowAddClient(false);
      setNewClientName('');
      setNewClientEmail('');
      await fetchClients(); // Refresh clients list
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  // Add Project Handler
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(selectedClient, newProjectName, 'branding', 'in-progress');
      if (onProjectCreated) onProjectCreated();
      setShowAddProject(false);
      setNewProjectName('');
      setSelectedClient('');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleSidebarLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse(newState);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      
      <button
        className="mobile-menu-toggle d-lg-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Toggle Button */}
        <button
          className="sidebar-toggle d-none d-lg-block"
          onClick={handleToggleCollapse}
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`} />
        </button>

        {/* Navigation Links */}
        <div className="sidebar-links">
          <Link to="/" className={`sidebar-link${location.pathname === '/' ? ' active' : ''}`} onClick={handleSidebarLinkClick}>
            <i className="fas fa-home" />
            {!isCollapsed && <span>Home</span>}
          </Link>
          <Link to="/dashboard" className={`sidebar-link${location.pathname === '/dashboard' ? ' active' : ''}`} onClick={handleSidebarLinkClick}>
            <i className="fas fa-project-diagram" />
            {!isCollapsed && <span>Projects</span>}
          </Link>
          <Link to="/my-assets" className={`sidebar-link${location.pathname === '/my-assets' ? ' active' : ''}`} onClick={handleSidebarLinkClick}>
            <i className="fas fa-images" />
            {!isCollapsed && <span>Assets</span>}
          </Link>
        </div>

        {/* Bottom Buttons */}
        <div className="sidebar-buttons">
          {!isCollapsed ? (
            <>
              <button className="btn btn-secondary" onClick={() => setShowAddClient(true)}>
                Add Client
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAddProject(true)}>
                Add Project
              </button>
              <button className="btn btn-primary" onClick={() => setShowNewQuestionnaire(true)}>
                Create Questionnaire
              </button>
            </>
          ) : (
            <div className="collapsed-buttons">
              <button className="btn btn-sm btn-outline-primary" title="Add Client" onClick={() => setShowAddClient(true)}>
                <i className="fas fa-user-plus" />
              </button>
              <button className="btn btn-sm btn-outline-primary" title="Add Project" onClick={() => setShowAddProject(true)}>
                <i className="fas fa-plus" />
              </button>
              <button className="btn btn-sm btn-primary" title="Create New Questionnaire" onClick={() => setShowNewQuestionnaire(true)}>
                <i className="fas fa-file-alt" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Client</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddClient(false)}></button>
              </div>
              <form onSubmit={handleAddClient}>
                <div className="modal-body">
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddClient(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Client
                  </button>
                </div>
              </form>
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
                <button type="button" className="btn-close" onClick={() => setShowAddProject(false)}></button>
              </div>
              <form onSubmit={handleAddProject}>
                <div className="modal-body">
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
                    <label className="form-label">Select Client</label>
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddProject(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Project
                  </button>
                </div>
              </form>
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
                <button type="button" className="btn-close" onClick={() => setShowNewQuestionnaire(false)}></button>
              </div>
              <div className="modal-body">
                {loadingTemplates ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : templates.length > 0 ? (
                  // Show saved templates list
                  <div className="mb-4">
                    <button 
                      className="btn btn-primary w-100 mb-4"
                      onClick={() => {
                        setShowNewQuestionnaire(false);
                        navigate('/template/create/branding?empty=true');
                      }}
                    >
                      Create New Template
                    </button>
                    <h6 className="mb-3">Or start from a template:</h6>
                    <div className="list-group">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => {
                            setShowNewQuestionnaire(false);
                            navigate(`/choose-template/branding?templateId=${template.id}`);
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{template.name}</span>
                            <small className="text-muted">
                              {new Date(template.createdAt?.toDate()).toLocaleDateString()}
                            </small>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Show options for new users
                  <div className="text-center">
                    
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="fas fa-magic me-2 mr-2"></i>
                          Start with Default Questions
                        </h5>
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            setShowNewQuestionnaire(false);
                            navigate('/template/create/branding?useDefaults=true');
                          }}
                        >
                          Use Default Template
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar; 