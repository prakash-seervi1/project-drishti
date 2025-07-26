import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const accesscode = parseInt(localStorage.getItem('accesscode') || '0');
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Admin (accesscode 127) can access all pages
  if (accesscode === 127) {
    return <Outlet />;
  }

  // Responders (accesscode < 127) can only access incidents
  const allowedPaths = ['/incidents', '/incident/'];
  const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
  
  if (!isAllowedPath) {
    return <Navigate to="/incidents" replace />;
  }

  return <Outlet />;
} 