import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  onSuccess?: () => void;
}


const Layout: React.FC<LayoutProps> = ({ onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();


  console.log('Layout loaded, isAuthenticated:', isAuthenticated);

  if (location.pathname === '/auth') {
    return <Outlet />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: '16px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
