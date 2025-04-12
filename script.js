// script.js - Interaction avec l'API TheMealDB

document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category-select");
  const areaSelect = document.getElementById("area-select");
  const ingredientInput = document.getElementById("ingredient-input");
  const resultsContainer = document.getElementById("results");
  const recipeDetails = document.getElementById("recipe-details");
  const recipeContent = document.getElementById("recipe-content");
  const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

  let ingredientTimeout;

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

  // Fonctions qui appellent l’API pour remplir les <select>
  //  Chargement des filtres (catégories et zones/pays)

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

  function renderMeals(meals) {
    resultsContainer.innerHTML = "";
    meals.forEach((meal) => {
      const col = document.createElement("div");
      col.className = "col-md-3";
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

  // Fonction déclenchée automatiquement à chaque modification d’un filtre
  async function searchMeals() {
    // On récupère la valeur des trois champs de filtre (catégorie, zone/pays, ingrédient)
    const category = categorySelect.value;
    const area = areaSelect.value;
    const ingredient = ingredientInput.value.trim();

    // On initialise un tableau vide qui contiendra les URLs d’appel à l’API en fonction des filtres actifs
    const urls = [];

    // Si l'utilisateur a sélectionné une catégorie valide, on ajoute l’URL correspondante
    if (category && category !== "Catégorie") {
      urls.push(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
      );
    }

    // Idem pour la zone/pays
    if (area && area !== "Pays") {
      urls.push(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
    }

    // Et pour l’ingrédient (si l’input n’est pas vide)
    if (ingredient) {
      urls.push(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
      );
    }

    // Si aucun filtre n’est actif, on sort de la fonction (rien à faire)
    if (urls.length === 0) return;

    // On envoie toutes les requêtes en parallèle avec Promise.all
    const results = await Promise.all(urls.map((url) => fetchData(url)));

    // On filtre les résultats valides et on ne garde que les tableaux `meals`
    const mealsArrays = results.filter((r) => r && r.meals).map((r) => r.meals);
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
    const meal = data.meals[0];

    const ingredientsList = Array.from({ length: 20 }, (_, i) => {
      const ing = meal[`strIngredient${i + 1}`];
      const qty = meal[`strMeasure${i + 1}`];
      return ing && ing.trim()
        ? `<li class="ingredient" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" title='<img src="https://www.themealdb.com/images/ingredients/${ing
            .toLowerCase()
            .replace(
              /\s+/g,
              "_"
            )}-small.png" style="max-width:60px; display:block; margin:auto;" /><div style="text-align:center; margin-top:4px;">${ing}</div>'>${qty} ${ing}</li>`
        : "";
    }).join("");

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

    document
      .getElementById("search-form")
      .closest("section")
      .classList.add("d-none");
    resultsContainer.classList.add("d-none");
    recipeDetails.classList.remove("d-none");

    document.getElementById("btn-back").addEventListener("click", () => {
      recipeDetails.classList.add("d-none");
      document
        .getElementById("search-form")
        .closest("section")
        .classList.remove("d-none");
      resultsContainer.classList.remove("d-none");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }

  categorySelect.addEventListener("change", searchMeals);
  areaSelect.addEventListener("change", searchMeals);
  ingredientInput.addEventListener("input", () => {
    clearTimeout(ingredientTimeout);
    ingredientTimeout = setTimeout(searchMeals, 500);
  });

  loadCategories();
  loadAreas();
});
