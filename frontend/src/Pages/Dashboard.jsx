import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, MapPinIcon, ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/villes/stats`);
      setStats(response.data.data || { total: 0, total_unique_codes: 0 });
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/"
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">📊 Tableau de Bord</h1>
          </div>
          <p className="text-gray-600">Bienvenue sur votre tableau de bord de gestion de stock</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/products"
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  🛍️ Gestion des Produits
                </h3>
                <p className="text-gray-600 mt-2">Voir et gérer tous vos produits</p>
              </div>
              <ShoppingBagIcon className="w-12 h-12 text-blue-100 group-hover:text-blue-200 transition-colors" />
            </div>
          </Link>

          <Link
            to="/villes"
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  📍 Gestion des Villes
                </h3>
                <p className="text-gray-600 mt-2">Gérer vos emplacements</p>
              </div>
              <MapPinIcon className="w-12 h-12 text-green-100 group-hover:text-green-200 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Statistiques
          </h2>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {stats && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-600">
                <p className="text-sm text-blue-600 font-semibold mb-2">Total Villes</p>
                <p className="text-4xl font-bold text-blue-900">{stats.total || 0}</p>
                <p className="text-sm text-blue-700 mt-2">Villes enregistrées</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-600">
                <p className="text-sm text-green-600 font-semibold mb-2">Codes Uniques</p>
                <p className="text-4xl font-bold text-green-900">{stats.total_unique_codes || 0}</p>
                <p className="text-sm text-green-700 mt-2">Codes différents</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-l-4 border-purple-600">
                <p className="text-sm text-purple-600 font-semibold mb-2">Mise à jour</p>
                <p className="text-lg font-bold text-purple-900">{new Date().toLocaleDateString('fr-FR')}</p>
                <p className="text-sm text-purple-700 mt-2">Données actuelles</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Conseils</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Vérifiez régulièrement votre inventaire</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Mettez à jour les prix et quantités</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Organisez vos villes correctement</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Accès Rapide</h3>
            <div className="space-y-2">
              <Link to="/products" className="block px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                → Tous les produits
              </Link>
              <Link to="/villes" className="block px-4 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors">
                → Toutes les villes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
