import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole, UserRole } from '../../context/RoleContext';
import { getRoleHomeRoute } from '../../utils/roleRoutes';

interface RoleRouteGuardProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, currentRole } = useRole();
  const location = useLocation();

  const activeRole: UserRole = (user?.role as UserRole) || currentRole || 'CITIZEN';

  // If the route only allows authorities (not CITIZEN) and user is not authenticated:
  const requiresAuth = !allowedRoles.includes('CITIZEN');
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not allowed for this route:
  const isAllowed = allowedRoles.includes(activeRole) || 
    (allowedRoles.includes('MINISTRY_ADMIN') && activeRole === 'MINISTRY_OFFICIAL') ||
    (allowedRoles.includes('AUDITOR') && (activeRole as string) === 'ANALYST');

  if (!isAllowed) {
    // Seamlessly forward to their legitimate workspace without rendering locked screen
    const home = getRoleHomeRoute(activeRole);
    return <Navigate to={home} replace />;
  }

  return children;
};
