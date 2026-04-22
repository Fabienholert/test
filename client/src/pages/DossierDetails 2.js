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
    fetchDossier();
  }, [id]);

  const fetchDossier = () => {
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
  };

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

  return (
    <div>
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
              <p className="form-label">Client</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.client}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Appareil</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.appareil}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Statut</p>
              <h3 style={{ margin: 0, color: 'white' }}>{dossier.statut}</h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Date de création</p>
              <h3 style={{ margin: 0, color: 'white' }}>{new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</h3>
            </div>
            
            {dossier.prixReparation && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="form-label">Prix de réparation</p>
                <h3 style={{ margin: 0, color: 'var(--status-repare)' }}>{dossier.prixReparation} €</h3>
              </div>
            )}
            
            {dossier.dateFinGarantie && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="form-label">Fin de garantie</p>
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
