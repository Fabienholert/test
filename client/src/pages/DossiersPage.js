import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DossiersPage = () => {
  const [dossiers, setDossiers] = useState([]);
  
  useEffect(() => {
    const fetchDossiers = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/dossiers', { headers: { Authorization: `Bearer ${token}` } });
      setDossiers(res.data);
    };
    fetchDossiers();
  }, []);

  return (
    <div>
      <h1>Dossiers</h1>
      <ul>
        {dossiers.map(dossier => (
          <li key={dossier._id}>{dossier.numeroDossier}</li>
        ))}
      </ul>
    </div>
  );
};

export default DossiersPage;
