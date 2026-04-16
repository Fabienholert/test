import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // Nous allons créer ce fichier juste après

// Pour l'instant, on simule que l'utilisateur n'est pas authentifié.
// Plus tard, nous lirons le token depuis le localStorage.
const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token'); 
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />
                {/* Rediriger toute autre route non reconnue vers la page d'accueil (ou de connexion) */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
