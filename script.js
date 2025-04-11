// script.js - Interaction avec l'API TheMealDB

document.addEventListener("DOMContentLoaded", () => { 
    const categorySelect = document.getElementById("category-select");
    const areaSelect = document.getElementById("area-select");
    const ingredientInput = document.getElementById("ingredient-input");
    const resultsContainer = document.getElementById("results");
    const recipeDetails = document.getElementById("recipe-details");
    const recipeContent = document.getElementById("recipe-content");

    let ingredientTimeout;

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

    async function loadCategories() {
      const data = await fetchData("https://www.themealdb.com/api/json/v1/1/list.php?c=list");
      if (!data) return;
      data.meals.forEach(c => {
        categorySelect.innerHTML += `<option value="${c.strCategory}">${c.strCategory}</option>`;
      });
    }

    async function loadAreas() {
      const data = await fetchData("https://www.themealdb.com/api/json/v1/1/list.php?a=list");
      if (!data) return;
      data.meals.forEach(a => {
        areaSelect.innerHTML += `<option value="${a.strArea}">${a.strArea}</option>`;
      });
    }

    function renderMeals(meals) {
      resultsContainer.innerHTML = "";
      meals.forEach(meal => {
        const col = document.createElement("div");
        col.className = "col-md-3";
        col.innerHTML = `
          <div class="card h-100" data-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="card-body">
              <h5 class="card-title">${meal.strMeal}</h5>
            </div>
          </div>`;
        col.querySelector(".card").addEventListener("click", () => loadMealDetail(meal.idMeal));
        resultsContainer.appendChild(col);
      });
    }

    async function searchMeals() {
      const category = categorySelect.value;
      const area = areaSelect.value;
      const ingredient = ingredientInput.value.trim();

      const urls = [];
      if (category && category !== "Catégorie") urls.push(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      if (area && area !== "Pays") urls.push(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
      if (ingredient) urls.push(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);

      if (urls.length === 0) return;

      const results = await Promise.all(urls.map(url => fetchData(url)));
      const mealsArrays = results.filter(r => r && r.meals).map(r => r.meals);

      if (mealsArrays.length === 0) {
        resultsContainer.innerHTML = "<p>Aucune recette trouvée.</p>";
        return;
      }

      const intersectedMeals = mealsArrays.reduce((acc, curr) => {
        return acc.filter(meal => curr.find(m => m.idMeal === meal.idMeal));
      });

      if (intersectedMeals.length > 0) renderMeals(intersectedMeals);
      else resultsContainer.innerHTML = "<p>Aucune recette trouvée pour ces critères combinés.</p>";
    }

    async function loadMealDetail(id) {
      const data = await fetchData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (!data) return;
      const meal = data.meals[0];
    
      const ingredientsList = Array.from({ length: 20 }, (_, i) => {
        const ing = meal[`strIngredient${i + 1}`];
        const qty = meal[`strMeasure${i + 1}`];
        return ing && ing.trim() ? `<li class="ingredient" data-ingredient="${ing}">${qty} ${ing}</li>` : "";
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
    
      document.getElementById("search-form").closest("section").classList.add("d-none");
      resultsContainer.classList.add("d-none");
      recipeDetails.classList.remove("d-none");
    
      addHoverTooltips();
    
      document.getElementById("btn-back").addEventListener("click", () => {
        recipeDetails.classList.add("d-none");
        document.getElementById("search-form").closest("section").classList.remove("d-none");
        resultsContainer.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    

    function addHoverTooltips() {
      document.querySelectorAll(".ingredient").forEach(el => {
        el.addEventListener("mouseenter", async () => {
          const ing = el.dataset.ingredient;
          const data = await fetchData(`https://www.themealdb.com/api/json/v1/1/search.php?i=${ing}`);
          if (data && data.ingredients && data.ingredients[0]) {
            const info = data.ingredients[0];
            const tooltip = document.createElement("div");
            tooltip.className = "tooltip position-absolute";
            tooltip.innerText = info.strDescription?.slice(0, 200) || "Pas d'information.";
            el.appendChild(tooltip);
          }
        });
        el.addEventListener("mouseleave", () => {
          const tooltip = el.querySelector(".tooltip");
          if (tooltip) tooltip.remove();
        });
      });
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
