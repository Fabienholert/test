import React, { useState, useEffect } from 'react';

function DossierForm({ initialData = {}, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    numero: '',
    client: '',
    appareil: '',
    descriptionPanne: '',
    prixReparation: '',
    dateFinGarantie: '',
    statut: 'En attente'
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        numero: initialData.numero || '',
        client: initialData.client || '',
        appareil: initialData.appareil || '',
        descriptionPanne: initialData.descriptionPanne || '',
        prixReparation: initialData.prixReparation || '',
        dateFinGarantie: initialData.dateFinGarantie ? new Date(initialData.dateFinGarantie).toISOString().split('T')[0] : '',
        statut: initialData.statut || 'En attente'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
      <div className="grid grid-cols-2">
        <div className="form-group">
          <label className="form-label">Numéro de Dossier *</label>
          <input 
            type="text" 
            name="numero"
            className="form-control"
            value={formData.numero} 
            onChange={handleChange} 
            placeholder="Ex: DOS-2023-001"
            required
            disabled={!!initialData._id} // Disable if editing
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Client *</label>
          <input 
            type="text" 
            name="client"
            className="form-control"
            value={formData.client} 
            onChange={handleChange} 
            placeholder="Nom complet du client"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Appareil *</label>
          <input 
            type="text" 
            name="appareil"
            className="form-control"
            value={formData.appareil} 
            onChange={handleChange} 
            placeholder="Modèle de l'appareil (ex: iPhone 13 Pro)"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Statut</label>
          <select 
            name="statut" 
            className="form-control"
            value={formData.statut} 
            onChange={handleChange}
          >
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Réparé">Réparé</option>
            <option value="Livré">Livré</option>
            <option value="Rejeté">Rejeté</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description de la panne</label>
        <textarea 
          name="descriptionPanne"
          className="form-control"
          value={formData.descriptionPanne} 
          onChange={handleChange} 
          placeholder="Décrivez le problème rencontré..."
          rows="4"
        />
      </div>

      <div className="grid grid-cols-2">
        <div className="form-group">
          <label className="form-label">Prix de la réparation (€)</label>
          <input 
            type="number" 
            name="prixReparation"
            className="form-control"
            value={formData.prixReparation} 
            onChange={handleChange} 
            placeholder="0.00"
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Date fin de garantie</label>
          <input 
            type="date" 
            name="dateFinGarantie"
            className="form-control"
            value={formData.dateFinGarantie} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Annuler
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginLeft: 'auto' }}>
          {isLoading ? 'Enregistrement...' : (initialData._id ? 'Mettre à jour' : 'Créer le dossier')}
        </button>
      </div>
    </form>
  );
}

export default DossierForm;
