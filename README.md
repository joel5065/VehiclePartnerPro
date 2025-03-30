# AutoPartPlus - E-commerce de pièces automobiles

Application e-commerce pour pièces automobiles avec fonctionnalité de planification d'entretien personnalisée.

## Fonctionnalités

- 🛒 Achat en ligne de pièces automobiles
- 🚗 Sélection de véhicules et compatibilité des pièces
- 🔧 Planification d'entretien personnalisée selon votre véhicule
- 📅 Suivi d'historique de service
- 🌐 Support multilingue (français et anglais)
- 👤 Gestion de profil utilisateur

## Technologies utilisées

- Frontend : React, TypeScript, TailwindCSS, Shadcn/UI
- Backend : Node.js, Express
- Base de données : PostgreSQL (In-memory pour le développement)
- État et contexte : React Context API, TanStack Query

## Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Structure du projet

- `/client` - Interface utilisateur React
- `/server` - API Express
- `/shared` - Types et schémas partagés

## Multilinguisme

L'application supporte le français et l'anglais, avec possibilité de basculer entre les deux langues via l'interface utilisateur.

## Licence

MIT