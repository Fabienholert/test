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
  const getBrandColor = (marque) => {
    if (marque === 'Volkswagen') return '#0066cc';
    if (marque === 'SEAT' || marque === 'CUPRA') return '#e63946';
    if (marque === 'Škoda') return '#4ba82e';
    return '#6366f1';
  };

  const brandColor = getBrandColor(dossier.marque);

  return (
    <Link 
      to={`/dossiers/${dossier._id}`} 
      className="glass-panel" 
      style={{ 
        display: 'block', 
        padding: '1.5rem', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '--primary': brandColor,
        '--shadow-glow': `0 0 20px ${brandColor}40` // Ajout d'une lueur aux couleurs de la marque au survol
      }}
    >
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
          <span style={{ color: 'white' }}>{dossier.marque} {dossier.modele}</span>
        </p>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Immat:</span> 
          <span style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', letterSpacing: '1px' }}>{dossier.immatriculation}</span>
        </p>
        {dossier.numDISS && (
          <p style={{ margin: '0.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>DISS:</span>
            <span style={{ color: 'white' }}>{dossier.numDISS}</span>
          </p>
        )}
      </div>
      <div className="flex justify-between items-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {dossier.isTPI && (
            <span style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid #6366f1', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>TPI</span>
          )}
          <span style={{ color: 'var(--primary)', fontWeight: '500' }}>Voir détails →</span>
        </div>
      </div>
    </Link>
  );
}

export default DossierCard;
