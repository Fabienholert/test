import { Suspense, lazy } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading des pages pour optimiser le bundle initial
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Dossiers = lazy(() => import("./pages/Dossiers"));
const DossierDetails = lazy(() => import("./pages/DossierDetails"));

// Composant de chargement
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
    }}
  >
    <div style={{ fontSize: "18px", color: "#666" }}>Chargement...</div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className="container">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dossiers" element={<ProtectedRoute><Dossiers /></ProtectedRoute>} />
            <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetails /></ProtectedRoute>} />
          </Routes>
        </Suspense>
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
