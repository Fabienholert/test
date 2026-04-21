import React, { useState, useEffect } from 'react';

function DossierForm({ initialData = {}, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    numero: '',
    client: '',
    vehicule: '',
    immatriculation: '',
    kilometrage: '',
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
        vehicule: initialData.vehicule || '',
        immatriculation: initialData.immatriculation || '',
        kilometrage: initialData.kilometrage || '',
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
          <label className="form-label">Véhicule (Marque / Modèle) *</label>
          <input 
            type="text" 
            name="vehicule"
            className="form-control"
            value={formData.vehicule} 
            onChange={handleChange} 
            placeholder="Ex: Peugeot 3008"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Immatriculation *</label>
          <input 
            type="text" 
            name="immatriculation"
            className="form-control"
            value={formData.immatriculation} 
            onChange={handleChange} 
            placeholder="Ex: AB-123-CD"
            required
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Kilométrage *</label>
          <input 
            type="number" 
            name="kilometrage"
            className="form-control"
            value={formData.kilometrage} 
            onChange={handleChange} 
            placeholder="Ex: 85000"
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
            <option value="En cours">En cours de réparation</option>
            <option value="Réparé">Réparé</option>
            <option value="Livré">Livré au client</option>
            <option value="Rejeté">Garantie refusée</option>
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
          placeholder="Décrivez le problème rencontré sur le véhicule..."
          rows="4"
        />
      </div>

      <div className="grid grid-cols-2">
        <div className="form-group">
          <label className="form-label">Montant de la réparation (€)</label>
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
          <label className="form-label">Date limite de garantie</label>
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
