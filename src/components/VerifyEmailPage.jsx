import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token manquant");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5001/api/auth/verify-email/${token}`,
        );

        if (!response.ok) {
          const data = await response.json();
          setStatus("error");
          setMessage(data.error || "Erreur de vérification");
          return;
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setStatus("success");
        setMessage("Email vérifié avec succès !");

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-6">🚗 VW Audit</h1>

        {status === "verifying" && (
          <>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
            <p className="text-gray-600">
              Vérification de votre email en cours...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6">
              <p className="text-5xl">✅</p>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Succès !</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirection vers la connexion...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6">
              <p className="text-5xl">❌</p>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <a
              href="/login"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Retour à la connexion
            </a>
          </>
        )}
      </div>
    </div>
  );
}
