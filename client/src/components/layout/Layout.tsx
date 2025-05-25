// Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  onSuccess?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onSuccess }) => {
  const { isAuthenticated } = useAuth();

  console.log('Layout loaded, isAuthenticated:', isAuthenticated);
  if (onSuccess) onSuccess();

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default Layout;
