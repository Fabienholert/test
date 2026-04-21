import React from 'react';
import { Link } from 'react-router-dom';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'En attente': return 'badge-attente';
    case 'En cours': return 'badge-cours';
    case 'Réparé': return 'badge-repare';
    case 'Livré': return 'badge-livre';
    case 'Rejeté': return 'badge-rejete';
    default: return 'badge-attente';
  }
};

function DossierCard({ dossier }) {
  return (
    <Link to={`/dossiers/${dossier._id}`} className="glass-panel" style={{ display: 'block', padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ margin: 0, color: 'white' }}>{dossier.numero}</h3>
        <span className={`badge ${getStatusBadgeClass(dossier.statut)}`}>
          {dossier.statut}
        </span>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>VIN:</span> 
          <span style={{ color: 'white' }}>{dossier.vin}</span>
        </p>
        <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Véhicule:</span> 
          <span style={{ color: 'white' }}>{dossier.vehicule}</span>
        </p>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Immat:</span> 
          <span style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', letterSpacing: '1px' }}>{dossier.immatriculation}</span>
        </p>
      </div>
      <div className="flex justify-between items-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
        </span>
        <span style={{ color: 'var(--primary)', fontWeight: '500' }}>
          Voir détails →
        </span>
      </div>
    </Link>
  );
}

export default DossierCard;
