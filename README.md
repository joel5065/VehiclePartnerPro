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
- Base de données : PostgreSQL
- État et contexte : React Context API, TanStack Query

## Installation

```bash
# Installer les dépendances
npm install

# Créer une base de données PostgreSQL
# (La variable d'environnement DATABASE_URL doit être configurée)

# Lancer le serveur de développement
npm run dev
```

## Structure du projet

- `/client` - Interface utilisateur React
- `/server` - API Express
- `/shared` - Types et schémas partagés

## Multilinguisme

L'application supporte le français et l'anglais, avec possibilité de basculer entre les deux langues via l'interface utilisateur.

## Guide pour construire cette application à partir de zéro

### Étape 1: Configuration initiale du projet

1. Créez un nouveau projet avec Vite et React
   ```bash
   npm create vite@latest autopartplus -- --template react-ts
   cd autopartplus
   ```

2. Installez les dépendances de base
   ```bash
   # Dépendances frontend
   npm install react react-dom react-hook-form @tanstack/react-query wouter
   npm install -D typescript @types/react @types/react-dom

   # Dépendances backend
   npm install express express-session passport passport-local
   npm install -D @types/express @types/express-session @types/passport @types/passport-local

   # Dépendances UI
   npm install tailwindcss postcss autoprefixer lucide-react
   npx tailwindcss init -p
   
   # Shadcn/UI et composants
   npm install shadcn-ui class-variance-authority clsx tailwind-merge
   
   # Base de données
   npm install drizzle-orm postgres drizzle-zod zod
   npm install -D drizzle-kit
   ```

3. Configurez PostgreSQL
   ```bash
   # Créez une base de données PostgreSQL
   # Configurez les variables d'environnement (DATABASE_URL, etc.)
   ```

### Étape 2: Structure du projet et configuration

1. Créez la structure des dossiers
   ```bash
   mkdir -p client/src/{components,hooks,lib,pages,context}
   mkdir -p server
   mkdir -p shared
   ```

2. Configurez Tailwind et Vite pour le projet React

3. Créez le schéma de base de données dans `shared/schema.ts`
   - Définissez les tables pour users, products, categories, vehicle-makes, etc.
   - Créez les types d'insertion et de sélection avec Zod et Drizzle

### Étape 3: Développement du backend

1. Implémentez la connexion à la base de données dans `server/db.ts`
   - Configurez Drizzle ORM pour PostgreSQL

2. Créez l'interface de stockage dans `server/storage.ts`
   - Définissez les méthodes CRUD pour chaque modèle

3. Implémentez les routes API dans `server/routes.ts`
   - Créez des endpoints pour users, products, vehicles, cart, orders, etc.

4. Créez les scripts d'initialisation de la base de données
   - Écrivez `server/init-db.ts` pour les données de test
   - Écrivez `server/init-postgres.ts` pour PostgreSQL

### Étape 4: Développement du frontend

1. Créez les composants UI de base avec Shadcn/UI
   - Header, Footer, Layout, Cards, Buttons, etc.

2. Implémentez les contextes React
   - AuthContext pour l'authentification
   - CartContext pour le panier d'achat
   - LanguageContext pour le multilinguisme

3. Développez les pages principales
   - Home, Products, ProductDetail, Cart, Checkout, etc.
   - Register, Login, Profile pour les utilisateurs
   - Maintenance pour la planification d'entretien

4. Intégrez TanStack Query pour les requêtes API
   - Configurez un client de requête dans `client/src/lib/queryClient.ts`
   - Utilisez useQuery et useMutation pour les opérations CRUD

5. Ajoutez la compatibilité multilingue
   - Créez des fichiers de traduction pour français et anglais
   - Implémentez un sélecteur de langue dans le Header

### Étape 5: Fonctionnalités avancées

1. Implémentez le système de compatibilité des pièces
   - Filtrage des produits par véhicule

2. Créez le système de planification d'entretien
   - Calendrier d'entretien personnalisé basé sur le véhicule
   - Rappels et recommandations

3. Ajoutez le processus de paiement et de commande
   - Validation du panier
   - Processus de checkout

4. Implémentez le suivi des commandes et l'historique
   - Page d'historique des commandes
   - Détails des commandes

### Étape 6: Tests et optimisation

1. Testez toutes les fonctionnalités
   - Vérifiez les flux utilisateur
   - Testez la compatibilité mobile

2. Optimisez les performances
   - Mise en cache avec TanStack Query
   - Pagination pour les listes de produits

3. Déploiement
   - Configuration pour la production
   - Documentation finale

## Licence

MIT