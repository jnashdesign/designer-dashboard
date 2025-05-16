import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Layout.css';

const Layout = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <NavBar />
      {isLoggedIn && <Sidebar onCollapse={setIsSidebarCollapsed} />}
      <ThemeToggle />
      <main className={`main-content ${isSidebarCollapsed ? '' : 'full'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;