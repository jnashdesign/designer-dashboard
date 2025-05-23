import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Layout.css';
// import { SidebarContext } from '../../context/SidebarContext';

const Layout = ({ children, onProjectCreated }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    if (!isLoggedIn && location.pathname === '/') return 'main-content closed-sidebar';
    return `main-content ${isSidebarCollapsed ? 'closed-sidebar' : 'open-sidebar'}`;
  };

  const toggleMobileSidebar = () => setIsMobileMenuOpen((open) => !open);

  return (
    // <SidebarContext.Provider value={{ collapseSidebar }}>
      <div>
        <NavBar onMobileMenuClick={toggleMobileSidebar} />
        {/* Sidebar logic: on homepage, only show if mobile menu is open; on other pages, show as before */}
        {isLoggedIn && (
          <Sidebar 
            onCollapse={setIsSidebarCollapsed}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            onProjectCreated={onProjectCreated}
          />
        )}
        <ThemeToggle />
        <main className={getMainContentClass()}>
          {children}
        </main>
      </div>
    // </SidebarContext.Provider>
  );
};

export default Layout;