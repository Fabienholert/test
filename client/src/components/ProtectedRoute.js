/**
 * Composant pour protéger les routes (Désactivé temporairement).
 * Retourne directement les composants enfants sans vérification de token.
 */
const ProtectedRoute = ({ children }) => {
  return children;
};

export default ProtectedRoute;
