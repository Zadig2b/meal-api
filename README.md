🍽️ KekebonKekepabon – Ibis

Application JavaScript SPA consommant l'API TheMealDB pour explorer des recettes de cuisine.

🎯 Objectif

Fournir une interface simple, mobile-first et interactive pour permettre à l’utilisateur de :

Rechercher des recettes par catégorie, pays ou ingrédient

Afficher les détails d’une recette avec image, instructions et ingrédients

Voir l’image de chaque ingrédient au survol

Le tout s’inspirant de la charte graphique de l’entreprise KekebonKekepabon.

🚀 Lancer le projet

Clonez le dépôt 

Ouvrir le fichier index.html dans votre navigateur préféré.

Aucune installation requise.

🛠️ Structure du projet

📁 projet-ibis
├── index.html         # Structure HTML de l'app (Bootstrap + SPA)
├── style.css          # Charte graphique et mise en page responsive
├── script.js          # Logique métier : appels API, affichage, interaction
├── charte-graphique.md# Spécifications visuelles du client
└── projet-ibis.pdf    # Cahier des charges et user stories

🔍 Fonctionnalités principales

✅ Recherche :

Liste déroulante Catégories (/list.php?c=list)

Liste déroulante Pays (/list.php?a=list)

Input texte Ingrédient (/filter.php?i=)

✅ Affichage :

Résultats sous forme de cartes cliquables

Détails : image, instructions, ingrédients avec images (tooltip)

✅ UX :

SPA sans rechargement

Responsive (mobile-first)

Bouton "Retour" pour revenir aux filtres précédents

📦 API utilisée

L'application consomme l’API TheMealDB via fetch :

Liste des catégories : /list.php?c=list

Liste des pays : /list.php?a=list

Recherche par ingrédient : /filter.php?i=...

Recherche par catégorie/pays : /filter.php?c=..., /filter.php?a=...

Détail d’une recette : /lookup.php?i=...

Image des ingrédients :

https://www.themealdb.com/images/ingredients/<ingredient>-small.png

🎨 Charte graphique 

Vert nature #4CAF50

Orange vitaminé #FF9800

Gris doux #9E9E9E

Font titres : Montserrat

Font textes : Open Sans

👨‍💻 Auteur

Romain Dugeay

Projet réalisé dans le cadre d’un Brief Simplon

📄 Licence

Projet libre de droit dans le cadre d’un exercice pédagogique.