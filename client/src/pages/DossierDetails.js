import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import DossierForm from '../components/DossierForm';

function DossierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/api/dossiers/${id}`)
      .then(res => {
        setDossier(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert('Dossier non trouvé');
        navigate('/dossiers');
      });
  }, [id, navigate]);

  const handleUpdate = (data) => {
    setIsSubmitting(true);
    axios.put(`/api/dossiers/${id}`, data)
      .then(res => {
        setDossier(res.data);
        setIsEditing(false);
        setIsSubmitting(false);
      })
      .catch(err => {
        console.error(err);
        setIsSubmitting(false);
        alert('Erreur lors de la mise à jour');
      });
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.')) {
      axios.delete(`/api/dossiers/${id}`)
        .then(() => {
          navigate('/dossiers');
        })
        .catch(err => {
          console.error(err);
          alert('Erreur lors de la suppression');
        });
    }
  };

  if (loading) return <div className="text-center" style={{ marginTop: '3rem' }}>Chargement...</div>;
  if (!dossier) return null;

  const getBrandColor = (marque) => {
    if (marque === 'Volkswagen') return '#0066cc';
    if (marque === 'SEAT' || marque === 'CUPRA') return '#e63946';
    if (marque === 'Škoda') return '#4ba82e';
    return '#6366f1';
  };

  const currentThemeColor = getBrandColor(dossier.marque);

  return (
    <div style={{ '--primary': currentThemeColor, '--primary-hover': currentThemeColor }}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            ← Retour
          </button>
          <h1 style={{ margin: 0 }}>Dossier {dossier.numero}</h1>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              Modifier
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Supprimer
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <DossierForm 
          initialData={dossier} 
          onSubmit={handleUpdate} 
          onCancel={() => setIsEditing(false)}
          isLoading={isSubmitting}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="grid grid-cols-2">
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">VIN</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.vin}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Marque</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.marque}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Modèle</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.modele}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Immatriculation</p>
              <h3 style={{ margin: 0, color: 'white', background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{dossier.immatriculation}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Kilométrage</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.kilometrage} km</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Date d'entrée</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.dateEntree ? new Date(dossier.dateEntree).toLocaleDateString('fr-FR') : 'Non renseignée'}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Date du jour (Création)</p>
              <h3 style={{ margin: 0, color: 'white' }}>{new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Date d'impression</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.dateImpression ? new Date(dossier.dateImpression).toLocaleDateString('fr-FR') : 'Non imprimé'}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">N° DISS</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.numDISS || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Non renseigné</span>}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">TPI</p>
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontWeight: '600',
                fontSize: '0.85rem',
                background: dossier.isTPI ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)',
                color: dossier.isTPI ? '#a5b4fc' : 'var(--text-muted)',
                border: dossier.isTPI ? '1px solid #6366f1' : '1px solid var(--border-color)'
              }}>
                {dossier.isTPI ? '✔ TPI confirmé' : 'Non TPI'}
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Statut</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.statut}</h3>
            </div>
            
            {dossier.dateFinGarantie && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="form-label">Fin de validité</p>
                <h3 style={{ margin: 0, color: 'white' }}>{new Date(dossier.dateFinGarantie).toLocaleDateString('fr-FR')}</h3>
              </div>
            )}
          </div>
          
          {dossier.descriptionPanne && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <p className="form-label">Description de la panne</p>
              <p style={{ color: 'white', whiteSpace: 'pre-wrap' }}>{dossier.descriptionPanne}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DossierDetails;
