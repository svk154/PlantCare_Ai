import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

/**
 * Protected route component that redirects unauthenticated users to the login page
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child component to render if authenticated
 * @param {boolean} props.requireAdmin - Whether the route requires admin privileges
 * @returns {React.Component} Protected component or redirect
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  // Removed unused state since we're using isLoading instead
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      // Load user profile if we need to check admin status
      if (requireAdmin) {
        const userData = await getCurrentUser();
        setUser(userData);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [requireAdmin]);

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname, message: "Please log in to access this page" }} />;
  }

  // Check admin status if required
  if (requireAdmin && (!user || !user.is_admin)) {
    return <Navigate to="/dashboard" state={{ message: "You don't have permission to access this page" }} />;
  }

  // User is authenticated, render the protected component
  return children;
}
