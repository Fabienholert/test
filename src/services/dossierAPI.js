const getApiBaseUrl = () => {
  // Si l'application est en production (sur Render), on utilise une URL relative.
  // Le serveur est sur le même domaine, donc /api pointera vers https://VOTRE_SITE.onrender.com/api
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // Sinon, en développement, on utilise l'adresse locale.
  return 'http://localhost:5000/api'; 
};

const apiBaseUrl = getApiBaseUrl();

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const dossierAPI = {
  // Récupérer tous les dossiers
  getAll: async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/dossiers`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.reload();
        }
        throw new Error("Erreur lors de la récupération des dossiers");
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur getAll:", error);
      return [];
    }
  },

  // Récupérer un dossier par ID
  getById: async (id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/dossiers/${id}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Dossier non trouvé");
      return await response.json();
    } catch (error) {
      console.error("Erreur getById:", error);
      throw error;
    }
  },

  // Créer un nouveau dossier
  create: async (data) => {
    try {
      const response = await fetch(`${apiBaseUrl}/dossiers`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la création");
      return await response.json();
    } catch (error) {
      console.error("Erreur create:", error);
      throw error;
    }
  },

  // Mettre à jour un dossier
  update: async (id, data) => {
    try {
      const response = await fetch(`${apiBaseUrl}/dossiers/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return await response.json();
    } catch (error) {
      console.error("Erreur update:", error);
      throw error;
    }
  },

  // Supprimer un dossier
  delete: async (id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/dossiers/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      return await response.json();
    } catch (error) {
      console.error("Erreur delete:", error);
      throw error;
    }
  },

  // Récupérer les statistiques
  getStats: async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/dossiers/stats/overview`, {
        headers: getHeaders(),
      });
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des stats");
      return await response.json();
    } catch (error) {
      console.error("Erreur getStats:", error);
      throw error;
    }
  },
};