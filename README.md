# 🚀 TODJOM GAZ - Logistics & Distribution Platform

Plateforme moderne de distribution de gaz domestique au Niger, incluant une application mobile client et un écosystème administratif complet (Fournisseurs, Distributeurs, Livreurs).

## 📂 Structure du Projet

- **`portal/`** : Portail d'entrée unifié pour tous les terminaux.
- **`admin/`** : Dashboard Super Admin (Vite/React).
- **`client/`** : Application web client (Vite/React).
- **`supplier/`** : Dashboard pour les compagnies gazières.
- **`distributor/`** : Interface pour les points de vente locaux.
- **`delivery/`** : Interface pour les livreurs partenaires.
- **`backend/`** : API REST Node.js/Express (Sequelize ORM).
- **`mobile_client/`** : Application mobile native (Flutter).

## 🚀 Déploiement Rapide

### 1. Backend (Render)
Poussez ce repo sur GitHub et utilisez le fichier `render.yaml` pour créer les services automatiquement.

### 2. Frontends (Netlify)
Chaque dossier frontend contient un fichier `netlify.toml`. Déployez-les en connectant GitHub à Netlify.

### 3. Mobile (Flutter)
Configurez l'URL API dans `mobile_client/lib/core/api_service.dart` et lancez :
```bash
flutter build apk --release
```

## 🛠️ Installation Locale

1. Clonez le repo.
2. Configurez le fichier `backend/.env`.
3. Lancez la DB MySQL (XAMPP).
4. Démarrez le backend : `cd backend && npm install && npm start`.
5. Démarrez les frontends : `npm run dev`.

## 🔐 Configuration Requise
- **Twilio** : Pour les notifications SMS/WhatsApp.
- **My Nita / Amana** : Clés API de paiement.
- **Node.js 18+** & **Flutter 3.x**.

---
*Réalisé avec ❤️ pour TODJOM GAZ.*
