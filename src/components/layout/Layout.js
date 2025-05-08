import React from 'react';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div>
      <NavBar />
      <Sidebar />
      <ThemeToggle />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;