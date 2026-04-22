import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import { fr } from 'date-fns/locale/fr';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

// Enregistrer la locale française
registerLocale('fr', fr);

function DossierForm({ initialData = {}, onSubmit, onCancel, isLoading }) {
  const [damagesList, setDamagesList] = useState([]);
  const [filteredDamages, setFilteredDamages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    numero: '',
    vin: '',
    marque: 'Volkswagen',
    modele: '',
    immatriculation: '',
    kilometrage: '',
    dateEntree: null,
    dateImpression: null,
    isDISS: false,
    numDISS: '',
    isTPI: false,
    numTPI: '',
    descriptionPanne: '',
    dateFinGarantie: null,
    hasFichePedagogique: false,
    isPointageVerifie: false,
    nomTechnicien: '',
    dommage: '',
    libelleDommage: '',
    statut: 'En attente'
  });
  const [ficheFile, setFicheFile] = useState(null);

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
        isDISS: initialData.isDISS || false,
        numDISS: initialData.numDISS || '',
        isTPI: initialData.isTPI || false,
        numTPI: initialData.numTPI || '',
        descriptionPanne: initialData.descriptionPanne || '',
        dateFinGarantie: initialData.dateFinGarantie ? new Date(initialData.dateFinGarantie) : null,
        hasFichePedagogique: initialData.hasFichePedagogique || false,
        isPointageVerifie: initialData.isPointageVerifie || false,
        nomTechnicien: initialData.nomTechnicien || '',
        dommage: initialData.dommage || '',
        libelleDommage: initialData.libelleDommage || '',
        statut: initialData.statut || 'En attente'
      });
      setFicheFile(null);
    }
  }, [initialData]);

  useEffect(() => {
    axios.get('/api/references/damages')
      .then(res => {
        console.log('Dommages chargés:', res.data.length);
        setDamagesList(res.data);
      })
      .catch(err => console.error('Erreur chargement dommages:', err));
  }, []);

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
  
  const handleFileChange = (e) => {
    setFicheFile(e.target.files[0]);
  };

  const handleLibelleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, libelleDommage: value }));
    
    if (value.length >= 2) {
      const filtered = damagesList.filter(d => 
        d.label.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setFilteredDamages(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectDamage = (d) => {
    setFormData(prev => ({ 
      ...prev, 
      libelleDommage: d.label,
      dommage: d.code
    }));
    setShowSuggestions(false);
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

    // Axios handles FormData correctly (sets multipart/form-data)
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        // Handle dates: send as ISO string
        if (formData[key] instanceof Date) {
          submitData.append(key, formData[key].toISOString());
        } else {
          submitData.append(key, formData[key]);
        }
      }
    });
    
    if (ficheFile) {
      submitData.append('fichePedagogiqueFile', ficheFile);
    }

    onSubmit(submitData);
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

        {/* DISS */}
        <div className="form-group">
          <label className="form-label">DISS ?</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none', marginBottom: formData.isDISS ? '0.75rem' : 0 }}>
            <input
              type="checkbox"
              name="isDISS"
              checked={formData.isDISS}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ color: formData.isDISS ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.isDISS ? '600' : '400', transition: 'color 0.2s' }}>
              {formData.isDISS ? 'Oui — DISS confirmé' : 'Non'}
            </span>
          </label>
          {formData.isDISS && (
            <input
              type="text"
              name="numDISS"
              className="form-control"
              value={formData.numDISS}
              onChange={handleChange}
              placeholder="N° DISS (ex: DISS-2024-001)"
            />
          )}
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">Libellé Dommage</label>
          <input 
            type="text" 
            name="libelleDommage"
            className="form-control"
            value={formData.libelleDommage} 
            onChange={handleLibelleChange} 
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => {
              if (formData.libelleDommage && formData.libelleDommage.length >= 2) setShowSuggestions(true);
            }}
            placeholder="Rechercher un dommage..."
            autoComplete="off"
          />
          {showSuggestions && filteredDamages.length > 0 && (
            <div className="glass-panel" style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              zIndex: 100, 
              maxHeight: '200px', 
              overflowY: 'auto',
              marginTop: '5px',
              padding: '0.5rem 0'
            }}>
              {filteredDamages.map((d, i) => (
                <div 
                  key={i} 
                  onClick={() => selectDamage(d)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderBottom: i < filteredDamages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <div style={{ color: 'white', fontSize: '0.9rem' }}>{d.label}</div>
                  <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600' }}>Code: {d.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Code Dommage</label>
          <input 
            type="text" 
            name="dommage"
            className="form-control"
            value={formData.dommage} 
            onChange={handleChange} 
            placeholder="Code auto-rempli"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          />
        </div>

        {/* TPI */}
        <div className="form-group">
          <label className="form-label">TPI ?</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none', marginBottom: formData.isTPI ? '0.75rem' : 0 }}>
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
          {formData.isTPI && (
            <input
              type="text"
              name="numTPI"
              className="form-control"
              value={formData.numTPI}
              onChange={handleChange}
              placeholder="N° TPI (ex: TPI-2024-001)"
            />
          )}
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

        {/* Fiche Pédagogique */}
        <div className="form-group">
          <label className="form-label">Fiche Pédagogique ?</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none', marginBottom: formData.hasFichePedagogique ? '0.75rem' : 0 }}>
            <input
              type="checkbox"
              name="hasFichePedagogique"
              checked={formData.hasFichePedagogique}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ color: formData.hasFichePedagogique ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.hasFichePedagogique ? '600' : '400', transition: 'color 0.2s' }}>
              {formData.hasFichePedagogique ? 'Oui — Fiche présente' : 'Non'}
            </span>
          </label>
          {formData.hasFichePedagogique && (
            <div className="file-upload-container" style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)'
            }}>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {initialData.fichePedagogiqueUrl ? 'Remplacer le fichier actuel' : 'Joindre la fiche pédagogique (PDF, Image...)'}
              </p>
            </div>
          )}
        </div>

        {/* Pointage Technicien */}
        <div className="form-group">
          <label className="form-label">Pointage Technicien ?</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none', marginBottom: formData.isPointageVerifie ? '0.75rem' : 0 }}>
            <input
              type="checkbox"
              name="isPointageVerifie"
              checked={formData.isPointageVerifie}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ color: formData.isPointageVerifie ? 'var(--primary)' : 'var(--text-muted)', fontWeight: formData.isPointageVerifie ? '600' : '400', transition: 'color 0.2s' }}>
              {formData.isPointageVerifie ? 'Pointage vérifié' : 'Non vérifié'}
            </span>
          </label>
          {formData.isPointageVerifie && (
            <input
              type="text"
              name="nomTechnicien"
              className="form-control"
              value={formData.nomTechnicien}
              onChange={handleChange}
              placeholder="Nom du technicien"
            />
          )}
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
