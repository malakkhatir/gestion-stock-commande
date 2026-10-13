<h1 align="center">📦 Gestion de Stock et de Commande</h1>

<p align="center">
  Application web de gestion de stock, de commandes et de facturation<br>
  <b>Laravel 12 · React 19 · MySQL · Sanctum · DomPDF · Tailwind CSS</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel_12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/PHP_8.2-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Sanctum-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Sanctum">
</p>

---

## 📌 Présentation

Application web **full-stack** de gestion de stock, de commandes et de facturation.

- **Backend** : API REST Laravel 12 (`backend/`)
- **Frontend** : Interface React 19 adaptée aux différents profils métiers (`frontend/`)
- **Base de données** : MySQL / MariaDB

---

## ✨ Fonctionnalités

- 🔐 **Authentification** par jetons Laravel Sanctum avec accès contrôlé par rôle
- 📚 **Gestion du catalogue** : matériels, types de matériel, partenaires, villes, adresses de stock
- 📊 **Suivi des stocks** : seuils de sécurité, alertes et transferts entre emplacements
- 🛒 **Commandes** : création, validation, annulation — y compris les réservations clients
- 🧾 **Factures PDF** : génération et téléchargement
- 📈 **Tableaux de bord** dédiés : administrateurs, directeurs des ventes, responsables de stock, vendeurs et clients

---

## 🧰 Technologies

| Partie | Technologies |
|--------|--------------|
| **Backend** | PHP 8.2+, Laravel 12, Laravel Sanctum, DomPDF |
| **Frontend** | React 19, Vite, React Router, Axios, Tailwind CSS |
| **Base de données** | MySQL / MariaDB |

---

## 📁 Structure du projet

```text
.
├── backend/             # API Laravel, migrations, seeders et génération PDF
├── frontend/            # Interface React/Vite
└── README.md
```

> 💡 L'API est préfixée par `/api/v1`. En développement, le serveur Vite transmet les requêtes `/api` vers Laravel sur le port `8000`.

---

## ✅ Prérequis

- **PHP** 8.2 ou supérieur, avec les extensions nécessaires à Laravel et `pdo_mysql`
- **Composer** 2
- **Node.js** 20.19+ (ou 22.12+) et **npm**
- **MySQL** 8+ ou **MariaDB**

---

## 🚀 Installation

### 1️⃣ Créer la base de données

Crée une base MySQL/MariaDB, par exemple `gestion_stock`.

### 2️⃣ Configurer et installer le backend

Depuis le dossier `backend`, copie d'abord le fichier d'environnement :

```bash
copy .env.example .env
```

> 🍎 Sous macOS ou Linux, remplace cette commande par `cp .env.example .env`.

Renseigne ensuite les paramètres de base de données dans `.env` :

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_stock
DB_USERNAME=root
DB_PASSWORD=
```

Installe ensuite les dépendances, génère la clé de l'application et crée les données locales :

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
npm install
```

> ⚠️ Le seeder de démonstration **vide et recrée** les tables applicatives. Ne l'exécute pas sur une base contenant des données à conserver.

### 3️⃣ Installer le frontend

Dans un second terminal :

```bash
cd frontend
npm install
```

### 4️⃣ Démarrer l'application

**Terminal 1 — Backend** :

```bash
cd backend
php artisan serve
```

**Terminal 2 — Frontend** :

```bash
cd frontend
npm run dev
```

Ouvre ensuite l'adresse affichée par Vite, habituellement **http://localhost:5173**.

L'API est alors disponible sur **http://localhost:8000/api/v1**.

---

## 👥 Comptes de démonstration

Après `php artisan migrate --seed`, les comptes suivants sont disponibles :

| Rôle | Adresse e-mail | Mot de passe |
|------|----------------|--------------|
| 🔴 Administrateur | `admin@stock.ma` | `password` |
| 🟠 Directeur des ventes | `directeur@stock.ma` | `password` |
| 🟡 Responsable de stock | `responsable@stock.ma` | `password` |
| 🟢 Vendeur | `vendeur1@stock.ma` | `password` |
| 🔵 Client | `hassan@client.ma` | `client123` |

> 🔐 Ces identifiants sont destinés au **développement uniquement**. Change-les ou supprime le seeding avant toute mise en production.

---

## 🔑 Droits par profil

| Profil | Principales actions |
|--------|---------------------|
| 🔴 **Administrateur** | Gestion des utilisateurs, référentiels, stocks, clients, commandes et factures |
| 🟠 **Directeur des ventes** | Consultation du tableau de bord, reporting, stock, commandes et factures |
| 🟡 **Responsable de stock** | Gestion du matériel, transferts et alertes de stock |
| 🟢 **Vendeur** | Consultation du stock, gestion des clients, commandes et factures |
| 🔵 **Client** | Réservation de matériel, suivi de ses commandes, factures et profil |

---

## 🛠️ Commandes utiles

Exécute les commandes depuis le dossier concerné.

```bash
# Backend : lancer les tests
cd backend
php artisan test

# Backend : nettoyer les caches de configuration
php artisan optimize:clear

# Frontend : créer le build de production
cd frontend
npm run build

# Frontend : analyser le code
npm run lint
```

---

## 🔌 API

L'authentification se fait avec un **jeton Bearer** retourné par `POST /api/v1/login`.

Les principaux groupes de ressources sont :

- `materiels`, `types`, `partenaires`, `villes`, `adresses-stock` et `points-vente`
- `clients`, `commandes` et `factures`
- `dashboard` et `stock/alertes`
- les ressources client sous `client/*`

> 📖 Les routes détaillées et les autorisations associées se trouvent dans [`backend/routes/api.php`](backend/routes/api.php).

---

## 🚀 Production

Avant un déploiement, configure des valeurs sûres dans `backend/.env` :

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=<clé propre>
```

Ainsi que :

- Des identifiants de base de données **dédiés**
- Une **origine CORS** adaptée à l'URL du frontend
- Construire l'interface avec `npm run build`

---

## 📄 Licence

Projet pédagogique — **Travaux Pratiques**. Libre d'utilisation à des fins éducatives.

---

## 👩‍💻 Auteure

**Malak Khatir**
