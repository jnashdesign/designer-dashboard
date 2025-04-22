import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import SubmissionViewer from './SubmissionViewer';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsAndSubmissions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const designerRef = doc(db, 'users', user.uid);
      const projectQuery = query(collection(db, 'projects'), where('designerId', '==', designerRef));
      const projectSnapshot = await getDocs(projectQuery);
      const projectsList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsList);

      const submissionsSnapshot = await getDocs(collection(db, 'submissions'));
      const subs = {};
      submissionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const pid = data.projectId.id;
        subs[pid] = data.wizardAnswers;
      });
      setSubmissions(subs);
      setLoading(false);
    };

    fetchProjectsAndSubmissions();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Designer Dashboard</h2>
      <h3>Your Projects</h3>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id} style={{ marginBottom: '1.5rem' }}>
              <strong>{project.type}</strong> - {project.status}
              {submissions[project.id] ? (
                <SubmissionViewer className='submissionViewer' answers={submissions[project.id]} projectId={project.id} />
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