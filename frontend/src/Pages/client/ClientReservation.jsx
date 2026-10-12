import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const emptyLigne = () => ({ materiel_id: '', quantite: 1 });

const ClientReservation = () => {
  const [materiels, setMateriels] = useState([]);
  const [lignes, setLignes] = useState([emptyLigne()]);
  const [loadingMateriels, setLoadingMateriels] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/client/materiels')
      .then(res => setMateriels(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger le catalogue.'))
      .finally(() => setLoadingMateriels(false));
  }, []);

  const materielFor = (id) => materiels.find((m) => String(m.id) === String(id));

  const addLigne = () => setLignes((current) => [...current, emptyLigne()]);
  const removeLigne = (index) => setLignes((current) => current.filter((_, i) => i !== index));
  const updateLigne = (index, field, value) => setLignes((current) =>
    current.map((l, i) => (i === index ? { ...l, [field]: value } : l))
  );

  const totalTTC = useMemo(() => {
    const totalHT = lignes.reduce((sum, l) => {
      const m = materielFor(l.materiel_id);
      return sum + (m ? Number(m.prixVente || 0) * Number(l.quantite || 0) : 0);
    }, 0);
    return totalHT * 1.2;
  }, [lignes, materiels]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    for (const ligne of lignes) {
      if (!ligne.materiel_id) {
        setError('Veuillez sélectionner un article pour chaque ligne.');
        return;
      }
      if (!ligne.quantite || Number(ligne.quantite) < 1) {
        setError('Veuillez indiquer une quantité valide pour chaque ligne.');
        return;
      }
    }

    setSaving(true);
    try {
      await api.post('/client/commandes', {
        lignes: lignes.map((l) => ({ materiel_id: l.materiel_id, quantite: Number(l.quantite) })),
      });
      setSuccess('Votre demande de réservation a été envoyée avec succès.');
      setLignes([emptyLigne()]);
    } catch (err) {
      setError(err.response?.data?.message || 'La demande a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
          <ClipboardDocumentListIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-600">Espace client</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Demande de réservation</h1>
          <p className="mt-1 text-sm text-gray-500">Réservez un ou plusieurs articles en une seule commande. Un vendeur traitera votre demande.</p>
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

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Articles *</span>
          <button
            type="button"
            onClick={addLigne}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <PlusIcon className="h-4 w-4" />
            Ajouter un article
          </button>
        </div>

        <div className="space-y-3">
          {lignes.map((ligne, index) => {
            const materiel = materielFor(ligne.materiel_id);
            return (
              <div key={index} className="grid gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">Article</span>
                  <select
                    required
                    value={ligne.materiel_id}
                    onChange={(e) => updateLigne(index, 'materiel_id', e.target.value)}
                    disabled={loadingMateriels}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">{loadingMateriels ? 'Chargement…' : 'Sélectionner…'}</option>
                    {materiels.map((m) => (
                      <option key={m.id} value={m.id} disabled={m.quantiteDisponible === 0}>
                        {m.nom} — {Number(m.prixVente || 0).toLocaleString('fr-MA')} DH ({m.quantiteDisponible} dispo)
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">Quantité</span>
                  <input
                    required
                    type="number"
                    min="1"
                    max={materiel?.quantiteDisponible || undefined}
                    value={ligne.quantite}
                    onChange={(e) => updateLigne(index, 'quantite', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <button
                  type="button"
                  disabled={lignes.length === 1}
                  onClick={() => removeLigne(index)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Retirer cet article"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {totalTTC > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-gray-700">
            <div className="flex justify-between border-t border-emerald-100 pt-0 text-base font-bold text-emerald-700">
              <span>Total TTC estimé</span>
              <span>{totalTTC.toLocaleString('fr-MA')} DH</span>
            </div>
          </div>
        )}

        <button
          disabled={saving}
          className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? 'Envoi en cours…' : 'Envoyer la demande'}
        </button>
      </form>
    </div>
  );
};

export default ClientReservation;
