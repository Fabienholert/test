import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Composant pour protéger les routes.
 * Redirige vers /login si aucun token n'est trouvé dans le localStorage.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Rediriger vers la page de connexion si pas de token
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
