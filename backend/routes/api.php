<?php

use App\Http\Controllers\Api\{
    AuthController,
    ClientController,
    PartenaireController,
    VilleController,
    TypeMaterielController,
    VehicleController,
    AdresseStockController,
    PointDeVenteController,
    MaterielController,
    CommandeController,
    FactureController,
    DashboardController,
    UserController,
    ClientCommandeController,
    ClientFactureController,
    ClientProfilController
};
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Route publique d'authentification (personnel interne et clients)
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    // Routes protégées pour les utilisateurs internes
    Route::middleware('auth:sanctum')->group(function () {

        // --- Nouveau : endpoints accessibles à tous les utilisateurs authentifiés ---
        Route::get('/type-materiels', [TypeMaterielController::class, 'index']);
        Route::get('/adresse-stocks', [AdresseStockController::class, 'index']);
        Route::get('/villes', [VilleController::class, 'index']);
        
        // Vous pouvez aussi ajouter /partenaires si nécessaire

        // Routes réservées à l'admin (création/modification/suppression)
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::post('partenaires', [PartenaireController::class, 'store']);
            Route::put('partenaires/{id}', [PartenaireController::class, 'update']);
            Route::delete('partenaires/{id}', [PartenaireController::class, 'destroy']);
            Route::apiResource('villes', VilleController::class);
            Route::apiResource('types', TypeMaterielController::class);
            Route::apiResource('vehicles', VehicleController::class);
            Route::apiResource('adresses-stock', AdresseStockController::class);
            Route::put('clients/{id}', [ClientController::class, 'update']);
            Route::delete('clients/{id}', [ClientController::class, 'destroy']);
            Route::post('points-vente', [PointDeVenteController::class, 'store']);
            Route::put('points-vente/{id}', [PointDeVenteController::class, 'update']);
            Route::delete('points-vente/{id}', [PointDeVenteController::class, 'destroy']);
        });

        // Routes accessibles à admin et directeur
        Route::middleware('role:admin,directeur_ventes')->group(function () {
            Route::get('dashboard', [DashboardController::class, 'index']);
        });

        // Routes accessibles à admin, directeur, responsable stock (gestion du matériel)
        Route::middleware('role:admin,directeur_ventes,responsable_stock')->group(function () {
            Route::post('materiels', [MaterielController::class, 'store']);
            Route::put('materiels/{id}', [MaterielController::class, 'update']);
            Route::delete('materiels/{id}', [MaterielController::class, 'destroy']);
            Route::post('materiels/{id}/transfert', [MaterielController::class, 'transfert']);
            Route::get('stock/alertes', [MaterielController::class, 'alertes']);
            Route::get('partenaires', [PartenaireController::class, 'index']);
            Route::get('partenaires/{id}', [PartenaireController::class, 'show']);
        });

        // Consultation partagée (lecture) : matériel, points de vente, clients — tous les rôles internes
        Route::middleware('role:admin,directeur_ventes,responsable_stock,vendeur')->group(function () {
            Route::get('materiels', [MaterielController::class, 'index']);
            Route::get('materiels/{id}', [MaterielController::class, 'show']);
            Route::get('points-vente', [PointDeVenteController::class, 'index']);
            Route::get('points-vente/{id}', [PointDeVenteController::class, 'show']);
            Route::get('clients', [ClientController::class, 'index']);
            Route::get('clients/{id}', [ClientController::class, 'show']);
            Route::post('clients', [ClientController::class, 'store']);
            Route::get('/factures/{id}/pdf', [FactureController::class, 'pdf']);

            Route::apiResource('commandes', CommandeController::class);
            Route::post('commandes/{id}/valider', [CommandeController::class, 'valider']);
            Route::post('commandes/{id}/annuler', [CommandeController::class, 'annuler']);
            Route::apiResource('factures', FactureController::class);
        });

        // Déconnexion (pour tous les utilisateurs internes)
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });

    // Routes pour les clients (Sanctum + middleware is_client)
    Route::middleware(['auth:sanctum', 'is_client'])->group(function () {
        Route::get('client/materiels', [MaterielController::class, 'index']);
        Route::get('client/commandes', [ClientCommandeController::class, 'index']);
        Route::post('client/commandes', [ClientCommandeController::class, 'store']);
        Route::get('client/factures', [ClientFactureController::class, 'index']);
        Route::get('client/factures/{id}/pdf', [ClientFactureController::class, 'pdf']);
        Route::put('client/profil', [ClientProfilController::class, 'update']);
    });
});
