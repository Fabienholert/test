import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SectionConformance from './components/SectionConformance'
import SectionCapture from './components/SectionCapture'
import SectionTracking from './components/SectionTracking'
import LoginPage from './components/LoginPage'
import VerifyEmailPage from './components/VerifyEmailPage'
import { isAfter, differenceInDays, parseISO, startOfDay } from 'date-fns'
import { dossierAPI } from './services/dossierAPI'

function Dashboard() {
  // États du dashboard
  const [user, setUser] = useState(null)
  const [showLogout, setShowLogout] = useState(false)
  const [conformanceData, setConformanceData] = useState({
    reclamation: '',
    signature: '',
    dateEntree: '',
    dateImpression: ''
  })
  const [captureData, setCaptureData] = useState({
    orNumber: '',
    dissNumber: '',
    vin: '',
    model: '',
    km: '',
    technicien: '',
    pointageAtelier: '',
    codeDommage: '',
    codeAvarie: '',
    dissOpen: '',
    protocole: '',
    ppso: '',
    fichePedagogique: '',
    tpi: '',
    dateDiag: '',
    sortiepromise: ''
  })
  const [records, setRecords] = useState([])
  const [validationMessage, setValidationMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, docsOK: 0, docsMissing: 0, taux: 0 })

  // Au chargement du dashboard, récupérer les données utilisateur
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      loadDossiers()
    }
  }, [])

  const loadDossiers = async () => {
    setLoading(true)
    const data = await dossierAPI.getAll()
    setRecords(data)
    updateStats(data)
    setLoading(false)
  }

  const updateStats = (dossiers) => {
    const total = dossiers.length
    const docsOK = dossiers.filter(d => d.docsOK).length
    const taux = total > 0 ? Math.round((docsOK / total) * 100) : 0
    setStats({
      total,
      docsOK,
      docsMissing: total - docsOK,
      taux
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const handleConformanceChange = (e) => {
    const { name, value } = e.target
    setConformanceData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCaptureChange = (e) => {
    const { name, value } = e.target
    setCaptureData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateAllData = () => {
    const errors = {}
    const today = startOfDay(new Date())

    // Validation Section A - Conformité
    if (!conformanceData.reclamation) {
      errors.conformanceReclamation = 'Réclamation client requise'
    } else if (conformanceData.reclamation === 'Non') {
      errors.conformanceReclamation = 'BLOCAGE: Réclamation doit être "Oui"'
    }

    if (!conformanceData.signature) {
      errors.conformanceSignature = 'Signature dossier requise'
    } else if (conformanceData.signature === 'Non') {
      errors.conformanceSignature = 'BLOCAGE: Signature dossier doit être "Oui"'
    }

    if (!conformanceData.dateEntree) {
      errors.conformanceDateEntree = 'Date d\'entrée requise'
    } else {
      const entryDate = parseISO(conformanceData.dateEntree)
      const daysDiff = differenceInDays(today, entryDate)
      if (daysDiff > 30) {
        errors.conformanceDateEntree = `BLOCAGE: Date d'entrée a ${daysDiff} jours (max 30)`
      }
    }

    if (!conformanceData.dateImpression) {
      errors.conformanceDateImpression = 'Date d\'impression requise'
    } else {
      if (conformanceData.dateEntree && isAfter(parseISO(conformanceData.dateImpression), parseISO(conformanceData.dateEntree))) {
        errors.conformanceDateImpression = 'BLOCAGE: Date d\'impression ne peut pas être après la date d\'entrée'
      }
    }

    // Validation Section B - Saisie
    if (!captureData.orNumber) errors.orNumber = 'Champ requis'
    if (!captureData.dissNumber) errors.dissNumber = 'Champ requis'
    if (!captureData.vin) errors.vin = 'Champ requis'
    if (!captureData.model) errors.model = 'Champ requis'
    if (!captureData.km) errors.km = 'Champ requis'
    if (!captureData.technicien) errors.technicien = 'Champ requis'
    if (!captureData.pointageAtelier) errors.pointageAtelier = 'Champ requis'
    if (!captureData.codeDommage) errors.codeDommage = 'Champ requis'
    if (!captureData.codeAvarie) errors.codeAvarie = 'Champ requis'
    if (!captureData.dissOpen) errors.dissOpen = 'Champ requis'
    if (!captureData.protocole) errors.protocole = 'Champ requis'
    if (!captureData.ppso) errors.ppso = 'Champ requis'
    if (!captureData.fichePedagogique) errors.fichePedagogique = 'Champ requis'
    if (!captureData.tpi) errors.tpi = 'Champ requis'
    if (!captureData.dateDiag) errors.dateDiag = 'Champ requis'
    if (!captureData.sortiepromise) errors.sortiepromise = 'Champ requis'

    return errors
  }

  const handleValidation = () => {
    const errors = validateAllData()

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
      setValidationMessage({
        type: 'error',
        text: `Erreurs détectées:\n${errorMessages.join('\n')}`
      })
      return
    }

    // Si validation réussie, sauvegarder dans la base de données
    const newRecord = {
      ...conformanceData,
      ...captureData
    }

    setLoading(true)
    dossierAPI.create(newRecord)
      .then((savedRecord) => {
        setRecords(prev => [...prev, savedRecord])
        updateStats([...records, savedRecord])
        setValidationMessage({
          type: 'success',
          text: 'Dossier validé et sauvegardé en base de données ✓'
        })

        // Réinitialiser les formulaires
        setConformanceData({
          reclamation: '',
          signature: '',
          dateEntree: '',
          dateImpression: ''
        })

        setCaptureData({
          orNumber: '',
          dissNumber: '',
          vin: '',
          model: '',
          km: '',
          technicien: '',
          pointageAtelier: '',
          codeDommage: '',
          codeAvarie: '',
          dissOpen: '',
          protocole: '',
          ppso: '',
          fichePedagogique: '',
          tpi: '',
          dateDiag: '',
          sortiepromise: ''
        })

        // Effacer le message après 3 secondes
        setTimeout(() => setValidationMessage(null), 3000)
      })
      .catch((error) => {
        setValidationMessage({
          type: 'error',
          text: `Erreur de sauvegarde: ${error.message}`
        })
      })
      .finally(() => setLoading(false))
  }

  const handleReset = () => {
    setConformanceData({
      reclamation: '',
      signature: '',
      dateEntree: '',
      dateImpression: ''
    })
    setCaptureData({
      orNumber: '',
      dissNumber: '',
      vin: '',
      model: '',
      km: '',
      technicien: '',
      pointageAtelier: '',
      codeDommage: '',
      codeAvarie: '',
      dissOpen: '',
      protocole: '',
      ppso: '',
      fichePedagogique: '',
      tpi: '',
      dateDiag: '',
      sortiepromise: ''
    })
    setValidationMessage(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-gradient-to-r from-compliance to-orange-600 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">🚗 Audit Garantie VW</h1>
            <p className="text-orange-100 mt-2">Gestion de Réception Garantie - Système de Conformité Stricte</p>
          </div>
          
          {/* Info utilisateur et déconnexion */}
          <div className="text-right">
            <p className="text-orange-100 text-sm">Connecté en tant que:</p>
            <p className="text-lg font-semibold">{user?.prenom} {user?.nom}</p>
            <p className="text-orange-200 text-xs">{user?.email}</p>
            
            <div className="relative mt-2">
              <button
                onClick={() => setShowLogout(!showLogout)}
                className="bg-orange-700 hover:bg-orange-800 text-white px-3 py-1 rounded text-sm transition"
              >
                ⚙️ Menu
              </button>
              
              {showLogout && (
                <div className="absolute right-0 mt-1 bg-white text-orange-600 rounded shadow-lg z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-orange-50"
                  >
                    🚪 Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Message de validation */}
        {validationMessage && (
          <div className={validationMessage.type === 'error' ? 'alert-error' : 'alert-success'}>
            <strong>{validationMessage.type === 'error' ? '❌ Erreur' : '✅ Succès'}:</strong>
            <p className="mt-1 whitespace-pre-line">{validationMessage.text}</p>
          </div>
        )}

        {/* Section A */}
        <SectionConformance 
          data={conformanceData} 
          onChange={handleConformanceChange}
          validationErrors={{}}
        />

        {/* Section B */}
        <SectionCapture 
          data={captureData} 
          onChange={handleCaptureChange}
          validationErrors={{}}
        />

        {/* Boutons d'action */}
        <div className="section-card flex justify-between gap-4">
          <button
            onClick={handleValidation}
            className="btn btn-primary flex-1 text-base py-3"
          >
            ✓ Valider la Réception
          </button>
          <button
            onClick={handleReset}
            className="btn btn-secondary flex-1 text-base py-3"
          >
            ↻ Réinitialiser
          </button>
        </div>

        {/* Section C */}
        <SectionTracking records={records} />

        {/* Statistiques */}
        {records.length > 0 && (
          <div className="section-card bg-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-700">Statistiques</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <p className="text-gray-600 text-sm">Total Dossiers</p>
                <p className="text-2xl font-bold text-capture">{records.length}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-gray-600 text-sm">Docs OK</p>
                <p className="text-2xl font-bold text-validation">
                  {records.filter(r => r.protocole === 'Oui' && r.ppso === 'Oui' && r.fichePedagogique !== 'Non' && r.fichePedagogique !== '' && r.tpi !== 'Non' && r.tpi !== '').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-gray-600 text-sm">Docs À Revoir</p>
                <p className="text-2xl font-bold text-red-600">
                  {records.filter(r => !(r.protocole === 'Oui' && r.ppso === 'Oui' && r.fichePedagogique !== 'Non' && r.fichePedagogique !== '' && r.tpi !== 'Non' && r.tpi !== '')).length}
                </p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-gray-600 text-sm">Taux OK</p>
                <p className="text-2xl font-bold text-blue-600">
                  {records.length > 0 ? Math.round(
                    (records.filter(r => r.protocole === 'Oui' && r.ppso === 'Oui' && r.fichePedagogique !== 'Non' && r.fichePedagogique !== '' && r.tpi !== 'Non' && r.tpi !== '').length / records.length) * 100
                  ) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm mt-12 border-t">
        <p>Audit Garantie VW © 2024 - Système de Gestion de Réception</p>
      </footer>
    </div>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true)
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}
