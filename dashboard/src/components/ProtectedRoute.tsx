import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../apollo';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const valid = isTokenValid();

  if (!valid) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}