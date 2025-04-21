import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function NavBar() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setRole(userDoc.data()?.role);
    };

    fetchRole();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#eee' }}>
      <h2 style={{ margin: 0 }}><Link to="/">BrandEZ</Link></h2>
      <div>
        {role === 'designer' && <Link to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>}
        {role === 'client' && <Link to="/client-dashboard" style={{ marginRight: '1rem' }}>My Projects</Link>}
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </nav>
  );
}