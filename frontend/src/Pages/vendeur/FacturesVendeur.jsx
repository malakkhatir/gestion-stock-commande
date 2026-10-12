import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import VendeurResourcePage from './VendeurResourcePage';
import api from '../../api/axios';

const downloadPdf = async (facture) => {
  try {
    const response = await api.get(`/factures/${facture.id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${facture.reference}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Impossible de générer le PDF pour le moment.');
  }
};

const produitLabel = (commande) => {
  const lignes = commande?.lignes || [];
  if (!lignes.length) return '—';
  const premier = lignes[0]?.materiel?.nom || 'Article supprimé';
  return lignes.length > 1 ? `${premier} +${lignes.length - 1}` : premier;
};

const FacturesVendeur = () => (
  <VendeurResourcePage
    title="Mes factures"
    description="Factures générées à partir de vos ventes validées."
    endpoint="/factures"
    icon={DocumentTextIcon}
    getSearchText={(item) => `${item.reference} ${item.commande?.client?.nom || item.commande?.client_nom || ''}`}
    getMetrics={(items) => [
      { label: 'Total factures', value: items.length, hint: 'sur vos ventes' },
      {
        label: 'Montant total',
        value: `${items.reduce((sum, i) => sum + Number(i.commande?.prixTTC || 0), 0).toLocaleString('fr-MA')} DH`,
        hint: 'cumulé',
      },
      {
        label: "Aujourd'hui",
        value: items.filter((i) => i.date_generation?.startsWith(new Date().toISOString().slice(0, 10))).length,
        hint: 'émises aujourd’hui',
      },
    ]}
    columns={[
      { label: 'Référence', render: (item) => <span className="font-mono font-semibold text-amber-700">{item.reference}</span> },
      { label: 'Client', render: (item) => item.commande?.client?.nom || item.commande?.client_nom || 'NR' },
      { label: 'Produit', render: (item) => produitLabel(item.commande) },
      {
        label: 'Montant',
        render: (item) => `${Number(item.commande?.prixTTC || 0).toLocaleString('fr-MA')} DH`,
        className: 'text-right font-semibold',
      },
      {
        label: 'Date',
        render: (item) => (item.date_generation ? new Date(item.date_generation).toLocaleDateString('fr-FR') : '—'),
      },
    ]}
    actions={[
      {
        label: 'PDF',
        icon: ArrowDownTrayIcon,
        onClick: downloadPdf,
        className: 'text-amber-700 hover:bg-amber-50',
      },
    ]}
  />
);

export default FacturesVendeur;
