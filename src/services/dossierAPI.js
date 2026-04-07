// API service pour communiquer avec le backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Fonction helper pour obtenir le token
const getToken = () => localStorage.getItem("token");

// Fonction helper pour obtenir les headers avec token
const getHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const dossierAPI = {
  // Récupérer tous les dossiers
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/dossiers`, {
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
      const response = await fetch(`${API_URL}/dossiers/${id}`, {
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
      const response = await fetch(`${API_URL}/dossiers`, {
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
      const response = await fetch(`${API_URL}/dossiers/${id}`, {
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
      const response = await fetch(`${API_URL}/dossiers/${id}`, {
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
      const response = await fetch(`${API_URL}/dossiers/stats/overview`, {
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
