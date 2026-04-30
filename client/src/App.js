import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Dossiers from './pages/Dossiers';
import DossierDetails from './pages/DossierDetails';
import LoginPage from './pages/LoginPage';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dossiers" element={<Dossiers />} />
          <Route path="/dossiers/:id" element={<DossierDetails />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
