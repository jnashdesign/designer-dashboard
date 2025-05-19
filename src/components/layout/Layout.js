import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Layout.css';
// import { SidebarContext } from '../../context/SidebarContext';

const Layout = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const getMainContentClass = () => {
    if (isAuthPage || isHomePage) return 'main-content';
    return `main-content ${isSidebarCollapsed ? 'closed-sidebar' : 'open-sidebar'}`;
  };

  // const collapseSidebar = () => setIsSidebarCollapsed(true);

  return (
    // <SidebarContext.Provider value={{ collapseSidebar }}>
      <div>
        <NavBar />
        {/* Only show sidebar if not on homepage */}
        {isLoggedIn && !isHomePage && <Sidebar onCollapse={setIsSidebarCollapsed} />}
        <ThemeToggle />
        <main className={getMainContentClass()}>
          {children}
        </main>
      </div>
    // </SidebarContext.Provider>
  );
};

export default Layout;