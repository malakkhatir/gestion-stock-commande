<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Facture;
use App\Models\Materiel;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $previousMonthStart = $monthStart->copy()->subMonth();
        $weekStart = $now->copy()->startOfWeek(Carbon::MONDAY);
        $previousWeekStart = $weekStart->copy()->subWeek();
        $dayStart = $now->copy()->startOfDay();
        $previousDayStart = $dayStart->copy()->subDay();

        $stats = [
            'users' => $this->comparison(User::query(), 'created_at', $monthStart, $previousMonthStart),
            'materiels' => $this->comparison(Materiel::query(), 'created_at', $monthStart, $previousMonthStart),
            'commandes' => $this->comparison(Commande::query(), 'dateCommande', $weekStart, $previousWeekStart),
            'factures' => $this->comparison(Facture::query(), 'date_generation', $dayStart, $previousDayStart),
        ];

        $revenueStart = $monthStart;
        $previousRevenueStart = $previousMonthStart;
        $revenue = (float) Commande::where('statut', 'retiree')
            ->whereBetween('dateAchat', [$revenueStart, $now])
            ->sum('prixTTC');
        $previousRevenue = (float) Commande::where('statut', 'retiree')
            ->whereBetween('dateAchat', [$previousRevenueStart, $revenueStart->copy()->subSecond()])
            ->sum('prixTTC');
        $target = 300000;

        $recentOrders = Commande::with(['client:id,nom', 'lignes.materiel:id,nom'])
            ->latest('dateCommande')
            ->limit(5)
            ->get()
            ->map(fn (Commande $commande) => [
                'id' => $commande->id,
                'client' => $commande->client?->nom ?? $commande->client_nom ?? 'Client non renseigné',
                'materiel' => $commande->lignes->first()?->materiel?->nom ?? 'Produit supprimé',
                'quantite' => $commande->lignes->sum('quantite'),
                'montant' => (float) $commande->prixTTC,
                'statut' => $commande->statut,
                'date' => $commande->dateCommande,
            ]);

        $stockAlerts = Materiel::whereColumn('quantiteDisponible', '<=', 'seuil_securite')
            ->orderBy('quantiteDisponible')
            ->limit(5)
            ->get(['id', 'nom', 'quantiteDisponible', 'seuil_securite'])
            ->map(fn (Materiel $materiel) => [
                'id' => $materiel->id,
                'nom' => $materiel->nom,
                'stock' => $materiel->quantiteDisponible,
                'seuil' => $materiel->seuil_securite,
                'niveau' => $materiel->quantiteDisponible === 0 ? 'rupture' : 'faible',
            ]);

        return response()->json([
            'stats' => $stats,
            'revenue' => [
                'total' => $revenue,
                'previous' => $previousRevenue,
                'target' => $target,
                'progress' => min((int) round(($revenue / $target) * 100), 100),
                'remaining' => max($target - $revenue, 0),
            ],
            'recentOrders' => $recentOrders,
            'stockAlerts' => $stockAlerts,
        ]);
    }

    private function comparison($query, string $dateColumn, Carbon $currentStart, Carbon $previousStart): array
    {
        $current = (clone $query)->whereBetween($dateColumn, [$currentStart, now()])->count();
        $previous = (clone $query)->whereBetween($dateColumn, [$previousStart, $currentStart->copy()->subSecond()])->count();

        return [
            'current' => $current,
            'previous' => $previous,
            'change' => $previous === 0 ? ($current === 0 ? 0 : 100) : (int) round((($current - $previous) / $previous) * 100),
        ];
    }
}
