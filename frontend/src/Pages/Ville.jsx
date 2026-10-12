import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export default function Ville() {
  const [villes, setVilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, total_unique_codes: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', libelle: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, libelle: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Charger les villes au montage
  useEffect(() => {
    loadVilles();
    loadStats();
  }, []);

  // Charger les villes depuis l'API
  const loadVilles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/villes`);
      setVilles(response.data.data?.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des villes:', err);
      setError('Erreur lors du chargement des villes. Vérifiez que le backend est en cours d\'exécution.');
      setVilles([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/villes/stats`);
      setStats(response.data.data || { total: 0, total_unique_codes: 0 });
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
      setStats({ total: 0, total_unique_codes: 0 });
    }
  };

  const filteredVilles = Array.isArray(villes) ? villes.filter(v => 
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleAddVille = async (e) => {
    e.preventDefault();
    if (formData.code && formData.libelle) {
      setSubmitting(true);
      try {
        if (editingId) {
          // Modifier une ville
          await axios.put(`${API_URL}/villes/${editingId}`, formData);
        } else {
          // Créer une nouvelle ville
          await axios.post(`${API_URL}/villes`, formData);
        }
        
        // Rechargez les données
        loadVilles();
        loadStats();
        setFormData({ code: '', libelle: '' });
        setShowForm(false);
        setEditingId(null);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.response?.data?.message || 'Ces Données existent dejà.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleEdit = (ville) => {
    setEditingId(ville.id);
    setFormData({ code: ville.code, libelle: ville.libelle });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = (id, libelle) => {
    setDeleteModal({ open: true, id, libelle });
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`${API_URL}/villes/${deleteModal.id}`);
      loadVilles();
      loadStats();
      setDeleteModal({ open: false, id: null, libelle: '' });
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  // Ouvrir le modal d'ajout
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ code: '', libelle: '' });
    setShowForm(true);
    setError(null);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowForm(false);
    setFormData({ code: '', libelle: '' });
    setEditingId(null);
    setError(null);
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
            <h1 className="text-3xl font-bold text-gray-900">📍 Gestion des Villes</h1>
          </div>
          <p className="text-gray-600">Gérez tous vos emplacements et zones de distribution</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-2">Total Villes</p>
            <p className="text-4xl font-bold text-blue-600">{villes.length}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Liste des Villes</h2>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            Ajouter une Ville
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par code ou libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">id</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Libellé</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Chargement des villes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVilles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '❌ Aucune ville trouvée' : '📭 Aucune ville enregistrée'}
                  </td>
                </tr>
              ) : (
                filteredVilles.map((ville, index) => (
                  <tr key={ville.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {ville.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{ville.libelle}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(ville)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors disabled:opacity-50"
                        title="Modifier"
                        disabled={submitting}
                      >
                        <PencilIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(ville.id, ville.libelle)}
                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                        title="Supprimer"
                        disabled={submitting}
                      >
                        <TrashIcon className="w-5 h-5 inline" />
                      </button>


                      
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout/Modification */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              onClick={closeModal}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? '✏️ Modifier la Ville' : '➕ Ajouter une Ville'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={submitting}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleAddVille} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: CAS"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      maxLength="10"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Libellé *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Casablanca"
                      value={formData.libelle}
                      onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-semibold disabled:opacity-50"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Sauvegarde...' : (editingId ? '✓ Modifier' : '✓ Ajouter')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              onClick={() => setDeleteModal({ open: false, id: null, libelle: '' })}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir supprimer la ville <strong>"{deleteModal.libelle}"</strong> ?
                  <br />
                  Cette action est irréversible.
                </p>
              </div>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteModal({ open: false, id: null, libelle: '' })}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-semibold disabled:opacity-50"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Suppression...' : '✓ Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}