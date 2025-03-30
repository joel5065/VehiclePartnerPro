#!/bin/bash

# Script pour exporter un projet Replit vers GitHub

# Créer un dossier temporaire pour les fichiers du projet
mkdir -p export-project

# Copier les fichiers importants dans le dossier d'export
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/export-project/*" | while read file; do
  # Créer le répertoire de destination si nécessaire
  mkdir -p "export-project/$(dirname "$file")"
  # Copier le fichier
  cp "$file" "export-project/$file"
done

# Créer un fichier README s'il n'existe pas
if [ ! -f export-project/README.md ]; then
  cp README.md export-project/README.md 2>/dev/null || echo "# AutoPartPlus - E-commerce de pièces automobiles" > export-project/README.md
fi

# Créer une archive ZIP
if command -v zip &> /dev/null; then
  cd export-project && zip -r ../autoparts-project.zip * && cd ..
  echo "Projet exporté avec succès dans le dossier export-project/ et dans l'archive autoparts-project.zip"
else
  echo "Projet exporté avec succès dans le dossier export-project/"
fi

echo ""
echo "Instructions pour l'import sur GitHub:"
echo "1. Créez un nouveau dépôt sur GitHub via l'interface web"
echo "2. Pour importer ce projet:"
echo "   a. Téléchargez le contenu du dossier export-project/ ou l'archive ZIP si disponible"
echo "   b. Clonez votre nouveau dépôt localement"
echo "   c. Extrayez/copiez les fichiers téléchargés dans le dépôt local"
echo "   d. Ajoutez et committez les fichiers"
echo "   e. Poussez les modifications vers GitHub"