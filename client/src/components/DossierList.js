import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DossierList() {
  const [dossiers, setDossiers] = useState([]);

  useEffect(() => {
    axios.get('/api/dossiers')
      .then(response => {
        setDossiers(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the dossiers!', error);
      });
  }, []);

  return (
    <div>
      <h1>Dossiers</h1>
      <ul>
        {dossiers.map(dossier => (
          <li key={dossier._id}>{dossier.numero} - {dossier.client}</li>
        ))}
      </ul>
    </div>
  );
}

export default DossierList;
