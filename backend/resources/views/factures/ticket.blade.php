<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture {{ $facture->reference }}</title>
    <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; max-width: 320px; margin: auto; background: #fff; }
        .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 10px; margin-bottom: 10px; }
        .header h1 { font-size: 20px; margin: 0; color: #1a202c; }
        .header p { margin: 2px 0; color: #4a5568; }
        .info { margin: 10px 0; padding: 8px; background: #f7fafc; border-radius: 4px; }
        .info p { margin: 2px 0; }
        .details { width: 100%; margin: 12px 0; border-collapse: collapse; }
        .details th { text-align: left; border-bottom: 1px solid #e2e8f0; padding: 6px 0; }
        .details td { padding: 6px 0; border-bottom: 1px dotted #e2e8f0; }
        .details .right { text-align: right; }
        .total { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; margin-top: 8px; }
        .montant-payer { 
            font-size: 18px; 
            font-weight: bold; 
            color: #2d3748; 
            margin: 15px 0; 
            padding: 10px; 
            background: #ebf8ff; 
            text-align: center; 
            border-radius: 6px;
            border: 1px solid #bee3f8;
        }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 2px dashed #333; padding-top: 10px; color: #718096; }
        .badge { display: inline-block; background: #2b6cb0; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
    </style>
</head>
<body>

    <div class="header">
        <h1> MON MAGASIN</h1>
        <p>Facture n° <strong>{{ $facture->reference }}</strong></p>
        <p>{{ \Carbon\Carbon::parse($facture->date_generation)->format('d/m/Y H:i') }}</p>
        <span class="badge">Original</span>
    </div>

    @php
        $prixHT = $facture->commande->prixHT ?? 0;
        $prixTTC = $facture->commande->prixTTC ?? 0;
        $prixTVA = $prixTTC - $prixHT;
        $dateAchat = $facture->commande->dateAchat   ?? $facture->commande->dateCommande ?? null;
    @endphp

    <div class="info">
        <p><strong>Client :</strong> {{ $facture->commande->client->nom ?? $facture->commande->client_nom ?? 'Client non renseigné' }}</p>
        <p><strong>Vendeur :</strong> {{ $facture->generateur->name ?? '—' }}</p>
        <p><strong>Adresse de stock :</strong> {{ $facture->commande->adresseStock->nom ?? '—' }}</p>
        <p><strong>Date de l'achat :</strong> {{ $dateAchat ? \Carbon\Carbon::parse($dateAchat)->format('d/m/Y H:i') : '—' }}</p>
        <p><strong>Commande :</strong> #{{ $facture->commande->id ?? '—' }}</p>
    </div>

    <table class="details">
        <thead>
            <tr>
                <th>Réf.</th>
                <th>Article</th>
                <th>Qté</th>
                <th class="right">Prix HT</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($facture->commande->lignes ?? [] as $ligne)
                <tr>
                    <td>{{ $ligne->materiel->reference ?? '—' }}</td>
                    <td>{{ $ligne->materiel->nom ?? '—' }}</td>
                    <td>{{ $ligne->quantite }}</td>
                    <td class="right">{{ number_format($ligne->prixHT, 2, ',', ' ') }} DH</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">—</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="details">
        <tbody>
            <tr>
                <td>Total HT</td>
                <td class="right">{{ number_format($prixHT, 2, ',', ' ') }} DH</td>
            </tr>
            <tr>
                <td>TVA (20%)</td>
                <td class="right">{{ number_format($prixTVA, 2, ',', ' ') }} DH</td>
            </tr>
        </tbody>
    </table>

    <div class="total">
        Total TTC : {{ number_format($prixTTC, 2, ',', ' ') }} DH
    </div>

    <!-- MONTANT À PAYER -->
    <div class="montant-payer">
         Montant à payer : {{ number_format($prixTTC, 2, ',', ' ') }} DH
    </div>

    <div class="footer">
        Merci de votre confiance<br>
        Retour possible sous 14 jours<br>
        <small>Document généré par le système</small>
    </div>

</body>
</html>