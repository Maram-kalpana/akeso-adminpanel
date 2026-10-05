import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="content">Loading session...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}
