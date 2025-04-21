import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function ClientDashboard() {
  const [clientName, setClientName] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchClientData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setClientName(userSnap.data().name);

        const clientQuery = query(collection(db, 'projects'), where('clientId', '==', userRef));
        const projectSnapshot = await getDocs(clientQuery);
        const clientProjects = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(clientProjects);
      }
    };

    fetchClientData();
  }, []);

  return (
    <div className="container">
      <h2>Welcome, {clientName}</h2>
      <h3>Your Projects</h3>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.type}</strong> – {project.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}