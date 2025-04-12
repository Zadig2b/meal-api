# Documentation Technique – Projet Ibis

## Présentation du projet
**Nom du projet** : Ibis  
**Client** : KekebonKekepabon (entreprise spécialisée en conseil en nutrition)  
**Objectif** : Développement d’une application web (POC) permettant de consulter des recettes via l’API publique [TheMealDB](https://www.themealdb.com/api.php).  

Le projet est conçu comme une **Single Page Application (SPA)**, **responsive** et pensée **mobile-first**, s’intégrant dans le site existant du client.

---

## Fonctionnalités principales

### 🎯 User Stories (fonctionnelles)
1. Depuis la page d’accueil, l’utilisateur peut rechercher des recettes :
   - Par **catégorie** (liste déroulante)
   - Par **pays** (liste déroulante)
   - Par **ingrédient** (champ texte avec déclenchement différé)

2. L’application affiche une **liste de recettes** correspondant aux filtres combinés.

3. Au clic sur une recette, l’utilisateur accède à :
   - L’image du plat
   - La liste d’ingrédients
   - Les instructions détaillées

4. Au survol d’un ingrédient, une **infobulle dynamique** s’affiche avec des informations sur cet ingrédient (nom, description).

### 🧪 Bonus
- Prévu : affichage d’un **drapeau du pays** d’origine de la recette via une API tierce (option non implémentée par défaut).

---

## Architecture technique

### 📁 Fichiers principaux
- `index.html` : structure de l’application, formulaire de recherche, affichage dynamique.
- `style.css` : charte graphique de l’entreprise, responsive, couleurs/thèmes personnalisés.
- `script.js` : logique principale JavaScript, gestion API, événements DOM.

### 📐 Charte graphique
D'après le fichier `charte-graphique.md` :
- **Couleurs** :
  - Vert nature `#4CAF50`
  - Orange vitaminé `#FF9800`
  - Gris doux `#9E9E9E`
  - Blanc pur `#FFFFFF`
- **Typographies** :
  - Titres : Montserrat (gras)
  - Texte : Open Sans
- **Composants UI** : boutons arrondis, disposition aérée, icônes minimalistes

---

## Intégration de l’API TheMealDB

### 🔄 Endpoints utilisés
- Liste des catégories : `/list.php?c=list`
- Liste des zones (pays) : `/list.php?a=list`
- Recherche par ingrédient : `/filter.php?i=`
- Recherche par catégorie : `/filter.php?c=`
- Recherche par pays : `/filter.php?a=`
- Détail recette : `/lookup.php?i=`
- Détail ingrédient : `/search.php?i=`

### ⚙️ Approche technique
- Requêtes API via `fetch()`
- Fonctions async/await (pour fetch direct)
- `Promise.all()` pour combiner plusieurs filtres (intersection de résultats)
- Gestion d’erreurs via `try/catch`

---

## SPA & Navigation

- Aucune redirection / rechargement de page.
- Lorsqu’un utilisateur clique sur une recette :
  - La section principale `<main>` est remplacée dynamiquement par les détails de la recette.
  - Un bouton "← Retour" restaure la structure précédente (formulaire et résultats) sans perte des filtres.
  
- Restauration de l'état par :
  - Réinjection du formulaire et des listes via JavaScript.
  - Réapplication des filtres précédents sauvegardés.
  - Relancement automatique de la recherche après restauration.

---

## Comportement interactif

- **Filtrage en temps réel** : chaque modification d’un filtre déclenche une nouvelle recherche sans clic bouton.
- **Délai de saisie sur ingrédient** : déclenchement `setTimeout(500ms)` pour éviter les appels trop fréquents.
- **Infobulle** : créée dynamiquement lors du survol, supprimée à la sortie de l’élément.

---

## Améliorations possibles
- Ajout d’un loader ou skeleton en attendant les résultats.
- Mise en cache des données API (catégories, pays, ingrédients).
- Traduction des textes (actuellement en anglais).
- Affichage du drapeau du pays via `flagcdn.com` ou API similaire.

---

## Dépendances externes
- [Bootstrap 5.3.3](https://getbootstrap.com/)
- [Google Fonts](https://fonts.google.com/) (Montserrat & Open Sans)
- [TheMealDB](https://www.themealdb.com/api.php)

---

## Auteur :
Projet réalisé par Romain Dugeay pour KekebonKekepabon – 2025

