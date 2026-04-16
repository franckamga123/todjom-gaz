# 🔥 TODJOM GAZ — Backend API

## Installation rapide

### Prérequis
- **Node.js** v18+ installé
- **XAMPP** avec MySQL démarré
- **Git** (optionnel)

### Étapes d'installation

#### Option 1 : Script automatique
Double-cliquez sur `install.bat` — tout se fait automatiquement.

#### Option 2 : Manuel

```bash
# 1. Installer les dépendances
cd backend
npm install

# 2. Créer la base de données
C:\xampp\mysql\bin\mysql.exe -u root < database\schema.sql

# 3. Seeder les données de test
npm run seed

# 4. Démarrer le serveur
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| POST | `/auth/verify-otp` | Vérification SMS |
| POST | `/auth/forgot-password` | Mot de passe oublié |
| GET | `/auth/me` | Mon profil |

### Commandes
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/orders` | Créer commande |
| GET | `/orders` | Lister commandes |
| GET | `/orders/:id` | Détail commande |
| PUT | `/orders/:id/status` | Changer statut |
| POST | `/orders/:id/cancel` | Annuler |
| POST | `/orders/:id/pay` | Confirmer paiement (dev) |

### Produits & Fournisseurs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/suppliers` | Liste fournisseurs |
| GET | `/suppliers/:id/products` | Produits d'un fournisseur |
| POST | `/products` | Ajouter produit (fournisseur) |
| PUT | `/products/:id` | Modifier produit |
| DELETE | `/products/:id` | Supprimer produit |

### Admin
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/admin/dashboard` | KPIs |
| GET | `/admin/users` | Utilisateurs |
| PUT | `/admin/users/:id/toggle` | Activer/Désactiver |
| PUT | `/admin/suppliers/:id/validate` | Valider fournisseur |
| GET | `/admin/disputes` | Litiges |
| GET | `/admin/logs` | Logs système |

## Comptes de test

| Rôle | Login | Mot de passe |
|------|-------|-------------|
| Admin | admin@todjomgaz.com | admin123 |
| Fournisseur | contact@nigergaz.ne | fournisseur123 |
| Distributeur | +22790200001 | livreur123 |
| Client | +22790300001 | client123 |

## Stack technique

- **Runtime** : Node.js + Express.js
- **ORM** : Sequelize
- **Base** : MySQL (XAMPP)
- **Auth** : JWT + bcrypt
- **Validation** : express-validator
