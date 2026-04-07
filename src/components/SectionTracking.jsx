import React from 'react'

export default function SectionTracking({ records }) {
  const calculateDocsOK = (record) => {
    const protocoleOK = record.protocole === 'Oui'
    const ppsoOK = record.ppso === 'Oui'
    const ficheOK = record.fichePedagogique !== 'Non' && record.fichePedagogique !== ''
    const tpiOK = record.tpi !== 'Non' && record.tpi !== ''
    return protocoleOK && ppsoOK && ficheOK && tpiOK
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="section-card border-l-4 border-validation bg-green-50">
      <h2 className="section-title text-validation border-b-validation">
        Section C : Tableau de Suivi
      </h2>

      {records.length === 0 ? (
        <p className="text-gray-500 italic text-center py-8">
          Aucun dossier validé pour le moment. Complétez et validez les sections A et B.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-bold">OR #</th>
                <th className="px-4 py-3 text-left font-bold">N°DISS</th>
                <th className="px-4 py-3 text-left font-bold">VIN</th>
                <th className="px-4 py-3 text-left font-bold">Modèle</th>
                <th className="px-4 py-3 text-left font-bold">KM</th>
                <th className="px-4 py-3 text-left font-bold">Technicien</th>
                <th className="px-4 py-3 text-left font-bold">Protocole</th>
                <th className="px-4 py-3 text-left font-bold">PPSO</th>
                <th className="px-4 py-3 text-center font-bold bg-validation text-white">Docs OK</th>
                <th className="px-4 py-3 text-left font-bold">Diag</th>
                <th className="px-4 py-3 text-left font-bold">Sortie Promise</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => {
                const docsOK = calculateDocsOK(record)
                return (
                  <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50`}>
                    <td className="px-4 py-3 font-medium">{record.orNumber}</td>
                    <td className="px-4 py-3">{record.dissNumber}</td>
                    <td className="px-4 py-3">{record.vin}</td>
                    <td className="px-4 py-3">{record.model}</td>
                    <td className="px-4 py-3">{record.km}</td>
                    <td className="px-4 py-3">{record.technicien}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-white text-xs font-bold ${record.protocole === 'Oui' ? 'bg-validation' : 'bg-red-500'}`}>
                        {record.protocole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-white text-xs font-bold ${record.ppso === 'Oui' ? 'bg-validation' : 'bg-red-500'}`}>
                        {record.ppso}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded text-white text-xs font-bold ${docsOK ? 'bg-validation' : 'bg-red-500'}`}>
                        {docsOK ? '✓ OUI' : '✗ NON'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(record.dateDiag)}</td>
                    <td className="px-4 py-3">{formatDate(record.sortiepromise)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {records.length > 0 && (
        <div className="mt-4 p-3 bg-white rounded border border-gray-300">
          <p className="text-sm text-gray-600">
            <strong>Total dossiers validés:</strong> {records.length} | 
            <strong> Docs OK:</strong> {records.filter(r => calculateDocsOK(r)).length}/
            {records.length}
          </p>
        </div>
      )}
    </div>
  )
}
