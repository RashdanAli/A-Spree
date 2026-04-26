import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '../apollo';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const valid = isTokenValid();

  if (!valid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}