document.addEventListener("DOMContentLoaded", () => {
  
  // définition des éléments du DOM
  const categorySelect = document.getElementById("category-select");
  categorySelect.addEventListener("change", searchMeals);
  const areaSelect = document.getElementById("area-select");
  areaSelect.addEventListener("change", searchMeals);

  const ingredientInput = document.getElementById("ingredient-input");
  let ingredientTimeout; 

  ingredientInput.addEventListener("input", () => {
    clearTimeout(ingredientTimeout); 
    ingredientTimeout = setTimeout(searchMeals, 500); 
  });

  const resultsContainer = document.getElementById("results");
  const recipeDetails = document.getElementById("recipe-details");
  const recipeContent = document.getElementById("recipe-content");

  const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

  // chargement des données des sélecteurs
  loadCategories();
  loadAreas();

  // fonction d’appel API générique

  async function fetchData(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur de chargement API");
      return await res.json();
    } catch (err) {
      alert(err.message);
      return null;
    }
  }

  // Fonctions qui appellent l’API pour remplir les <select>  (catégories et zones/pays)

  async function loadCategories() {
    const data = await fetchData(`${BASE_URL}/list.php?c=list`);
    if (!data) return;
    data.meals.forEach((c) => {
      categorySelect.innerHTML += `<option value="${c.strCategory}">${c.strCategory}</option>`;
    });
  }

  async function loadAreas() {
    const data = await fetchData(`${BASE_URL}/list.php?a=list`);
    if (!data) return;
    data.meals.forEach((a) => {
      areaSelect.innerHTML += `<option value="${a.strArea}">${a.strArea}</option>`;
    });
  }

  async function searchMeals() {
    // Fonction déclenchée automatiquement à chaque modification d’un filtre
    // On récupère la valeur des trois champs de filtre (catégorie, zone/pays, ingrédient)
    const category = categorySelect.value;
    const area = areaSelect.value;
    const ingredient = ingredientInput.value.trim();

    // On initialise un tableau vide qui contiendra les URLs d’appel à l’API en fonction des filtres actifs
    const urls = [];

    // Si l'utilisateur a sélectionné une catégorie valide, on ajoute l’URL correspondante
    if (category && category !== "Catégorie") {
      urls.push(
        `${BASE_URL}/filter.php?c=${category}`
      );
    }

    // Idem pour la zone/pays
    if (area && area !== "Pays") {
      urls.push(`${BASE_URL}/filter.php?a=${area}`);
    }

    // Et pour l’ingrédient (si l’input n’est pas vide)
    if (ingredient) {
      urls.push(
        `${BASE_URL}/filter.php?i=${ingredient}`
      );
    }

    // Si aucun filtre n’est actif, on sort de la fonction (rien à faire)
    if (urls.length === 0) return;

    // On envoie toutes les requêtes en parallèle avec Promise.all
    const results = await Promise.all(urls.map((url) => fetchData(url)));

    // On filtre les résultats valides et on ne garde que les tableaux `meals`
    const mealsArrays = results.map((r) => r.meals);
    console.log(mealsArrays);

    // Si aucun résultat valide, on affiche un message d’erreur à l’utilisateur
    if (mealsArrays.length === 0) {
      resultsContainer.innerHTML = "<p>Aucune recette trouvée.</p>";
      return;
    }

    // On fusionne les tableaux de résultats issus de chaque filtre (catégorie, pays, ingrédient)
    // On veut conserver  les recettes communes à TOUS les tableaux uniquement
    const intersectedMeals = mealsArrays.reduce((acc, curr) => {
      // Pour chaque élément de acc (tableau de résultat précédent), on veut vérifier s’il est aussi présent dans curr (tableau courant)
      // Donc on utilise filter pour garder uniquement les recettes qui existent aussi dans curr
      return acc.filter(
        (meal) => curr.find((m) => m.idMeal === meal.idMeal) // find vérifie si la recette (même idMeal) existe dans le tableau courant
      );
    });

    // À la fin du reduce, on obtient un tableau contenant uniquement les recettes communes à tous les filtres actifs

    // Si on a des résultats après intersection, on les affiche avec renderMeals
    if (intersectedMeals.length > 0) {
      renderMeals(intersectedMeals);
    } else {
      // Sinon, on affiche un message spécifique
      resultsContainer.innerHTML =
        "<p>Aucune recette trouvée pour ces critères combinés.</p>";
    }
  }

  async function loadMealDetail(id) {
    const data = await fetchData(`${BASE_URL}/lookup.php?i=${id}`);
    if (!data) return;
    const meal = data.meals[0]; // On prend la première (et unique) recette retournée

    renderMealDetail(meal); // On délègue l'affichage
  }

  function renderMeals(meals) {
    resultsContainer.innerHTML = "";
    meals.forEach((meal) => {
      const col = document.createElement("div");
      col.className = "col-6 col-md-3"; // 2 colonnes en mobile, 4 colonnes par ligne en desktop
      col.innerHTML = `
      <div class="card h-100" data-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
        <div class="card-body">
          <h5 class="card-title">${meal.strMeal}</h5>
        </div>
      </div>`;
      col
        .querySelector(".card")
        .addEventListener("click", () => loadMealDetail(meal.idMeal));
      resultsContainer.appendChild(col);
    });
  }

  function renderMealDetail(meal) {
    const ingredientsList = generateIngredientsList(meal);
    recipeContent.innerHTML = `
    <div class="text-end mb-3">
      <button class="btn btn-sm bg-gris text-white rounded-btn" id="btn-back">← Retour</button>
    </div>
    <div class="row">
      <div class="col-md-6">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid rounded" />
      </div>
      <div class="col-md-6">
        <h3>${meal.strMeal}</h3>
        <p><strong>Origine :</strong> ${meal.strArea} | <strong>Catégorie :</strong> ${meal.strCategory}</p>
        <h5>Instructions</h5>
        <p>${meal.strInstructions}</p>
        <h5>Ingrédients</h5>
        <ul>${ingredientsList}</ul>
      </div>
    </div>`;

    // Gestion d'affichage SPA : masquer recherche et résultats, afficher détails
    document
      .getElementById("search-form")
      .closest("section")
      .classList.add("d-none");
    resultsContainer.classList.add("d-none");
    recipeDetails.classList.remove("d-none");

    // Bouton retour
    document.getElementById("btn-back").addEventListener("click", () => {
      recipeDetails.classList.add("d-none");
      document
        .getElementById("search-form")
        .closest("section")
        .classList.remove("d-none");
      resultsContainer.classList.remove("d-none");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Tooltips Bootstrap
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }

  function generateIngredientsList(meal) {
    // Fonction qui génère une liste HTML <li> d'ingrédients avec tooltip image pour une recette donnée
    return Array.from({ length: 20 }, (_, i) => {
      // L'API fournit jusqu'à 20 paires ingrédient/quantité via des propriétés séparées
      const ing = meal[`strIngredient${i + 1}`]; // Exemple : strIngredient1, strIngredient2...
      const qty = meal[`strMeasure${i + 1}`]; // Exemple : strMeasure1, strMeasure2...
      console.log(ing, qty);

      // si un ingrédient est défini et non vide, on construit un <li> avec tooltip image + nom
      if (ing && ing.trim()) {
        // on formate le nom de l’ingrédient pour l’URL de l’image (underscore à la place des espaces)
        const imageUrl = `https://www.themealdb.com/images/ingredients/${ing
          .toLowerCase()
          .replace(/\s+/g, "_")}-small.png`;

        return `
        <li class="ingredient"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-html="true"
            title='<img src="${imageUrl}" style="max-width:60px; display:block; margin:auto;" />
                   <div style="text-align:center; margin-top:4px;">${ing}</div>'>
          ${qty} ${ing}
        </li>`;
      }

      // Si aucun ingrédient est défini à cette position, on retourne une chaîne vide
      return "";
    }); // On convertit le tableau de <li> en une seule chaîne HTML
  }
});
