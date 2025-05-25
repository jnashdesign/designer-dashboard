import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import './Layout.css';
// import { SidebarContext } from '../../context/SidebarContext';

const Layout = ({ children, onProjectCreated }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        document.body.classList.add('isLoggedIn');
        // Fetch user role
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role);
        } else {
          setUserRole(null);
        }
      } else {
        document.body.classList.remove('isLoggedIn');
        setUserRole(null);
      }
    });
    return () => {
      unsubscribe();
      document.body.classList.remove('isLoggedIn');
    };
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
        {/* Unified Sidebar for both roles */}
        {isLoggedIn && (
          <Sidebar
            onCollapse={setIsSidebarCollapsed}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            onProjectCreated={onProjectCreated}
            userRole={userRole}
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