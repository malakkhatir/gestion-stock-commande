<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        // Désactiver les contraintes pour pouvoir truncater
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Nettoyer les tables dans l'ordre inverse des dépendances
        $tables = [
            'factures',
            'ligne_commandes',
            'commandes',
            'clients',
            'materiels',
            'partenaires',
            'adresse_stocks',
            'point_de_ventes',
            'villes',
            'type_materiels',
            'vehicles',
            'vendeurs',
            'responsables_stock',
            'directeurs_ventes',
            'administrateurs',
            'users',
            // 'materiel_vehicle' // on ignore car vide
        ];
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
                $this->command->info("🗑️ Table '{$table}' vidée.");
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ------------------------------------------------------------
        // 1. Utilisateurs (users)
        // ------------------------------------------------------------
        $users = [
            ['name' => 'Admin Global', 'email' => 'admin@stock.ma', 'password' => Hash::make('password')],
            ['name' => 'Directeur Ventes', 'email' => 'directeur@stock.ma', 'password' => Hash::make('password')],
            ['name' => 'Responsable Stock Nord', 'email' => 'responsable@stock.ma', 'password' => Hash::make('password')],
            ['name' => 'Vendeur 1', 'email' => 'vendeur1@stock.ma', 'password' => Hash::make('password')],
            ['name' => 'Vendeur 2', 'email' => 'vendeur2@stock.ma', 'password' => Hash::make('password')],
            ['name' => 'Vendeur 3', 'email' => 'vendeur3@stock.ma', 'password' => Hash::make('password')],
        ];
        foreach ($users as $u) {
            DB::table('users')->insert([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => $u['password'],
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $userIds = DB::table('users')->pluck('id')->toArray();
        // On s'assure d'avoir au moins 5 users
        $this->command->info('✅ Utilisateurs créés.');

        // ------------------------------------------------------------
        // 2. Rôles (administrateurs, directeurs_ventes, responsables_stock, vendeurs)
        // ------------------------------------------------------------
        // On associe les users aux rôles
        // Admin -> user[0]
        if (Schema::hasTable('administrateurs')) {
            DB::table('administrateurs')->insert(['user_id' => $userIds[0], 'created_at' => $now, 'updated_at' => $now]);
        }
        // Directeur ventes -> user[1]
        if (Schema::hasTable('directeurs_ventes')) {
            DB::table('directeurs_ventes')->insert(['user_id' => $userIds[1], 'created_at' => $now, 'updated_at' => $now]);
        }
        // Responsable stock -> user[2]
        if (Schema::hasTable('responsables_stock')) {
            DB::table('responsables_stock')->insert(['user_id' => $userIds[2], 'created_at' => $now, 'updated_at' => $now]);
        }
        // Vendeurs -> users[3], users[4], users[5]
        if (Schema::hasTable('vendeurs')) {
            foreach ([3, 4, 5] as $idx) {
                if (isset($userIds[$idx])) {
                    DB::table('vendeurs')->insert(['user_id' => $userIds[$idx], 'created_at' => $now, 'updated_at' => $now]);
                }
            }
        }
        $this->command->info('✅ Rôles attribués.');

        // ------------------------------------------------------------
        // 3. Ville (placeholder minimal)
        // Le catalogue des villes est désormais géré par l'admin via /admin/villes.
        // On crée uniquement l'entrée nécessaire pour rattacher les adresses de
        // stock, partenaires et points de vente ci-dessous.
        // ------------------------------------------------------------
        $villeId = DB::table('villes')->insertGetId([
            'code' => 'DEFAULT',
            'libelle' => 'Ville par défaut',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $villeIds = array_fill(0, 5, $villeId);
        $this->command->info('✅ Ville par défaut créée (catalogue géré via l\'admin).');

        // ------------------------------------------------------------
        // 4. Types de matériels
        // ------------------------------------------------------------
        $types = ['Électronique', 'Mécanique', 'Hydraulique', 'Informatique', 'Électroménager'];
        foreach ($types as $libelle) {
            DB::table('type_materiels')->insert([
                'libelle' => $libelle,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $typeIds = DB::table('type_materiels')->pluck('id')->toArray();
        $this->command->info('✅ Types de matériels créés.');

        // ------------------------------------------------------------
        // 5. Adresses de stock
        // ------------------------------------------------------------
        $adresses = [
            ['code' => 'STK-001', 'nom' => 'Entrepôt Nord', 'ville_id' => $villeIds[0], 'adresse' => '12 Rue des Manufacturiers'],
            ['code' => 'STK-002', 'nom' => 'Dépôt Sud', 'ville_id' => $villeIds[1], 'adresse' => '45 Avenue de l\'Industrie'],
            ['code' => 'STK-003', 'nom' => 'Stock Central', 'ville_id' => $villeIds[2], 'adresse' => '78 Boulevard Commercial'],
            ['code' => 'STK-004', 'nom' => 'Entrepôt Est', 'ville_id' => $villeIds[3], 'adresse' => '3 Rue des Artisans'],
            ['code' => 'STK-005', 'nom' => 'Dépôt Ouest', 'ville_id' => $villeIds[4], 'adresse' => '9 Zone Industrielle'],
        ];
        foreach ($adresses as $addr) {
            DB::table('adresse_stocks')->insert([
                'code' => $addr['code'],
                'nom' => $addr['nom'],
                'ville_id' => $addr['ville_id'],
                'adresse' => $addr['adresse'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $adresseIds = DB::table('adresse_stocks')->pluck('id')->toArray();
        $this->command->info('✅ Adresses de stock créées.');

        // ------------------------------------------------------------
        // 6. Points de vente
        // ------------------------------------------------------------
        $points = [
            ['code' => 'PV-001', 'nom' => 'Magasin Casa', 'adresse' => '5 Rue du Centre', 'ville_id' => $villeIds[0]],
            ['code' => 'PV-002', 'nom' => 'Succursale Rabat', 'adresse' => '12 Avenue Mohammed V', 'ville_id' => $villeIds[1]],
            ['code' => 'PV-003', 'nom' => 'Dépôt Fès', 'adresse' => '8 Quartier Industriel', 'ville_id' => $villeIds[2]],
            ['code' => 'PV-004', 'nom' => 'Showroom Tanger', 'adresse' => '22 Boulevard de la Mer', 'ville_id' => $villeIds[3]],
            ['code' => 'PV-005', 'nom' => 'Boutique Marrakech', 'adresse' => '17 Rue de la Liberté', 'ville_id' => $villeIds[4]],
        ];
        foreach ($points as $pt) {
            DB::table('point_de_ventes')->insert([
                'code' => $pt['code'],
                'nom' => $pt['nom'],
                'adresse' => $pt['adresse'],
                'ville_id' => $pt['ville_id'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $pointIds = DB::table('point_de_ventes')->pluck('id')->toArray();
        $this->command->info('✅ Points de vente créés.');

        // ------------------------------------------------------------
        // 7. Partenaires (fournisseurs et fabricants)
        // ------------------------------------------------------------
        $partenaires = [
            [
                'code' => 'FOU-001', 'type' => 'fournisseur', 'nom' => 'Materiel Pro',
                'contact' => 'Ali Benani', 'telephone1' => '0612345678', 'telephone2' => '0612345679',
                'email' => 'ali@materielpro.ma', 'pays' => 'Maroc', 'ville_id' => $villeIds[0],
                'adresse' => '15 Rue des Fournisseurs'
            ],
            [
                'code' => 'FOU-002', 'type' => 'fournisseur', 'nom' => 'TechDistrib',
                'contact' => 'Sara El Fassi', 'telephone1' => '0623456789', 'telephone2' => null,
                'email' => 'sara@techdistrib.ma', 'pays' => 'Maroc', 'ville_id' => $villeIds[1],
                'adresse' => '22 Avenue de la Technologie'
            ],
            [
                'code' => 'FAB-001', 'type' => 'fabricant', 'nom' => 'MecaMaroc',
                'contact' => 'Omar Tazi', 'telephone1' => '0634567890', 'telephone2' => '0634567891',
                'email' => 'omar@mecamaroc.ma', 'pays' => 'Maroc', 'ville_id' => $villeIds[2],
                'adresse' => '4 Zone Franche'
            ],
            [
                'code' => 'FAB-002', 'type' => 'fabricant', 'nom' => 'ElecPlus',
                'contact' => 'Nadia Kabbaj', 'telephone1' => '0645678901', 'telephone2' => null,
                'email' => 'nadia@elecplus.ma', 'pays' => 'Maroc', 'ville_id' => $villeIds[3],
                'adresse' => '9 Rue des Électriciens'
            ],
            [
                'code' => 'FOU-003', 'type' => 'fournisseur', 'nom' => 'Global Supply',
                'contact' => 'Youssef El Amrani', 'telephone1' => '0656789012', 'telephone2' => '0656789013',
                'email' => 'youssef@globalsupply.ma', 'pays' => 'Maroc', 'ville_id' => $villeIds[4],
                'adresse' => '33 Boulevard du Commerce'
            ],
        ];
        foreach ($partenaires as $p) {
            DB::table('partenaires')->insert([
                'code' => $p['code'],
                'type' => $p['type'],
                'nom' => $p['nom'],
                'contact' => $p['contact'],
                'telephone1' => $p['telephone1'],
                'telephone2' => $p['telephone2'],
                'email' => $p['email'],
                'pays' => $p['pays'],
                'ville_id' => $p['ville_id'],
                'adresse' => $p['adresse'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $fournisseurIds = DB::table('partenaires')->where('type', 'fournisseur')->pluck('id')->toArray();
        $fabricantIds = DB::table('partenaires')->where('type', 'fabricant')->pluck('id')->toArray();
        $this->command->info('✅ Partenaires créés.');

        // ------------------------------------------------------------
        // 8. Véhicules (si nécessaire)
        // ------------------------------------------------------------
        $vehicules = [
            ['marque' => 'Toyota', 'modele' => 'Hilux', 'annee' => 2022],
            ['marque' => 'Renault', 'modele' => 'Kangoo', 'annee' => 2021],
            ['marque' => 'Peugeot', 'modele' => 'Boxer', 'annee' => 2023],
            ['marque' => 'Mercedes', 'modele' => 'Sprinter', 'annee' => 2020],
            ['marque' => 'Ford', 'modele' => 'Transit', 'annee' => 2022],
        ];
        foreach ($vehicules as $v) {
            DB::table('vehicles')->insert([
                'marque' => $v['marque'],
                'modele' => $v['modele'],
                'annee' => $v['annee'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        // On ne gère pas la table pivot materiel_vehicle car vide
        $this->command->info('✅ Véhicules créés.');

        // ------------------------------------------------------------
        // 9. Matériels
        // ------------------------------------------------------------
        $materiels = [
            [
                'reference' => 'MAT-001', 'nom' => 'Ordinateur Portable',
                'description' => 'PC portable 15 pouces', 'type_materiel_id' => $typeIds[0],
                'fournisseur_id' => $fournisseurIds[0] ?? null, 'fabricant_id' => $fabricantIds[0] ?? null,
                'prixAchat' => 3500.00, 'prixVente' => 4500.00, 'dateAchat' => '2025-01-15',
                'quantiteDisponible' => 10, 'adresse_stock_id' => $adresseIds[0]
            ],
            [
                'reference' => 'MAT-002', 'nom' => 'Moteur Hydraulique',
                'description' => 'Moteur 5HP', 'type_materiel_id' => $typeIds[2],
                'fournisseur_id' => $fournisseurIds[1] ?? null, 'fabricant_id' => $fabricantIds[1] ?? null,
                'prixAchat' => 800.00, 'prixVente' => 1200.00, 'dateAchat' => '2025-02-10',
                'quantiteDisponible' => 5, 'adresse_stock_id' => $adresseIds[1]
            ],
            [
                'reference' => 'MAT-003', 'nom' => 'Écran 24"',
                'description' => 'Écran LED Full HD', 'type_materiel_id' => $typeIds[3],
                'fournisseur_id' => $fournisseurIds[2] ?? null, 'fabricant_id' => $fabricantIds[0] ?? null,
                'prixAchat' => 1200.00, 'prixVente' => 1600.00, 'dateAchat' => '2025-01-20',
                'quantiteDisponible' => 8, 'adresse_stock_id' => $adresseIds[2]
            ],
            [
                'reference' => 'MAT-004', 'nom' => 'Pompe à Eau',
                'description' => 'Pompe centrifuge 1.5kW', 'type_materiel_id' => $typeIds[1],
                'fournisseur_id' => $fournisseurIds[0] ?? null, 'fabricant_id' => $fabricantIds[1] ?? null,
                'prixAchat' => 450.00, 'prixVente' => 650.00, 'dateAchat' => '2025-03-01',
                'quantiteDisponible' => 12, 'adresse_stock_id' => $adresseIds[3]
            ],
            [
                'reference' => 'MAT-005', 'nom' => 'Réfrigérateur',
                'description' => 'Réfrigérateur 200L', 'type_materiel_id' => $typeIds[4],
                'fournisseur_id' => $fournisseurIds[1] ?? null, 'fabricant_id' => $fabricantIds[0] ?? null,
                'prixAchat' => 2500.00, 'prixVente' => 3200.00, 'dateAchat' => '2025-02-15',
                'quantiteDisponible' => 3, 'adresse_stock_id' => $adresseIds[4]
            ],
        ];
        foreach ($materiels as $m) {
            DB::table('materiels')->insert([
                'reference' => $m['reference'],
                'nom' => $m['nom'],
                'description' => $m['description'],
                'type_materiel_id' => $m['type_materiel_id'],
                'fournisseur_id' => $m['fournisseur_id'],
                'fabricant_id' => $m['fabricant_id'],
                'prixAchat' => $m['prixAchat'],
                'prixVente' => $m['prixVente'],
                'dateAchat' => $m['dateAchat'],
                'quantiteDisponible' => $m['quantiteDisponible'],
                'adresse_stock_id' => $m['adresse_stock_id'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $materielIds = DB::table('materiels')->pluck('id')->toArray();
        $this->command->info('✅ Matériels créés.');

        // ------------------------------------------------------------
        // 10. Clients
        // ------------------------------------------------------------
        $clients = [
            ['CIN' => 'AB12345', 'nom' => 'Hassan El Fassi', 'telephone' => '0611111111', 'email' => 'hassan@client.ma', 'dateCreation' => '2025-01-01', 'motDePasse' => Hash::make('client123')],
            ['CIN' => 'CD67890', 'nom' => 'Nadia Benjelloun', 'telephone' => '0622222222', 'email' => 'nadia@client.ma', 'dateCreation' => '2025-01-15', 'motDePasse' => Hash::make('client123')],
            ['CIN' => 'EF11223', 'nom' => 'Karim Tazi', 'telephone' => '0633333333', 'email' => 'karim@client.ma', 'dateCreation' => '2025-02-01', 'motDePasse' => Hash::make('client123')],
            ['CIN' => 'GH44556', 'nom' => 'Salma El Amrani', 'telephone' => '0644444444', 'email' => 'salma@client.ma', 'dateCreation' => '2025-02-15', 'motDePasse' => Hash::make('client123')],
            ['CIN' => 'IJ77889', 'nom' => 'Omar Ait', 'telephone' => '0655555555', 'email' => 'omar@client.ma', 'dateCreation' => '2025-03-01', 'motDePasse' => Hash::make('client123')],
        ];
        foreach ($clients as $c) {
            DB::table('clients')->insert([
                'CIN' => $c['CIN'],
                'nom' => $c['nom'],
                'telephone' => $c['telephone'],
                'email' => $c['email'],
                'dateCreation' => $c['dateCreation'],
                'motDePasse' => $c['motDePasse'],
                'created_at' => $now,
                'updated_at' => $now,
                // user_id peut être null ou lié à un user existant
                'user_id' => $userIds[array_rand($userIds)] ?? null,
            ]);
        }
        $clientIds = DB::table('clients')->pluck('id')->toArray();
        $this->command->info('✅ Clients créés.');

        // ------------------------------------------------------------
        // 11. Commandes
        // ------------------------------------------------------------
        $statuts = ['en_attente', 'retiree', 'annulee'];
        // On prend les 3 premiers vendeurs (users) pour les commandes
        $vendeurUserIds = array_slice($userIds, 3, 3); // les users ayant le rôle vendeur
        if (count($vendeurUserIds) < 3) {
            // fallback : utiliser tous les users
            $vendeurUserIds = $userIds;
        }

        $commandes = [
            [
                'client_id' => $clientIds[0] ?? null, 'is_nr' => 0, 'client_nom' => null,
                'materiel_id' => $materielIds[0], 'quantite' => 2,
                'vendeur_id' => $vendeurUserIds[0] ?? $userIds[0],
                'adresse_stock_id' => $adresseIds[0],
                'dateCommande' => $now, 'dateAchat' => $now, 'dateDisponibilite' => '2025-01-10',
                'prixHT' => 9000.00, 'prixTTC' => 10800.00, 'statut' => $statuts[0]
            ],
            [
                'client_id' => $clientIds[1] ?? null, 'is_nr' => 0, 'client_nom' => null,
                'materiel_id' => $materielIds[1], 'quantite' => 1,
                'vendeur_id' => $vendeurUserIds[1] ?? $userIds[1],
                'adresse_stock_id' => $adresseIds[1],
                'dateCommande' => $now, 'dateAchat' => $now, 'dateDisponibilite' => '2025-02-20',
                'prixHT' => 1200.00, 'prixTTC' => 1440.00, 'statut' => $statuts[0]
            ],
            [
                'client_id' => $clientIds[2] ?? null, 'is_nr' => 0, 'client_nom' => null,
                'materiel_id' => $materielIds[2], 'quantite' => 3,
                'vendeur_id' => $vendeurUserIds[2] ?? $userIds[2],
                'adresse_stock_id' => $adresseIds[2],
                'dateCommande' => $now, 'dateAchat' => $now, 'dateDisponibilite' => '2025-01-25',
                'prixHT' => 4800.00, 'prixTTC' => 5760.00, 'statut' => $statuts[1]
            ],
            [
                'client_id' => $clientIds[3] ?? null, 'is_nr' => 0, 'client_nom' => null,
                'materiel_id' => $materielIds[3], 'quantite' => 5,
                'vendeur_id' => $vendeurUserIds[0] ?? $userIds[0],
                'adresse_stock_id' => $adresseIds[3],
                'dateCommande' => $now, 'dateAchat' => $now, 'dateDisponibilite' => '2025-03-05',
                'prixHT' => 3250.00, 'prixTTC' => 3900.00, 'statut' => $statuts[0]
            ],
            [
                'client_id' => $clientIds[4] ?? null, 'is_nr' => 0, 'client_nom' => null,
                'materiel_id' => $materielIds[4], 'quantite' => 1,
                'vendeur_id' => $vendeurUserIds[1] ?? $userIds[1],
                'adresse_stock_id' => $adresseIds[4],
                'dateCommande' => $now, 'dateAchat' => $now, 'dateDisponibilite' => '2025-02-28',
                'prixHT' => 3200.00, 'prixTTC' => 3840.00, 'statut' => $statuts[2]
            ],
        ];
        foreach ($commandes as $cmd) {
            $commandeId = DB::table('commandes')->insertGetId([
                'client_id' => $cmd['client_id'],
                'is_nr' => $cmd['is_nr'],
                'client_nom' => $cmd['client_nom'],
                'vendeur_id' => $cmd['vendeur_id'],
                'adresse_stock_id' => $cmd['adresse_stock_id'],
                'dateCommande' => $cmd['dateCommande'],
                'dateAchat' => $cmd['dateAchat'],
                'dateDisponibilite' => $cmd['dateDisponibilite'],
                'prixHT' => $cmd['prixHT'],
                'prixTTC' => $cmd['prixTTC'],
                'statut' => $cmd['statut'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('ligne_commandes')->insert([
                'commande_id' => $commandeId,
                'materiel_id' => $cmd['materiel_id'],
                'quantite' => $cmd['quantite'],
                'prixHT' => $cmd['prixHT'],
                'prixTTC' => $cmd['prixTTC'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $commandeIds = DB::table('commandes')->pluck('id')->toArray();
        $this->command->info('✅ Commandes créées.');

        // ------------------------------------------------------------
        // 12. Factures
        // ------------------------------------------------------------
        $commandesRetirees = DB::table('commandes')->where('statut', 'retiree')->pluck('id');
        foreach ($commandesRetirees as $cid) {
            DB::table('factures')->insert([
                'reference' => 'FAC-'.str_pad($cid, 4, '0', STR_PAD_LEFT),
                'commande_id' => $cid,
                'generee_par' => $userIds[array_rand($userIds)], // un admin ou vendeur
                'date_generation' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        $this->command->info('✅ Factures créées.');

        // ------------------------------------------------------------
        // Optionnel : la table materiel_vehicle n'a pas de colonnes, on l'ignore.
        // ------------------------------------------------------------

        $this->command->info('🎉 Seeding terminé avec succès !');
    }
}