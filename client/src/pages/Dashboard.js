import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DossierCard from '../components/DossierCard';

function Dashboard() {
  const [dossiers, setDossiers] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, enCours: 0, repares: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dossiers')
      .then(res => {
        const rawData = res.data.data || res.data;
        const data = Array.isArray(rawData) ? rawData : [];
        setDossiers(data.slice(0, 4)); // Only show 4 recent
        
        // Calculate stats
        const newStats = {
          total: data.length,
          enAttente: data.filter(d => d.statut === 'En attente').length,
          enCours: data.filter(d => d.statut === 'En cours').length,
          repares: data.filter(d => d.statut === 'Réparé').length
        };
        setStats(newStats);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center" style={{ marginTop: '3rem' }}>Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue sur votre espace de gestion des garanties.</p>
        </div>
        <Link to="/dossiers?new=true" className="btn btn-primary">
          + Nouveau Dossier
        </Link>
      </div>

      <div className="grid grid-cols-3 mb-8">
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Dossiers</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>{stats.total}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '4px solid var(--status-cours)' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>En Cours</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--status-cours)' }}>{stats.enCours}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '4px solid var(--status-repare)' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Réparés</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--status-repare)' }}>{stats.repares}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2>Dossiers Récents</h2>
        <Link to="/dossiers" style={{ color: 'var(--primary)', fontWeight: '500' }}>Voir tout →</Link>
      </div>

      <div className="grid grid-cols-2">
        {dossiers.map(dossier => (
          <DossierCard key={dossier._id} dossier={dossier} />
        ))}
      </div>
      {dossiers.length === 0 && (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p>Aucun dossier pour le moment.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
