#!/usr/bin/env bash

# Afficher les commandes exécutées
set -x

# Sortir en cas d'erreur
set -e

echo "Installation des dépendances..."
npm install

echo "Installation des types TypeScript..."
npm install --save @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/nodemailer

echo "Compilation TypeScript..."
npm run build

echo "Build terminé avec succès!" 