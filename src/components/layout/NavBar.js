import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import Logo from '../shared/Logo';

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
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem', 
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <Link to="/" className="nav-logo d-flex align-items-center text-decoration-none">
        <Logo />
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={handleLogout}
          className="btn btn-outline-secondary"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}