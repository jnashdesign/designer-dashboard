import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import Logo from '../shared/Logo';

export default function NavBar() {
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        getDoc(doc(db, 'users', user.uid)).then(userDoc => {
          setRole(userDoc.data()?.role);
        });
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <nav style={{ 
      display: 'flex', 
      position: 'fixed',
      width: '100%',
      zIndex: 1000,
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
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="btn btn-outline-secondary"
          >
            Log Out
          </button>
        ) : (
          <>
            <button 
              onClick={handleLogin}
              className="btn btn-primary"
          >
            Log In
          </button>
          <a href="/signup"
          >
            Sign Up
          </a>
          </>
        )}
      </div>
    </nav>
  );
}