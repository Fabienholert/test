import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import { fr } from 'date-fns/locale/fr';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { performClientSideOCR, parseDossierText } from '../utils/ocrClient';

// Enregistrer la locale française
registerLocale('fr', fr);

function DossierForm({ initialData = {}, onSubmit, onCancel, isLoading }) {
  const [damagesList, setDamagesList] = useState([]);

  const [formData, setFormData] = useState({
    numero: '',
    vin: '',
    marque: 'Volkswagen',
    modele: '',
    lettreMoteur: '',
    typeVehicule: '',
    immatriculation: '',
    kilometrage: '',
    dateEntree: null,
    dateImpression: null,
    typeDossier: 'Garantie',
    isDISS: false,
    numDISS: [],
    isTPI: false,
    numTPI: '',
    descriptionPanne: '',
    dateFinGarantie: null,
    hasFichePedagogique: false,
    isPointageVerifie: false,
    nomTechnicien: '',
    dommage: '',
    libelleDommage: '',
    statut: 'En attente',
    numeroMCQ: '',
    critere: '',
    pieces: '',
    mainOeuvre: '',
    lastExtractedText: ''
  });
  const [ficheFile, setFicheFile] = useState(null);
  const [ficheMCQFile, setFicheMCQFile] = useState(null);
  const [documentPdfFile, setDocumentPdfFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        numero: initialData.numero || '',
        vin: initialData.vin || '',
        marque: initialData.marque || 'Volkswagen',
        modele: initialData.modele || '',
        lettreMoteur: initialData.lettreMoteur || '',
        typeVehicule: initialData.typeVehicule || '',
        immatriculation: initialData.immatriculation || '',
        kilometrage: initialData.kilometrage || '',
        dateEntree: initialData.dateEntree ? new Date(initialData.dateEntree) : null,
        dateImpression: initialData.dateImpression ? new Date(initialData.dateImpression) : null,
        typeDossier: initialData.typeDossier || 'Garantie',
        isDISS: initialData.isDISS || false,
        numDISS: Array.isArray(initialData.numDISS) ? initialData.numDISS : (initialData.numDISS ? [initialData.numDISS] : []),
        isTPI: initialData.isTPI || false,
        numTPI: initialData.numTPI || '',
        descriptionPanne: initialData.descriptionPanne || '',
        dateFinGarantie: initialData.dateFinGarantie ? new Date(initialData.dateFinGarantie) : null,
        hasFichePedagogique: initialData.hasFichePedagogique || false,
        isPointageVerifie: initialData.isPointageVerifie || false,
        nomTechnicien: initialData.nomTechnicien || '',
        dommage: initialData.dommage || '',
        libelleDommage: initialData.libelleDommage || '',
        statut: initialData.statut || 'En attente',
        numeroMCQ: initialData.numeroMCQ || '',
        critere: initialData.critere || '',
        pieces: initialData.pieces || '',
        mainOeuvre: initialData.mainOeuvre || ''
      });
      setFicheFile(null);
      setFicheMCQFile(null);
      setDocumentPdfFile(null);
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
    const { name, files } = e.target;
    if (name === 'fichePedagogiqueFile') {
      setFicheFile(files[0]);
    } else if (name === 'ficheMCQFile') {
      setFicheMCQFile(files[0]);
    } else if (name === 'documentPdfFile') {
      setDocumentPdfFile(files[0]);
    }
  };
  
  const handleAnalyzePDF = async () => {
    if (!documentPdfFile) {
      setStatusMessage({ type: 'error', text: "Veuillez d'abord sélectionner un fichier PDF." });
      return;
    }
    
    setStatusMessage({ type: 'success', text: "Lancement de l'analyse OCR locale (peut prendre 10-20s)..." });
    
    setIsAnalyzing(true);
    setFormData(prev => ({ ...prev, lastExtractedText: '' }));
    
    try {
      // Analyse dans le navigateur pour supporter les PDFs scannés
      const text = await performClientSideOCR(documentPdfFile);
      console.log('Texte extrait (Frontend):', text);
      const data = parseDossierText(text);
      console.log('Données extraites:', data);

      setFormData(prev => ({
        ...prev,
        numero: data.numero || prev.numero,
        marque: data.marque || prev.marque,
        vin: data.vin || prev.vin,
        immatriculation: data.immatriculation || prev.immatriculation,
        kilometrage: data.kilometrage || prev.kilometrage,
        lettreMoteur: data.lettreMoteur || prev.lettreMoteur,
        typeVehicule: data.typeVehicule || prev.typeVehicule,
        dateEntree: data.dateEntree ? new Date(data.dateEntree.split('/').reverse().join('-')) : prev.dateEntree,
        dateImpression: data.dateImpression ? new Date(data.dateImpression.split('/').reverse().join('-')) : prev.dateImpression,
        isDISS: data.isDISS || prev.isDISS,
        numDISS: data.numDISS && data.numDISS.length > 0 ? data.numDISS : prev.numDISS,
        descriptionPanne: data.descriptionPanne || prev.descriptionPanne,
        lastExtractedText: text
      }));
      
      const foundFields = [];
      if (data.numero) foundFields.push('OR N°');
      if (data.dateImpression) foundFields.push('Date Impression');
      if (data.vin) foundFields.push('Châssis');
      if (data.numDISS) foundFields.push('DISS');
      if (data.immatriculation) foundFields.push('Immat');
      if (data.kilometrage) foundFields.push('KM');
      if (data.lettreMoteur) foundFields.push('Moteur');
      if (data.typeVehicule) foundFields.push('Type');
      if (data.dateEntree) foundFields.push('Date');

      setStatusMessage({ 
        type: 'success', 
        text: foundFields.length > 0 
          ? `Analyse terminée ! Champs détectés : ${foundFields.join(', ')}.` 
          : "Analyse terminée, mais aucune information n'a été détectée. Veuillez vérifier la qualité du document."
      });
    } catch (err) {
      console.error('Erreur OCR Frontend:', err);
      let errorDetail = "Erreur d'analyse locale.";
      if (err.message?.includes('worker')) errorDetail = "Erreur de chargement du moteur PDF (Vérifiez votre connexion internet).";
      
      setStatusMessage({ type: 'error', text: `${errorDetail} Tentative via le serveur...` });
      
      // Fallback vers le serveur
      const formData = new FormData();
      formData.append('documentPdfFile', documentPdfFile);
      
      try {
        const res = await axios.post('/api/dossiers/analyze', formData);
        const data = res.data;
        
        setFormData(prev => ({
          ...prev,
          vin: data.vin || prev.vin,
          immatriculation: data.immatriculation || prev.immatriculation,
          kilometrage: data.kilometrage || prev.kilometrage,
          dateEntree: data.dateEntree ? new Date(data.dateEntree.split('/').reverse().join('-')) : prev.dateEntree
        }));
        setStatusMessage({ type: 'success', text: "Analyse serveur terminée." });
      } catch (serverErr) {
        console.error(serverErr);
        setStatusMessage({ type: 'error', text: "Toutes les méthodes d'analyse ont échoué. Veuillez remplir les champs manuellement." });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeMCQ = async () => {
    if (!ficheMCQFile) {
      setStatusMessage({ type: 'error', text: "Veuillez d'abord sélectionner un fichier MCQ (PDF)." });
      return;
    }
    
    if (!formData.critere) {
      setStatusMessage({ type: 'error', text: "Veuillez renseigner le critère avant d'analyser la fiche MCQ." });
      return;
    }

    setStatusMessage({ type: 'success', text: "Lancement de l'analyse OCR de la fiche MCQ..." });
    setIsAnalyzing(true);
    setFormData(prev => ({ ...prev, lastExtractedText: '' }));

    let extractedText = '';

    try {
      extractedText = await performClientSideOCR(ficheMCQFile);
      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error('Texte extrait vide');
      }
    } catch (err) {
      console.log('Fallback serveur pour le PDF MCQ...');
      const formDataUpload = new FormData();
      formDataUpload.append('ficheMCQFile', ficheMCQFile);
      try {
        const res = await axios.post('/api/dossiers/analyzeMCQ', formDataUpload);
        extractedText = res.data.text || '';
      } catch (serverErr) {
        setStatusMessage({ type: 'error', text: "Impossible de lire le fichier PDF (localement et serveur)." });
        setIsAnalyzing(false);
        return;
      }
    }

    console.log('Texte MCQ extrait:', extractedText);
    
    // Extraction basée sur les règles métier spécifiques
    let foundCode = '';
    let foundPieces = '';
    let foundMO = '';
    
    // 1. Recherche de la "mesure qualité" (Code avarie) - 4 caractères
    // On cherche "mesure qualité" suivi de 4 caractères alphanumériques
    const mqMatch = extractedText.match(/mesure\s*(?:de\s*)?qualit[éèe]\s*[:\-]?\s*([A-Z0-9]{4})\b/i);
    if (mqMatch) {
      foundCode = mqMatch[1];
    } else {
      // Fallback si écrit différemment
      const fallbackAvarieMatch = extractedText.match(/(?:code(?:\s*d['']?avarie)?|action|campagne)\s*[:\-]?\s*([A-Z0-9]{4})\b/i);
      if (fallbackAvarieMatch) foundCode = fallbackAvarieMatch[1];
    }
    
    // 2. Recherche par critère pour la Main d'œuvre et les Pièces
    const lines = extractedText.split('\n');
    let inDirectiveFacture = false;
    let inPiecesOrigine = false;

    // Le critère saisi par l'utilisateur (on s'assure de le chercher comme un mot complet)
    const critereRegex = new RegExp(`\\b${formData.critere}\\b`, 'i');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Détection des sections en fonction des mots clés
      if (line.includes('directive de facture') || line.includes('activité')) {
        inDirectiveFacture = true;
        inPiecesOrigine = false;
      } else if (line.includes('pièces d\'origine') || line.includes('pièces requises')) {
        inPiecesOrigine = true;
        inDirectiveFacture = false;
      }

      // Si la ligne contient le critère recherché
      if (critereRegex.test(line)) {
        
        // Si on est dans la section "Directive de facture" (Activité) -> Main d'Oeuvre
        if (inDirectiveFacture || line.includes('activité')) {
          // On regarde la ligne actuelle et la suivante pour trouver le code (souvent 6 à 8 caractères) et le temps
          const context = lines.slice(i, i + 2).join(' ');
          const activiteMatch = context.match(/\b([A-Z0-9]{6,8})\b/i);
          const tempsMatch = context.match(/\b(\d+[,.]\d{2})\b/);
          
          if (activiteMatch && activiteMatch[1].toLowerCase() !== formData.critere.toLowerCase() && !foundMO) {
            foundMO = activiteMatch[1].toUpperCase();
            if (tempsMatch) foundMO += ` (${tempsMatch[1]} UT)`;
          }
        }
        
        // Si on est dans la section "Pièces d'origine" -> Pièces
        if (inPiecesOrigine) {
          // On cherche une référence de pièce classique du groupe VAG (ex: 5Q0 123 456 A)
          // ou une simple suite de chiffres/lettres
          const context = lines.slice(i, i + 2).join(' ');
          const pieceMatch = context.match(/\b([A-Z0-9]{3}\s?[A-Z0-9]{3}\s?[A-Z0-9]{3}(?:\s?[A-Z]{1,2})?)\b/i);
          
          if (pieceMatch && pieceMatch[1].toLowerCase() !== formData.critere.toLowerCase() && !foundPieces) {
            foundPieces = pieceMatch[1].toUpperCase().trim();
          } else if (!foundPieces) {
            // Fallback si la pièce a un format différent
            const words = lines[i].split(/\s+/);
            const potentialPiece = words.find(w => w.length > 5 && w.match(/[A-Z0-9]/i) && w.toLowerCase() !== formData.critere.toLowerCase());
            if (potentialPiece) foundPieces = potentialPiece.toUpperCase();
          }
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      dommage: foundCode || prev.dommage,
      pieces: foundPieces || prev.pieces,
      mainOeuvre: foundMO || prev.mainOeuvre,
      lastExtractedText: extractedText
    }));

    const foundFields = [];
    if (foundCode) foundFields.push('Code Avarie');
    if (foundPieces) foundFields.push('Pièces');
    if (foundMO) foundFields.push('Main d\'oeuvre');

    setStatusMessage({ 
      type: 'success', 
      text: foundFields.length > 0 
        ? `Analyse MCQ terminée ! Champs détectés : ${foundFields.join(', ')}.` 
        : "Le texte a bien été lu, mais aucune information n'a été trouvée pour ce critère (vérifiez la vue 'Texte extrait')."
    });

    setIsAnalyzing(false);
  };

  const handleLibelleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, libelleDommage: value }));
    
    // Si on trouve un match exact dans la liste, on remplit le code automatiquement
    const match = damagesList.find(d => d.label === value);
    if (match) {
      setFormData(prev => ({ ...prev, dommage: match.code }));
    }
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
    if (ficheMCQFile) {
      submitData.append('ficheMCQFile', ficheMCQFile);
    }
    if (documentPdfFile) {
      submitData.append('documentPdfFile', documentPdfFile);
    }

    onSubmit(submitData);
  };

  const getBrandColor = (marque) => {
    if (marque === 'Volkswagen') return '#0066cc';
    if (marque === 'SEAT' || marque === 'CUPRA') return '#f97316'; // Orange premium
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
      <style>
        {`
          .status-banner {
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: slideDown 0.3s ease-out;
          }
          @keyframes slideDown {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .status-banner.success {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #34d399;
          }
          .status-banner.error {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
          }
          .close-btn {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0.7;
          }
          .close-btn:hover { opacity: 1; }
          
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

      {statusMessage && (
        <div className={`status-banner ${statusMessage.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>{statusMessage.type === 'success' ? '✅' : '❌'}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button type="button" className="close-btn" onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* Affichage du texte extrait pour vérification */}
      {formData.lastExtractedText && (
        <div className="glass-panel" style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem'
        }}>
          <details>
            <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}>
              📄 Voir le texte extrait du document ({formData.lastExtractedText.length} caractères)
            </summary>
            <div style={{ 
              marginTop: '1rem', 
              maxHeight: '200px', 
              overflowY: 'auto', 
              padding: '0.5rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              color: 'var(--text-muted)'
            }}>
              {formData.lastExtractedText}
            </div>
          </details>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <label className="form-label">Type de dossier *</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="typeDossier"
              value="Garantie"
              checked={formData.typeDossier === 'Garantie'}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontWeight: formData.typeDossier === 'Garantie' ? '600' : '400' }}>Garantie</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="typeDossier"
              value="MCQ"
              checked={formData.typeDossier === 'MCQ'}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontWeight: formData.typeDossier === 'MCQ' ? '600' : '400' }}>MCQ (Rappel)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="form-group">
          <label className="form-label">OR N° *</label>
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
          <label className="form-label">Châssis *</label>
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
          <label className="form-label">Lettre Moteur</label>
          <input 
            type="text" 
            name="lettreMoteur"
            className="form-control"
            value={formData.lettreMoteur} 
            onChange={handleChange} 
            placeholder="Ex: CXXB, DADA..."
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <input 
            type="text" 
            name="typeVehicule"
            className="form-control"
            value={formData.typeVehicule} 
            onChange={handleChange} 
            placeholder="Ex: 5G1, 5F1..."
            style={{ textTransform: 'uppercase' }}
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

        {formData.typeDossier === 'Garantie' && (
          <>
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
                  {formData.isDISS ? `Oui — ${formData.numDISS.length} DISS` : 'Non'}
                </span>
              </label>
              {formData.isDISS && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(formData.numDISS.length > 0 ? formData.numDISS : ['']).map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={d}
                        onChange={e => {
                          const updated = [...formData.numDISS];
                          updated[i] = e.target.value.toUpperCase();
                          setFormData(prev => ({ ...prev, numDISS: updated }));
                        }}
                        placeholder={`N° DISS ${i + 1} (ex: DISS-2024-00${i + 1})`}
                        style={{ flex: 1, textTransform: 'uppercase' }}
                      />
                      <button type="button" onClick={() => {
                        const updated = formData.numDISS.filter((_, idx) => idx !== i);
                        setFormData(prev => ({ ...prev, numDISS: updated, isDISS: updated.length > 0 }));
                      }} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: '6px', padding: '0.4rem 0.7rem', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, numDISS: [...prev.numDISS, ''] }))} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', alignSelf: 'flex-start' }}>+ Ajouter un DISS</button>
                </div>
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
                list="damages-list"
                placeholder="Tapez pour rechercher un dommage..."
                autoComplete="off"
              />
              <datalist id="damages-list">
                {damagesList.map((d, i) => (
                  <option key={i} value={d.label}>{d.code}</option>
                ))}
              </datalist>
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
          </>
        )}

        {formData.typeDossier === 'MCQ' && (
          <>
            <div className="form-group">
              <label className="form-label">Numéro MCQ *</label>
              <input 
                type="text" 
                name="numeroMCQ"
                className="form-control"
                value={formData.numeroMCQ} 
                onChange={handleChange} 
                placeholder="Ex: MCQ-2024-001"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Critère *</label>
              <input 
                type="text" 
                name="critere"
                className="form-control"
                value={formData.critere} 
                onChange={handleChange} 
                placeholder="Critère du rappel (ex: 01)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Code Avarie</label>
              <input 
                type="text" 
                name="dommage"
                className="form-control"
                value={formData.dommage} 
                onChange={handleChange} 
                placeholder="Ex: 93E9"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Référence des Pièces</label>
              <input 
                type="text" 
                name="pieces"
                className="form-control"
                value={formData.pieces} 
                onChange={handleChange} 
                placeholder="Ex: 5Q0 123 456 A"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Main d'Œuvre (Référence / Temps)</label>
              <input 
                type="text" 
                name="mainOeuvre"
                className="form-control"
                value={formData.mainOeuvre} 
                onChange={handleChange} 
                placeholder="Ex: 20451999 (0.50 UT)"
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
                <option value="Réparé">Terminé</option>
                <option value="Livré">Livré au client</option>
              </select>
            </div>
          </>
        )}
      </div>

      {formData.typeDossier === 'Garantie' && (
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
      )}

      <div className="grid grid-cols-2">
        {formData.typeDossier === 'Garantie' && (
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
        )}

        {formData.typeDossier === 'Garantie' && (
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
                  name="fichePedagogiqueFile"
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
        )}

        {formData.typeDossier === 'MCQ' && (
          <div className="form-group">
            <label className="form-label">Fiche MCQ</label>
            <div className="file-upload-container" style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)'
            }}>
              <input
                type="file"
                name="ficheMCQFile"
                onChange={handleFileChange}
                style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAnalyzeMCQ}
                  disabled={isAnalyzing || !ficheMCQFile}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  {isAnalyzing ? 'Analyse...' : '🔍 Analyser la fiche MCQ'}
                </button>
              </div>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {initialData.ficheMCQUrl ? 'Remplacer le fichier actuel' : 'Joindre la fiche MCQ (PDF, Image...)'}
              </p>
            </div>
          </div>
        )}

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

        {/* Document PDF Dossier */}
        <div className="form-group">
          <label className="form-label">Document PDF du Dossier</label>
          <div className="file-upload-container" style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)'
          }}>
            <input
              type="file"
              name="documentPdfFile"
              onChange={handleFileChange}
              style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}
              accept=".pdf"
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleAnalyzePDF}
                disabled={isAnalyzing || !documentPdfFile}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                {isAnalyzing ? 'Analyse...' : '🔍 Analyser l\'ordre de réparation'}
              </button>
            </div>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {initialData.documentPdfUrl ? 'Remplacer le document PDF' : 'Joindre le document PDF officiel du dossier'}
            </p>
          </div>
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
