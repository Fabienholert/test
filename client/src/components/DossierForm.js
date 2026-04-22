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
    vin: '',
    marque: 'Volkswagen',
    modele: '',
    immatriculation: '',
    kilometrage: '',
    dateEntree: null,
    dateImpression: null,
    numDISS: '',
    isTPI: false,
    descriptionPanne: '',
    dateFinGarantie: null,
    statut: 'En attente'
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        numero: initialData.numero || '',
        vin: initialData.vin || '',
        marque: initialData.marque || 'Volkswagen',
        modele: initialData.modele || '',
        immatriculation: initialData.immatriculation || '',
        kilometrage: initialData.kilometrage || '',
        dateEntree: initialData.dateEntree ? new Date(initialData.dateEntree) : null,
        dateImpression: initialData.dateImpression ? new Date(initialData.dateImpression) : null,
        numDISS: initialData.numDISS || '',
        isTPI: initialData.isTPI || false,
        descriptionPanne: initialData.descriptionPanne || '',
        dateFinGarantie: initialData.dateFinGarantie ? new Date(initialData.dateFinGarantie) : null,
        statut: initialData.statut || 'En attente'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDateChange = (name, date) => {
    // Validation immédiate au clic sur le calendrier
    if (name === 'dateImpression' && date) {
      const printDate = new Date(date);
      printDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (printDate > today) {
        alert("Erreur : la date d'impression ne peut pas être une date future.");
        return; // Bloque la sélection
      }
      
      if (formData.dateEntree) {
        const entryDate = new Date(formData.dateEntree);
        entryDate.setHours(0, 0, 0, 0);
        
        if (printDate > entryDate) {
          alert("Erreur : la date d'impression ne peut pas être après la date d'entrée du véhicule.");
          return; // Bloque la sélection
        }
      }
    }

    if (name === 'dateEntree' && date && formData.dateImpression) {
      const newEntryDate = new Date(date);
      newEntryDate.setHours(0, 0, 0, 0);
      const printDate = new Date(formData.dateImpression);
      printDate.setHours(0, 0, 0, 0);
      
      if (printDate > newEntryDate) {
        alert("Erreur : la date d'impression déjà saisie serait après cette nouvelle date d'entrée.");
        return; // Bloque la sélection
      }
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: date };
      
      // Calcul automatique de la date de fin de validité (+24 jours)
      if (name === 'dateEntree' && date) {
        const finValidite = new Date(date);
        finValidite.setDate(finValidite.getDate() + 24);
        newData.dateFinGarantie = finValidite;
      }
      
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fin de la journée pour la comparaison

    // Validation des 24 jours : on compare la date d'entrée par rapport à la date de création du dossier 
    // (ou aujourd'hui s'il s'agit d'une création)
    if (formData.dateEntree) {
      const entryDate = new Date(formData.dateEntree);
      const referenceDate = initialData.dateCreation ? new Date(initialData.dateCreation) : new Date();
      
      const diffTime = referenceDate.getTime() - entryDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      if (diffDays > 24) {
        alert("Erreur : la date d'entrée est supérieure de 24 jours à la date de création. Veuillez obligatoirement refaire le dossier.");
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

      // La date d'impression ne peut pas être après la date d'entrée
      if (formData.dateEntree) {
        const entryDate = new Date(formData.dateEntree);
        // On compare les dates pures (sans les heures)
        entryDate.setHours(0, 0, 0, 0);
        printDate.setHours(0, 0, 0, 0);
        
        if (printDate > entryDate) {
          alert("Erreur : la date d'impression ne peut pas être après la date d'entrée du véhicule.");
          return;
        }
      }
    }

    // Format dates before submit if needed, or pass as Date objects
    // Axios will stringify Date objects to ISO string
    onSubmit(formData);
  };

  const getBrandColor = (marque) => {
    if (marque === 'Volkswagen') return '#0066cc';
    if (marque === 'SEAT' || marque === 'CUPRA') return '#e63946';
    if (marque === 'Škoda') return '#4ba82e';
    return '#6366f1';
  };

  const currentThemeColor = getBrandColor(formData.marque);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="glass-panel" 
      style={{ 
        padding: '2rem',
        '--primary': currentThemeColor,
        '--primary-hover': currentThemeColor,
      }}
    >
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
          <label className="form-label">VIN *</label>
          <input 
            type="text" 
            name="vin"
            className="form-control"
            value={formData.vin} 
            onChange={handleChange} 
            placeholder="Numéro d'identification du véhicule"
            required
            style={{ textTransform: 'uppercase' }}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Marque *</label>
          <select 
            name="marque" 
            className="form-control"
            value={formData.marque} 
            onChange={handleChange}
            required
          >
            <option value="Volkswagen">Volkswagen</option>
            <option value="SEAT">SEAT</option>
            <option value="CUPRA">CUPRA</option>
            <option value="Škoda">Škoda</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Modèle *</label>
          <input 
            type="text" 
            name="modele"
            className="form-control"
            value={formData.modele} 
            onChange={handleChange} 
            placeholder="Ex: Golf, Leon, Formentor..."
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
          <label className="form-label">Date du jour</label>
          <input 
            type="text" 
            className="form-control"
            value={new Date().toLocaleDateString('fr-FR')} 
            disabled
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'var(--text-muted)' }}
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
          <label className="form-label">N° DISS</label>
          <input
            type="text"
            name="numDISS"
            className="form-control"
            value={formData.numDISS}
            onChange={handleChange}
            placeholder="Ex: DISS-2024-001"
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label className="form-label" style={{ margin: 0 }}>TPI ?</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              name="isTPI"
              checked={formData.isTPI}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ color: formData.isTPI ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.isTPI ? '600' : '400', transition: 'color 0.2s' }}>
              {formData.isTPI ? 'Oui — TPI confirmé' : 'Non'}
            </span>
          </label>
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
          <label className="form-label">Date de fin de validité (24j)</label>
          <DatePicker
            selected={formData.dateFinGarantie}
            onChange={(date) => handleDateChange('dateFinGarantie', date)}
            dateFormat="dd/MM/yyyy"
            locale="fr"
            placeholderText="Calculée automatiquement"
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
