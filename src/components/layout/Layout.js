import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Layout.css';

const Layout = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const getMainContentClass = () => {
    if (isAuthPage) return 'main-content';
    return `main-content ${isSidebarCollapsed ? 'closed-sidebar' : 'open-sidebar'}`;
  };

  return (
    <div>
      <NavBar />
      {isLoggedIn && <Sidebar onCollapse={setIsSidebarCollapsed} />}
      <ThemeToggle />
      <main className={getMainContentClass()}>
        {children}
      </main>
    </div>
  );
};

export default Layout;