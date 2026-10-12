import { DocumentTextIcon } from '@heroicons/react/24/outline';
import AdminResourcePage from './AdminResourcePage';
import api from '../../api/axios';

const produitLabel = (commande) => {
  const lignes = commande?.lignes || [];
  if (!lignes.length) return '—';
  const premier = lignes[0]?.materiel?.nom || 'Article supprimé';
  return lignes.length > 1 ? `${premier} +${lignes.length - 1}` : premier;
};

const Factures = () => {
  const fetchOptions = async () => {
    try {
      const [commandesRes, usersRes] = await Promise.all([
        api.get('/commandes').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
      ]);

      const commandes = Array.isArray(commandesRes.data)
        ? commandesRes.data
        : (commandesRes.data?.data || []);

      const users = Array.isArray(usersRes.data)
        ? usersRes.data
        : (usersRes.data?.data || []);

      return {
        commande_id: commandes
          .filter((c) => c.statut === 'retiree' && !c.facture)
          .map((c) => ({
            value: c.id,
            label: `Commande #${c.id} - ${c.client?.nom || c.client_nom || 'NR'}`,
          })),
        generee_par: users.map((u) => ({
          value: u.id,
          label: u.name,
        })),
      };
    } catch (error) {
      console.error('Erreur chargement options factures:', error);
      return { commande_id: [], generee_par: [] };
    }
  };

  const normalize = (data) =>
    data.map((item) => ({
      ...item,
      commande_id: item.commande?.id ?? '',
      generee_par: item.generee_par?.id ?? '',
    }));

  // Fonction de téléchargement PDF améliorée
  const downloadPDF = async (facture) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/factures/${facture.id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${facture.reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      alert('Impossible de générer le PDF. Vérifiez la console pour plus de détails.');
    }
  };

  return (
    <AdminResourcePage
      title="Factures"
      description="Consultez les factures générées à partir des ventes validées."
      endpoint="/factures"
      icon={DocumentTextIcon}
      canDelete
      fetchOptions={fetchOptions}
      normalize={normalize}
      fields={[
        { name: 'reference', label: 'Référence', optional: true },
        { name: 'commande_id', label: 'Commande', type: 'select' },
        { name: 'generee_par', label: 'Générée par', type: 'select' },
        { name: 'date_generation', label: 'Date de génération', type: 'datetime-local', optional: true },
      ]}
      getSearchText={(item) =>
        `${item.reference} ${item.commande?.client?.nom || item.commande?.client_nom || ''} ${(item.commande?.lignes || []).map((l) => l.materiel?.nom || '').join(' ')}`
      }
      getMetrics={(items) => [
        { label: 'Factures', value: items.length, hint: 'documents générés' },
        {
          label: 'Montant total',
          value: `${items
            .reduce((sum, item) => sum + Number(item.commande?.prixTTC || 0), 0)
            .toLocaleString('fr-MA')} DH`,
          hint: 'toutes factures',
        },
        {
          label: 'Aujourd’hui',
          value: items.filter(
            (item) =>
              item.date_generation?.startsWith(new Date().toISOString().slice(0, 10))
          ).length,
          hint: 'émises aujourd’hui',
        },
      ]}
      columns={[
        {
          label: 'Référence',
          render: (item) => (
            <span className="font-mono font-semibold text-blue-700">{item.reference}</span>
          ),
        },
        {
          label: 'Client',
          render: (item) =>
            item.commande?.client?.nom || item.commande?.client_nom || 'Client non renseigné',
        },
        {
          label: 'Produit',
          render: (item) => produitLabel(item.commande),
        },
        {
          label: 'Montant TTC',
          className: 'text-right font-semibold text-gray-900',
          render: (item) =>
            `${Number(item.commande?.prixTTC || 0).toLocaleString('fr-MA')} DH`,
        },
        {
          label: 'Générée le',
          render: (item) =>
            item.date_generation
              ? new Date(item.date_generation).toLocaleDateString('fr-FR')
              : '—',
        },
        {
          label: 'Générée par',
          render: (item) => item.generateur?.name || '—',
        },
{
  label: 'PDF',
  render: (item) => (
    <button
      onClick={async () => {
        try {
          const response = await api.get(`/factures/${item.id}/pdf`, {
            responseType: 'blob',
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `facture-${item.reference}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url); // libérer la mémoire
        } catch (error) {
          console.error('Erreur téléchargement PDF:', error);
          alert('Impossible de générer le PDF. Vérifiez que la route existe.');
        }
      }}
      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
    >
      📄 PDF
    </button>
  ),
},
      ]}
    />
  );
};

export default Factures;