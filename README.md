# ATE Leslie Project

Projet événementiel minimaliste suivant la philosophie KISS.

## 🚀 Installation

1. Prérequis

   - Node.js (v16 ou supérieur)
   - MongoDB installé localement
   - Un compte SMTP pour les emails (ex: Gmail, Mailtrap)

2. Cloner le projet

```bash
git clone [url-du-repo]
cd ate-leslie-project
```

3. Installer les dépendances

```bash
npm run install-all
```

## 💻 Développement

1. Configuration

```bash
# Backend
cp backend/.env.development backend/.env
# Modifier les variables dans .env selon votre environnement
```

2. Démarrer MongoDB localement

```bash
# Sur Ubuntu/Debian
sudo service mongodb start

# Sur macOS avec Homebrew
brew services start mongodb-community
```

3. Démarrer en mode développement

```bash
npm run dev
```

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Tests backend uniquement
cd backend && npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

## 🌍 Déploiement

1. Préparation

   - Créer une base de données MongoDB (Atlas ou autre)
   - Configurer un service SMTP pour les emails
   - Choisir un hébergeur (ex: DigitalOcean, Heroku, OVH)

2. Configuration

```bash
# Copier et configurer l'environnement de production
cp backend/.env.production backend/.env
# Modifier les variables avec vos valeurs de production
```

3. Build et démarrage

```bash
# Build des applications
npm run build

# Démarrer en production
npm start
```

## 📁 Structure du Projet

```
.
├── backend/                # API TypeScript/Express
│   ├── src/
│   │   ├── __tests__/    # Tests unitaires et d'intégration
│   │   ├── controllers/  # Contrôleurs
│   │   ├── middleware/   # Middleware
│   │   ├── models/       # Modèles Mongoose
│   │   └── routes/       # Routes
│   └── ...
│
└── frontend/             # Application React
    ├── src/
    │   ├── components/   # Composants React
    │   ├── pages/        # Pages
    │   ├── styles/       # Fichiers SASS
    │   └── assets/       # Images, fonts, etc.
    └── ...
```

## 🛠 Technologies

- **Backend**: TypeScript, Express.js, MongoDB
- **Frontend**: React, SASS
- **Tests**: Jest, Supertest
- **Emails**: Nodemailer

## 📝 Scripts disponibles

### Développement

- `npm run dev`: Démarre le frontend et le backend en mode développement
- `npm run frontend:dev`: Démarre uniquement le frontend
- `npm run backend:dev`: Démarre uniquement le backend

### Tests

- `npm test`: Lance tous les tests
- `npm run test:watch`: Lance les tests en mode watch
- `npm run test:coverage`: Lance les tests avec couverture

### Production

- `npm run build`: Build les applications
- `npm start`: Démarre en production

## 📋 Checklist de déploiement

1. Base de données

   - [ ] MongoDB configuré et accessible
   - [ ] Variables de connexion sécurisées
   - [ ] Backup automatique configuré

2. Emails

   - [ ] Service SMTP configuré
   - [ ] Templates d'emails testés
   - [ ] Logs d'envoi configurés

3. Sécurité
   - [ ] CORS configuré correctement
   - [ ] Headers sécurisés (Helmet)
   - [ ] Rate limiting en place
   - [ ] Validation des entrées
