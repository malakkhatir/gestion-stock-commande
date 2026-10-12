import { useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ClientProfil = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    nom: user?.name || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    motDePasse: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
      };
      if (form.motDePasse) {
        payload.motDePasse = form.motDePasse;
      }
      const { data } = await api.put('/client/profil', payload);
      updateUser(data);
      setForm({ ...form, motDePasse: '' });
      setSuccess('Vos informations ont été mises à jour.');
    } catch (err) {
      setError(err.response?.data?.message || 'La mise à jour a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
          <UserCircleIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-600">Espace client</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Mon profil</h1>
          <p className="mt-1 text-sm text-gray-500">Modifiez vos informations de compte.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-gray-700">Nom</span>
          <input
            required
            value={form.nom}
            onChange={handleChange('nom')}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-gray-700">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-gray-700">Téléphone</span>
          <input
            required
            value={form.telephone}
            onChange={handleChange('telephone')}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-gray-700">Nouveau mot de passe</span>
          <input
            type="password"
            placeholder="Laisser vide pour ne pas changer"
            value={form.motDePasse}
            onChange={handleChange('motDePasse')}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          />
        </label>

        <button
          disabled={saving}
          className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
};

export default ClientProfil;
