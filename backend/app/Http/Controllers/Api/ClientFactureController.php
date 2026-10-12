<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Exception;

class ClientFactureController extends Controller
{
    public function index(Request $request)
    {
        $factures = Facture::with(['commande.lignes.materiel', 'generateur'])
            ->whereHas('commande', fn ($q) => $q->where('client_id', $request->user()->id))
            ->orderByDesc('date_generation')
            ->get();

        return response()->json($factures);
    }

    public function pdf(Request $request, $id)
    {
        $facture = Facture::with(['commande.client', 'commande.lignes.materiel', 'commande.adresseStock', 'generateur'])
            ->findOrFail($id);

        if ($facture->commande?->client_id !== $request->user()->id) {
            abort(403, 'Vous ne pouvez consulter que vos propres factures.');
        }

        try {
            if (is_string($facture->date_generation)) {
                $facture->date_generation = \Carbon\Carbon::parse($facture->date_generation);
            }

            $pdf = Pdf::loadView('factures.ticket', compact('facture'));
            return $pdf->download('facture-'.$facture->reference.'.pdf');
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Erreur PDF : ' . $e->getMessage()
            ], 500);
        }
    }
}
