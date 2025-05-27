import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import LoadingSpinner from '../LoadingSpinner';
import FullPageSpinner from '../FullPageSpinner';
import './Dashboard.css';

export default function Dashboard({ setFetchDataRef }) {
  const [projects, setProjects] = useState([]);
  const [briefs, setBriefs] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBriefs, setExpandedBriefs] = useState({});
  const [guidelines, setGuidelines] = useState({});
  const [emailStatus, setEmailStatus] = useState(null);
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

      // Fetch clients and update their photo URLs
      const clientQuery = query(
        collection(db, 'clients'), 
        where('designerId', '==', user.uid)
      );
      const clientsSnapshot = await getDocs(clientQuery);
      const clientsList = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update client photo URLs from auth
      for (const client of clientsList) {
        if (client.email) {
          console.log('Checking client:', client.name, 'Email:', client.email);
          const signInMethods = await fetchSignInMethodsForEmail(auth, client.email);
          console.log('Sign in methods:', signInMethods);
          
          if (signInMethods.length > 0) {
            // Get user data from users collection
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", client.email));
            const querySnapshot = await getDocs(q);
            
            let photoURL = null;
            
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              console.log('User document for client:', userData);
              photoURL = userData.photoURL;
              console.log('Found photo URL:', photoURL);
            }
            
            if (photoURL) {
              // Update client document with new photo URL
              const clientRef = doc(db, "clients", client.id);
              await updateDoc(clientRef, {
                photoURL: photoURL
              });
              // Update local state
              client.photoURL = photoURL;
              console.log('Updated client photo URL:', client.photoURL);
            } else {
              console.log('No photo URL found in user data');
            }
          } else {
            console.log('No sign in methods found for email');
          }
        }
      }

      console.log('Final clients list:', clientsList);
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
    if (setFetchDataRef) setFetchDataRef(fetchData);
    fetchData();
  }, [fetchData, setFetchDataRef]);

  const getClientNameByRef = useCallback((clientId) => {
    const client = clients.find(c => c.id === clientId);
    console.log('Getting name for client:', clientId, 'Client data:', client);
    return client ? client.name : 'Unknown Client';
  }, [clients]);

  // Add project delete handler
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjects(prev => prev.filter(p => p.id !== projectId));
      // Optionally, also remove from briefs/guidelines state if needed
    } catch (error) {
      alert('Failed to delete project.');
      console.error('Error deleting project:', error);
    }
  };

  // const handleSendTestEmail = async () => {
  //   setEmailStatus(null);
  //   try {
  //     const res = await fetch('/api/send-client-email', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         to: 'jnashdesign@gmail.com', // <-- replace with your test email
  //         subject: 'Test Email from BrandEZ',
  //         message: 'This is a test email sent from the BrandEZ app.'
  //       })
  //     });
  //     const data = await res.json();
  //     console.log(data);
  //     if (res.ok) {
  //       setEmailStatus('success');
  //       alert('Test email sent successfully!');
  //     } else {
  //       setEmailStatus('error');
  //       alert('Failed to send test email: ' + (data.error || 'Unknown error'));
  //     }
  //   } catch (err) {
  //     setEmailStatus('error');
  //     alert('Failed to send test email: ' + err.message);
  //   }
  // };

  // const sendEmail = async () => {
  //   const functions = getFunctions();
  //   const sendEmailFn = httpsCallable(functions, 'sendEmail');
  
  //   try {
  //     const result = await sendEmailFn({
  //       to: "jnashdesign@gmail.com",
  //       subject: "Test Email",
  //       text: "This is a test email.",
  //       html: "<p>This is a test email.</p>"
  //     });
  //     console.log("Email sent:", result.data);
  //   } catch (error) {
  //     console.error("Error sending email:", error);
  //   }
  // };

  if (loading) {
    return <FullPageSpinner message="Loading dashboard..." />;
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
                    <h6 className="mb-0 text-muted" style={{ fontWeight: 400 }}>
                      {getClientNameByRef(project.clientId)}
                    </h6>
                  </div>
                  <button
                    className="btn-close"
                    aria-label="Delete"
                    onClick={() => handleDeleteProject(project.id)}
                    style={{ marginLeft: 8 }}
                  ></button>
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
                      Start Questionnaire
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