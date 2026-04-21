import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import { fr } from 'date-fns/locale/fr';
import "react-datepicker/dist/react-datepicker.css";

// Enregistrer la locale française
registerLocale('fr', fr);

function DossierForm({ initialData = {}, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    numero: '',
    client: '',
    vehicule: '',
    immatriculation: '',
    kilometrage: '',
    dateEntree: null,
    dateImpression: null,
    descriptionPanne: '',
    prixReparation: '',
    dateFinGarantie: null,
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
        dateEntree: initialData.dateEntree ? new Date(initialData.dateEntree) : null,
        dateImpression: initialData.dateImpression ? new Date(initialData.dateImpression) : null,
        descriptionPanne: initialData.descriptionPanne || '',
        prixReparation: initialData.prixReparation || '',
        dateFinGarantie: initialData.dateFinGarantie ? new Date(initialData.dateFinGarantie) : null,
        statut: initialData.statut || 'En attente'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fin de la journée pour la comparaison

    if (formData.dateEntree) {
      const entryDate = new Date(formData.dateEntree);
      
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      if (diffDays > 24) {
        alert("Erreur : la date d'entrée est supérieure de 24 jours à la date du jour. Veuillez obligatoirement refaire le dossier.");
        return;
      }
    }

    if (formData.dateImpression) {
      const printDate = new Date(formData.dateImpression);
      
      // La date d'impression ne peut pas être dans le futur
      if (printDate > today) {
        alert("Erreur : la date d'impression ne peut pas être une date future (après la date du jour).");
        return;
      }

      // La date d'impression ne peut pas être avant la date d'entrée
      if (formData.dateEntree) {
        const entryDate = new Date(formData.dateEntree);
        // On compare les dates pures (sans les heures)
        entryDate.setHours(0, 0, 0, 0);
        printDate.setHours(0, 0, 0, 0);
        
        if (printDate < entryDate) {
          alert("Erreur : la date d'impression ne peut pas être antérieure à la date d'entrée.");
          return;
        }
      }
    }

    // Format dates before submit if needed, or pass as Date objects
    // Axios will stringify Date objects to ISO string
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
      {/* Custom Styles for DatePicker to match the theme */}
      <style>
        {`
          .react-datepicker-wrapper { width: 100%; }
          .react-datepicker__input-container input {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            color: var(--text-main);
            font-family: inherit;
            font-size: 1rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .react-datepicker__input-container input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          }
        `}
      </style>

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
            disabled={!!initialData._id}
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
          <label className="form-label">Date d'entrée *</label>
          <DatePicker
            selected={formData.dateEntree}
            onChange={(date) => handleDateChange('dateEntree', date)}
            dateFormat="dd/MM/yyyy"
            locale="fr"
            placeholderText="Sélectionner une date"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date d'impression</label>
          <DatePicker
            selected={formData.dateImpression}
            onChange={(date) => handleDateChange('dateImpression', date)}
            dateFormat="dd/MM/yyyy"
            locale="fr"
            placeholderText="Sélectionner une date"
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
          <DatePicker
            selected={formData.dateFinGarantie}
            onChange={(date) => handleDateChange('dateFinGarantie', date)}
            dateFormat="dd/MM/yyyy"
            locale="fr"
            placeholderText="Sélectionner une date"
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
