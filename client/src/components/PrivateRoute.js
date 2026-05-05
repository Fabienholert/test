/**
 * Composant pour protéger les routes (Désactivé temporairement).
 * Retourne directement les composants enfants sans vérification de token.
 */
const PrivateRoute = ({ children }) => {
  return children;
};

export default PrivateRoute;
