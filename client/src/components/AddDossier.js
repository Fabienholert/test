import React, { useState } from 'react';
import axios from 'axios';

function AddDossier() {
  const [numero, setNumero] = useState('');
  const [client, setClient] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/dossiers', { numero, client })
      .then(res => {
        console.log(res.data);
        // On pourrait vouloir rafraîchir la liste ici
      })
      .catch(err => {
        console.error(err);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ajouter un dossier</h2>
      <input 
        type="text" 
        value={numero} 
        onChange={e => setNumero(e.target.value)} 
        placeholder="Numéro"
      />
      <input 
        type="text" 
        value={client} 
        onChange={e => setClient(e.target.value)} 
        placeholder="Client"
      />
      <button type="submit">Ajouter</button>
    </form>
  );
}

export default AddDossier;
