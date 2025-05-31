import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createClient, createProject, createCreativeBrief } from '../../firebase/saveFunctions';
import AddProjectModal from '../projects/AddProjectModal';
import { Modal } from 'react-bootstrap';
import './Sidebar.css';

const DefaultAvatar = ({ size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      borderRadius: '50%',
      border: '1px solid #ccc',
      background: '#f3f3f3',
      display: 'block',
      margin: '12px auto 0'
    }}
  >
    <circle cx="32" cy="32" r="32" fill="#f3f3f3" />
    <circle cx="32" cy="26" r="14" fill="#d1d5db" />
    <ellipse cx="32" cy="50" rx="18" ry="10" fill="#d1d5db" />
  </svg>
);

const Sidebar = ({
  onCollapse,
  isMobileMenuOpen: propMobileMenuOpen,
  setIsMobileMenuOpen: propSetMobileMenuOpen,
  onProjectCreated,
  userRole
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobileMenuOpen = typeof propMobileMenuOpen === 'boolean' ? propMobileMenuOpen : internalMobileMenuOpen;
  const setIsMobileMenuOpen = propSetMobileMenuOpen || setInternalMobileMenuOpen;
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  // User info
  const [userName, setUserName] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  // Designer-only states
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showNewQuestionnaire, setShowNewQuestionnaire] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [addingNewClient, setAddingNewClient] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data().name || '');
        setPhotoURL(userSnap.data().photoURL || '');
      }
    };
    fetchUserData();
    // Listen for profile photo updates
    const handler = () => fetchUserData();
    window.addEventListener('profilePhotoUpdated', handler);
    return () => {
      window.removeEventListener('profilePhotoUpdated', handler);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle desktop clicks (not mobile)
      if (window.innerWidth >= 992) {
        // Check if we're clicking on the main content area
        const mainContent = document.querySelector('.main-content');
        if (mainContent && mainContent.contains(event.target)) {
          setIsCollapsed(true);
          if (onCollapse) onCollapse(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCollapse]);

  // Designer-only: fetch clients and templates
  useEffect(() => {
    if (userRole !== 'designer') return;
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
    fetchClients();
    fetchTemplates();
  }, [userRole]);

  const handleSidebarLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapse) onCollapse(newState);
  };

  // Designer-only handlers (no-op for client)
  const handleAddClient = async (e) => {
    e.preventDefault();
    // ... implementation ...
  };
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (addingNewClient) {
      if (!newClientName || !newClientEmail || !newProjectName) return;
      try {
        // Create the client first
        const clientRef = await createClient(newClientName, newClientEmail);
        // Fetch the new client ID
        const user = auth.currentUser;
        const clientQuery = query(
          collection(db, 'clients'),
          where('designerId', '==', user.uid),
          where('email', '==', newClientEmail)
        );
        const snapshot = await getDocs(clientQuery);
        let clientId = '';
        if (!snapshot.empty) {
          clientId = snapshot.docs[0].id;
        }
        await createProject(clientId, newProjectName, 'branding', 'in-progress', newProjectDescription);
        setShowAddProject(false);
        setNewProjectName('');
        setNewProjectDescription('');
        setSelectedClient('');
        setNewClientName('');
        setNewClientEmail('');
        setAddingNewClient(false);
        if (onProjectCreated) onProjectCreated();
      } catch (error) {
        // handle error
      }
    } else {
      if (!selectedClient || !newProjectName) return;
      try {
        await createProject(selectedClient, newProjectName, 'branding', 'in-progress', newProjectDescription);
        setShowAddProject(false);
        setNewProjectName('');
        setNewProjectDescription('');
        setSelectedClient('');
        if (onProjectCreated) onProjectCreated();
      } catch (error) {
        // handle error
      }
    }
  };

  // Route logic
  const projectsLink = userRole === 'designer' ? '/dashboard' : '/client-dashboard';
  const settingsLink = userRole === 'designer' ? '/designer-settings' : '/client-settings';

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
      <div 
        ref={sidebarRef}
        className={`sidebar${isCollapsed ? ' collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Toggle Button */}
        <button
          className="sidebar-toggle d-none d-lg-block"
          onClick={handleToggleCollapse}
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`} />
        </button>
        <div className="sidebar-header text-center py-4">
          <h5 style={{ display: isCollapsed ? 'none' : 'block' }}>{userName}</h5>
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              style={{
                width: isCollapsed ? 32 : 100,
                height: isCollapsed ? 32 : 100,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #ccc',
                margin: '12px auto 0',
                display: 'block'
              }}
            />
          ) : (
            <DefaultAvatar size={isCollapsed ? 32 : 64} />
          )}
        </div>
        <div className="sidebar-links">
          <Link to={projectsLink} className={`sidebar-link${location.pathname === projectsLink ? ' active' : ''}`} onClick={handleSidebarLinkClick}>
            <i className="fas fa-project-diagram" />
            {!isCollapsed && <span>Projects</span>}
          </Link>
          {userRole === 'designer' && (
            <Link to="/my-assets" className={`sidebar-link${location.pathname === '/my-assets' ? ' active' : ''}`} onClick={handleSidebarLinkClick}>
              <i className="fas fa-images" />
              {!isCollapsed && <span>Assets</span>}
            </Link>
          )}
          <Link to={settingsLink} className={`sidebar-link${location.pathname === settingsLink ? ' active' : ''}`} onClick={handleSidebarLinkClick}>
            <i className="fas fa-cog" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
        {/* Designer-only action buttons */}
        {userRole === 'designer' && (
          <div className="sidebar-buttons">
            {!isCollapsed ? (
              <>
                <button className="btn btn-primary" onClick={() => setShowNewQuestionnaire(true)}>
                  <i className="fas fa-file-alt" /> New Questionnaire
                </button>
              </>
            ) : (
              <div className="collapsed-buttons">
                <button className="btn btn-sm btn-primary" title="Create New Questionnaire" onClick={() => setShowNewQuestionnaire(true)}>
                  <i className="fas fa-file-alt" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AddProjectModal
        show={showAddProject}
        onHide={() => setShowAddProject(false)}
        onProjectCreated={onProjectCreated}
        clients={clients}
      />

      {/* New Questionnaire Modal */}
      <Modal show={showNewQuestionnaire} onHide={() => setShowNewQuestionnaire(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Questionnaire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5>What type of questionnaire do you want to create?</h5>
            <div className="d-grid gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setShowNewQuestionnaire(false);
                  navigate('/choose-template/website');
                }}
              >
                Website Questionnaire
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setShowNewQuestionnaire(false);
                  navigate('/choose-template/app');
                }}
              >
                App Questionnaire
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setShowNewQuestionnaire(false);
                  navigate('/choose-template/branding');
                }}
              >
                Branding Questionnaire
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowNewQuestionnaire(false)}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;