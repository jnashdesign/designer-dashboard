import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { addClient } from '../../firebase/addClient';
import { addProject } from '../../firebase/addProject';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';

export default function Dashboard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [clientId, setClientId] = useState(null);
  const [projectType, setProjectType] = useState('branding');
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsAndSubmissions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const designerRef = doc(db, 'users', user.uid);

      // Fetch projects for this designer
      const projectQuery = query(collection(db, 'projects'), where('designerId', '==', designerRef));
      const projectSnapshot = await getDocs(projectQuery);
      const projectsList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsList);

      // Fetch all submissions
      const submissionsSnapshot = await getDocs(collection(db, 'submissions'));
      const subs = {};
      submissionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const pid = data.projectId.id; // projectId is a reference
        subs[pid] = data.wizardAnswers;
      });
      setSubmissions(subs);
      setLoading(false);
    };

    fetchProjectsAndSubmissions();
  }, []);

  if (loading) return <p>Loading...</p>;


  const handleAddClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const designerId = auth.currentUser.uid; // must be logged in
      const newClientId = await addClient(name, email, designerId);
      setClientId(newClientId);

      // Choose project type when creating project
      const projectId = await addProject(newClientId, designerId, projectType);

      alert('Client and project created!');
      setName('');
      setEmail('');
    } catch (err) {
      console.error(err);
      alert('Failed to create client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      <form onSubmit={handleAddClient}>
        <h3>Add New Client</h3>
        <input
          type="text"
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Client email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
          <option value="branding">Branding</option>
          <option value="website">Website</option>
          <option value="app">App</option>
          <option value="graphic design">Graphic Design</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Client'}
        </button>
      </form>

      <button onClick={() => navigate('/onboarding/branding')}>Start Branding Questionnaire</button>

      <h3>Your Projects</h3>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.type}</strong> – {project.status}
              {submissions[project.id] ? (
                <details>
                  <summary>View Submission</summary>
                  <pre>{JSON.stringify(submissions[project.id], null, 2)}</pre>
                </details>
              ) : (
                <p style={{ color: 'gray' }}>No submission yet</p>
              )}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}

