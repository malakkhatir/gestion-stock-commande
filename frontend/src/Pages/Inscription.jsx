import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../Api/Api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "client", // Rôle par défaut
  });

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Définition des rôles disponibles
  const roles = [
    { value: "client", label: "Client", icon: "👤" },
    { value: "vendeur", label: "Vendeur", icon: "🛒" },
    { value: "responsable", label: "Responsable", icon: "📊" },
    { value: "admin", label: "Administrateur", icon: "🔐" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setAlert({ type: "", message: "" });

      const { name, email, password, password_confirmation, role } = form;

      // Validation supplémentaire
      if (password !== password_confirmation) {
        setAlert({ type: "error", message: "Les mots de passe ne correspondent pas." });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setAlert({ type: "error", message: "Le mot de passe doit contenir au moins 6 caractères." });
        setLoading(false);
        return;
      }

      const response = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation,
        role, // Envoyer le rôle au backend
      });

      console.log(response.data);
      
      // Stocker les données utilisateur
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role || role);
      localStorage.setItem("roleId", String(response.data.user.id));

      // Redirection vers la page de connexion avec message de succès
      navigate("/login", {
        state: { 
          successMessage: `Inscription réussie ! Votre compte ${role} a été créé.` 
        },
      });
    } catch (error) {
      console.error(error);
      
      let message = "Erreur lors de l'inscription.";
      
      if (error.response) {
        message = error.response.data?.errors?.email?.[0] 
                  || error.response.data?.message 
                  || error.response.data?.error
                  || message;
      } else if (error.request) {
        message = "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
      } else {
        message = error.message || message;
      }
      
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alert.message) {
      const timeout = setTimeout(() => setAlert({ type: "", message: "" }), 5000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl"
        noValidate
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
          <h2 className="text-3xl font-bold text-white text-center tracking-tight">
            Créer un compte
          </h2>
          <p className="text-gray-300 text-center text-sm mt-2">
            Rejoignez-nous en quelques secondes
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-6">
          {alert.message && (
            <div
              className={`text-sm px-4 py-3 rounded-xl text-center font-medium ${
                alert.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {alert.message}
            </div>
          )}

          <div className="space-y-5">
            {/* Nom complet */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Jean Dupont"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="exemple@domaine.com"
                autoComplete="email"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength="6"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-1">
                Confirmation du mot de passe
              </label>
              <input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Sélection du rôle */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                Type de compte
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.icon} {role.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {form.role === "admin" && "🔐 Accès complet à toutes les fonctionnalités"}
                {form.role === "responsable" && "📊 Gestion des stocks, référentiels et reporting"}
                {form.role === "vendeur" && "🛒 Gestion des commandes et réservations"}
                {form.role === "client" && "👤 Consultation des produits et factures"}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 flex justify-center items-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Inscription en cours...</span>
              </>
            ) : (
              "S'inscrire"
            )}
          </button>

          <p className="text-sm text-center text-gray-500 pt-2">
            Vous avez déjà un compte ?{" "}
            <Link 
              to="/login" 
              className="font-semibold text-gray-800 hover:text-gray-600 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <div className="bg-gray-50 px-8 py-3 text-center text-xs text-gray-400 border-t border-gray-100">
          En créant un compte, vous acceptez nos conditions générales.
        </div>
      </form>
    </div>
  );
}