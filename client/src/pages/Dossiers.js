import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import DossierCard from '../components/DossierCard';
import DossierForm from '../components/DossierForm';

function Dossiers() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if URL has ?new=true to open form automatically
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('new') === 'true') {
      setShowForm(true);
    }
    fetchDossiers();
  }, [location]);

  const fetchDossiers = () => {
    setLoading(true);
    axios.get('/api/dossiers')
      .then(res => {
        const data = res.data.data || res.data;
        setDossiers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCreate = (data) => {
    setIsSubmitting(true);
    axios.post('/api/dossiers', data)
      .then(res => {
        setIsSubmitting(false);
        setShowForm(false);
        // Remove query param if present
        navigate('/dossiers', { replace: true });
        fetchDossiers();
      })
      .catch(err => {
        console.error(err);
        setIsSubmitting(false);
        alert('Erreur lors de la création du dossier');
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Tous les Dossiers</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Nouveau Dossier
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 style={{ marginBottom: '1rem' }}>Nouveau Dossier</h2>
          <DossierForm 
            onSubmit={handleCreate} 
            onCancel={() => {
              setShowForm(false);
              navigate('/dossiers', { replace: true });
            }}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {loading && !showForm ? (
        <div className="text-center" style={{ marginTop: '3rem' }}>Chargement...</div>
      ) : (
        <div className="grid grid-cols-2">
          {dossiers.map(dossier => (
            <DossierCard key={dossier._id} dossier={dossier} />
          ))}
        </div>
      )}

      {!loading && dossiers.length === 0 && !showForm && (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p>Vous n'avez pas encore de dossiers.</p>
        </div>
      )}
    </div>
  );
}

export default Dossiers;
