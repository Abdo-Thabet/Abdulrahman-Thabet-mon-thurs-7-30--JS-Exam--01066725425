
// 1. Setup and Variables

import * as api from "./api/mealdb.js";
import * as state from "./state/appState.js";
import {
  spinner,
  emptyState,
  categoryCard,
  recipeCard,
  productCard,
  loggedItemRow,
} from "./ui/components.js";

import { clearTodayFoodLog, setState } from "./state/appState.js";


const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const loadingOverlay = $("#app-loading-overlay");

const sidebar = $("#sidebar");
const sidebarOverlay = $("#sidebar-overlay");
const navLinks = $$(".nav-link");
const headerMenuBtn = $("#header-menu-btn");
const sidebarCloseBtn = $("#sidebar-close-btn");

const headerTitle = $("#header h1");
const headerSubtitle = $("#header p");

const searchInput = $("#search-input");
const cuisineFilters = $("#cuisine-filters");
const categoriesGrid = $("#categories-grid");
const recipesGrid = $("#recipes-grid");
const recipesCount = $("#recipes-count");
const gridViewBtn = $("#grid-view-btn");
const listViewBtn = $("#list-view-btn");

const mealDetailsSection = $("#meal-details");
const backToMealsBtn = $("#back-to-meals-btn");
const logMealBtn = $("#log-meal-btn");

const productSearchInput = $("#product-search-input");
const searchProductBtn = $("#search-product-btn");
const barcodeInput = $("#barcode-input");
const lookupBarcodeBtn = $("#lookup-barcode-btn");
const productsGrid = $("#products-grid");
const productsCount = $("#products-count");
const nutriScoreFilters = $$(".nutri-score-filter");
const productCategoryBtns = $$(".product-category-btn");

const foodlogDate = $("#foodlog-date");
const loggedItemsList = $("#logged-items-list");
const clearFoodlogBtn = $("#clear-foodlog");

const mealsPageSections = [
  "#search-filters-section",
  "#meal-categories-section",
  "#all-recipes-section",
];
const allSections = [
  ...mealsPageSections,
  "#meal-details",
  "#products-section",
  "#foodlog-section",
];

let products = [];
let currentMeal = null;


// 2. Navigation

function showSections(sectionsToShow) {
  allSections.forEach((selector) => {
    const section = $(selector);
    if (section) section.style.display = "none";
  });
  sectionsToShow.forEach((selector) => {
    const section = $(selector);
    if (section) section.style.display = "";
  });
}

function setActiveNav(index) {
  navLinks.forEach((link, i) => {
    if (i === index) {
      link.classList.add("bg-emerald-50", "text-emerald-700");
      link.classList.remove("text-gray-600", "hover:bg-gray-50");
      const span = link.querySelector("span");
      if (span) { span.classList.add("font-semibold"); span.classList.remove("font-medium"); }
    } else {
      link.classList.remove("bg-emerald-50", "text-emerald-700");
      link.classList.add("text-gray-600", "hover:bg-gray-50");
      const span = link.querySelector("span");
      if (span) { span.classList.remove("font-semibold"); span.classList.add("font-medium"); }
    }
  });
}


const pages = {
  meals: {
    sections: mealsPageSections,
    title: "Meals & Recipes",
    subtitle: "Discover delicious and nutritious recipes tailored for you",
    navIndex: 0,
  },
  products: {
    sections: ["#products-section"],
    title: "Product Scanner",
    subtitle: "Search and scan packaged food products",
    navIndex: 1,
  },
  foodlog: {
    sections: ["#foodlog-section"],
    title: "Food Log",
    subtitle: "Track and monitor your daily nutrition intake",
    navIndex: 2,
  },
};

function navigateTo(page) {
  const pageInfo = pages[page];
  if (!pageInfo) return;

  showSections(pageInfo.sections);
  setActiveNav(pageInfo.navIndex);
  if (headerTitle) headerTitle.textContent = pageInfo.title;
  if (headerSubtitle) headerSubtitle.textContent = pageInfo.subtitle;
  setState({ currentPage: page });

  window.location.hash = page;

  if (page === "foodlog") showFoodLog();
}

function getPageFromHash() {
  const h = window.location.hash.replace("#", "");
  return pages[h] ? h : "meals";
}

// 3. Meal, Category, and Search Functions

let currentViewMode = "grid";
let meals = [];

async function loadMealsPage() {
  categoriesGrid.innerHTML = spinner();
  recipesGrid.innerHTML = spinner();

  try {
    const [categoriesData, mealsData, areasData] = await Promise.all([
      api.getMealCategories(),
      api.getRandomMeals(20),
      api.getMealAreas(),
    ]);

    const excludedCategories = ["Breakfast", "Goat"];
    const filteredCategories = (categoriesData.results || []).filter(
      (category) => !excludedCategories.includes(category.name),
    );
    showCategories(filteredCategories);
    showMeals(mealsData.results || []);

    const requestedCuisines = [
      "Afghan", "Albanian", "Algerian", "Andorran", "Angolan",
      "Antiguan, Barbudan", "Argentine", "Armenian", "Aruban", "Australian",
    ];
    const supportedAreas = new Map(
      (areasData.results || []).map((area) => [area.name, area]),
    );
    showCuisines(
      requestedCuisines.map((name) => supportedAreas.get(name) || { name, value: name }),
    );

  } catch (error) {
    console.error("Error loading meals page:", error);
    categoriesGrid.innerHTML = emptyState("Unable to load meal categories", "Check your connection and try again.");
    recipesGrid.innerHTML = emptyState("Unable to load recipes", "Check your connection and try again.");
    recipesCount.textContent = "Recipes unavailable";
  }
}

function showCuisines(cuisines) {
  if (!cuisineFilters) return;
  cuisineFilters.innerHTML = `
    <button
      class="cuisine-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
      data-area="All"
    >
      All Cuisines
    </button>
  `;
  cuisines.forEach((cuisine) => {
    const name = typeof cuisine === "string" ? cuisine : cuisine.name;
    const value = typeof cuisine === "string" ? cuisine : cuisine.value;
    cuisineFilters.insertAdjacentHTML(
      "beforeend",
      `<button
        class="cuisine-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
        data-area="${value}"
      >
        ${name}
      </button>`
    );
  });

  cuisineFilters.querySelectorAll(".cuisine-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      cuisineFilters.querySelectorAll(".cuisine-btn").forEach((b) => {
        b.className = "cuisine-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
      });
      btn.className = "cuisine-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all";

      const area = btn.dataset.area;
      setState({ area: area === "All" ? "" : area });
      if (area === "All") {
        loadMealsPage();
      } else {
        filterByArea(area);
      }
    });
  });
}

function showCategories(categories) {
  categoriesGrid.innerHTML = "";
  categories.forEach((category) => {
    categoriesGrid.insertAdjacentHTML("beforeend", categoryCard(category));
  });
  categoriesGrid.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const name = card.dataset.category;
      filterByCategory(name);
    });
  });
}

function showMeals(results) {
  meals = results || [];
  setState({ meals });
  recipesGrid.innerHTML = "";
  if (!meals || meals.length === 0) {
    recipesGrid.innerHTML = emptyState("No recipes found");
    recipesCount.textContent = "Showing 0 recipes";
    return;
  }
  recipesCount.textContent = `Showing ${meals.length} recipes`;

  if (currentViewMode === "list") {
    recipesGrid.className = "grid grid-cols-2 gap-5";
  } else {
    recipesGrid.className = "grid grid-cols-4 gap-5";
  }

  meals.forEach((meal) => {
    recipesGrid.insertAdjacentHTML("beforeend", recipeCard(meal, currentViewMode));
  });
  recipesGrid.querySelectorAll(".recipe-card").forEach((card) => {
    card.addEventListener("click", () => {
      showMealDetails(card.dataset.mealId);
    });
  });
}

async function searchMeals(query) {
  setState({ search: query, category: "", area: "" });
  if (!query.trim()) {
    loadMealsPage();
    return;
  }
  recipesGrid.innerHTML = spinner();
  try {
    const data = await api.searchMeals(query);
    showMeals(data.results || []);
  } catch (error) {
    console.error("Meal search failed:", error);
    recipesGrid.innerHTML = emptyState("Search failed", "Check your connection and try again.");
  }
}

async function filterByCategory(name) {
  setState({ category: name, search: "", area: "" });
  recipesGrid.innerHTML = spinner();
  try {
    const data = await api.filterMeals({ category: name });
    showMeals(data.results || []);
  } catch (error) {
    console.error("Category filter failed:", error);
    recipesGrid.innerHTML = emptyState("Filter failed", "Check your connection and try again.");
  }
}

async function filterByArea(name) {
  setState({ area: name, search: "", category: "" });
  recipesGrid.innerHTML = spinner();
  try {
    const data = await api.filterMeals({ area: name });
    showMeals(data.results || []);
  } catch (error) {
    console.error("Cuisine filter failed:", error);
    recipesGrid.innerHTML = emptyState("Filter failed", "Check your connection and try again.");
  }
}


// 4. Meal Details Functions

async function showMealDetails(id) {
  showSections(["#meal-details"]);
  mealDetailsSection.scrollIntoView({ behavior: "smooth" });

  try {
    const data = await api.getMealById(id);
    const meal = data.result;
    currentMeal = meal;

    const heroImg = mealDetailsSection.querySelector(".relative img");
    if (heroImg) { heroImg.src = meal.thumbnail; heroImg.alt = meal.name; }

    const heroTitle = mealDetailsSection.querySelector("h1");
    if (heroTitle) heroTitle.textContent = meal.name;

    const tagsContainer = mealDetailsSection.querySelector(".flex.items-center.gap-3.mb-3");
    if (tagsContainer) {
      tagsContainer.innerHTML = `
        ${meal.category ? `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category}</span>` : ""}
        ${meal.area ? `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area}</span>` : ""}
      `;
    }

    const ingredientsGrid = mealDetailsSection.querySelector(
      ".grid.grid-cols-1.md\\:grid-cols-2"
    );
    if (ingredientsGrid && meal.ingredients) {
      const itemsCountSpan = ingredientsGrid.closest(".bg-white")?.querySelector("span.text-sm");
      if (itemsCountSpan) itemsCountSpan.textContent = `${meal.ingredients.length} items`;

      ingredientsGrid.innerHTML = meal.ingredients
        .map(
          (ing) => `<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"/>
          <span class="text-gray-700"><span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}</span>
        </div>`
        )
        .join("");
    }

    const instructionsContainer = mealDetailsSection.querySelectorAll(
      ".bg-white.rounded-2xl.shadow-lg.p-6"
    )[1];
    if (instructionsContainer && meal.instructions) {
      const stepsDiv = instructionsContainer.querySelector(".space-y-4");
      if (stepsDiv) {
        stepsDiv.innerHTML = meal.instructions
          .filter((s) => s.trim())
          .map(
            (step, i) => `<div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${i + 1}</div>
            <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
          </div>`
          )
          .join("");
      }
    }

    const videoIframe = mealDetailsSection.querySelector("iframe");
    if (videoIframe) {
      const videoContainer = videoIframe.closest(".aspect-video");
      let videoId = "";
      
      if (meal.youtube) {
        if (meal.youtube.includes("v=")) {
          videoId = meal.youtube.split("v=")[1].split("&")[0];
        } else if (meal.youtube.includes("youtu.be/")) {
          videoId = meal.youtube.split("youtu.be/")[1].split("?")[0];
        }
      }
      
      if (videoId) {
        videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
        if (videoContainer) videoContainer.style.display = "block";
      } else {
        videoIframe.src = "";
        if (videoContainer) videoContainer.style.display = "none";
      }
    }

    try {
      const ingStrings = meal.ingredients.map((i) => `${i.measure} ${i.ingredient}`);
      const nutRes = await api.analyzeNutrition(meal.name, ingStrings);
      if (nutRes.success) {
        updateNutritionPanel(nutRes.data);
      }
    } catch (e) {
      console.warn("Nutrition analysis not available:", e.message);
    }
  } catch (error) {
    console.error("Failed to load meal details:", error);
    mealDetailsSection.innerHTML = `<div class="text-center py-12"><p class="text-red-500 font-semibold">Unable to load this meal.</p><button id="back-to-meals-btn" class="mt-4 text-emerald-600 font-medium">Back to Recipes</button></div>`;
    $("#back-to-meals-btn")?.addEventListener("click", () => navigateTo("meals"));
  }
}

function updateNutritionPanel(data) {
  const container = $("#nutrition-facts-container");
  if (!container) return;
  const ps = data.perServing;
  const totals = data.totals;

  container.innerHTML = `
    <p class="text-sm text-gray-500 mb-4">Per serving</p>
    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${Math.round(ps.calories)}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(totals.calories)} cal</p>
    </div>
    <div class="space-y-4 mb-6">
      ${nutriBar("Protein", ps.protein, "emerald", 50)}
      ${nutriBar("Carbs", ps.carbs, "blue", 300)}
      ${nutriBar("Fat", ps.fat, "purple", 65)}
      ${nutriBar("Fiber", ps.fiber, "orange", 25)}
      ${nutriBar("Sugar", ps.sugar, "pink", 50)}
      ${nutriBar("Saturated Fat", ps.saturatedFat, "red", 20)}
    </div>
    <div class="border-t border-gray-100 pt-4">
      <h4 class="text-sm font-bold text-gray-900 mb-3">Other</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="flex items-center justify-between"><span class="text-gray-500">Cholesterol</span><span class="font-bold text-gray-900">${Math.round(ps.cholesterol)}mg</span></div>
        <div class="flex items-center justify-between"><span class="text-gray-500">Sodium</span><span class="font-bold text-gray-900">${Math.round(ps.sodium)}mg</span></div>
      </div>
    </div>
  `;

  container.querySelectorAll(".nutrition-panel-bar").forEach((bar) => {
    bar.style.width = `${bar.dataset.progress}%`;
  });

  const heroServings = $("#hero-servings");
  const heroCals = $("#hero-calories");
  if (heroServings) heroServings.textContent = `${data.servings} servings`;
  if (heroCals) heroCals.textContent = `${Math.round(ps.calories)} cal/serving`;
}

function nutriBar(label, value, color, max) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return `
    <div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-${color}-500"></div><span class="text-gray-700">${label}</span></div>
        <span class="font-bold text-gray-900">${Math.round(value)}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2"><div class="nutrition-panel-bar bg-${color}-500 h-2 rounded-full" data-progress="${pct}"></div></div>
    </div>`;
}


// 5. Product Functions

async function searchProducts(query) {
  productsGrid.innerHTML = spinner();
  try {
    const data = await api.searchProducts(query);
    products = data.results || [];
    setState({ products });
    showProducts(products);
  } catch (error) {
    console.error("Product search failed:", error);
    productsGrid.innerHTML = emptyState("Product search failed", "Check your connection and try again.");
  }
}

async function lookupBarcode(code) {
  productsGrid.innerHTML = spinner();
  try {
    const data = await api.getProductByBarcode(code);
    if (data.result) {
      products = [data.result];
      showProducts(products);
    } else {
      productsGrid.innerHTML = emptyState("Product not found");
    }
  } catch (error) {
    console.error("Barcode lookup failed:", error);
    productsGrid.innerHTML = emptyState("Barcode lookup failed", "Check the barcode or your connection and try again.");
  }
}

async function loadProductsByCategory(category) {
  productsGrid.innerHTML = spinner();
  try {
    const data = await api.getProductsByCategory(category);
    products = data.results || [];
    setState({ products });
    showProducts(products);
  } catch (error) {
    console.error("Product category failed:", error);
    productsGrid.innerHTML = emptyState("Failed to load category", "Check your connection and try again.");
  }
}

function showProducts(results) {
  productsGrid.innerHTML = "";
  if (!results || results.length === 0) {
    productsGrid.innerHTML = emptyState("No products found");
    productsCount.textContent = "0 products found";
    return;
  }
  productsCount.textContent = `Showing ${results.length} products`;
  results.forEach((product) => {
    productsGrid.insertAdjacentHTML("beforeend", productCard(product));
  });

  productsGrid.querySelectorAll(".product-card").forEach((card, index) => {
    card.addEventListener("click", () => {
      showProductDetails(results[index]);
    });
  });
}

function filterByNutriScore(grade) {
  if (!grade) {
    showProducts(products);
    return;
  }
  const filteredProducts = products.filter(
    (product) => (product.nutritionGrade || "").toLowerCase() === grade.toLowerCase()
  );
  showProducts(filteredProducts);
}


// 6. Overlays and Messages

function closeOverlay(overlay) {
  overlay.classList.add("closing");
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.remove("closing");
  }, 220);
}

function openLogMealOverlay(meal, perServing, defaultServings) {
  const overlay = document.getElementById("log-meal-overlay");
  const imgEl = document.getElementById("log-modal-img");
  const nameEl = document.getElementById("log-modal-name");
  const servingsInput = document.getElementById("log-modal-servings");
  const calEl = document.getElementById("log-modal-cal");
  const proteinEl = document.getElementById("log-modal-protein");
  const carbsEl = document.getElementById("log-modal-carbs");
  const fatEl = document.getElementById("log-modal-fat");
  const minusBtn = document.getElementById("log-modal-minus");
  const plusBtn = document.getElementById("log-modal-plus");
  const cancelBtn = document.getElementById("log-modal-cancel");
  const confirmBtn = document.getElementById("log-modal-confirm");
  const backdrop = document.getElementById("log-meal-backdrop");

  imgEl.src = meal.thumbnail;
  imgEl.alt = meal.name;
  nameEl.textContent = meal.name;
  servingsInput.value = defaultServings;
  calEl.textContent = Math.round(perServing.calories);
  proteinEl.textContent = Math.round(perServing.protein) + "g";
  carbsEl.textContent = Math.round(perServing.carbs) + "g";
  fatEl.textContent = Math.round(perServing.fat) + "g";

  overlay.style.display = "flex";

  const modal = document.getElementById("log-meal-modal");
  modal.style.animation = "none";
  modal.offsetHeight;
  modal.style.animation = "overlaySlideIn .35s ease-out";

  const newMinus = minusBtn.cloneNode(true);
  const newPlus = plusBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  const newConfirm = confirmBtn.cloneNode(true);
  minusBtn.replaceWith(newMinus);
  plusBtn.replaceWith(newPlus);
  cancelBtn.replaceWith(newCancel);
  confirmBtn.replaceWith(newConfirm);

  newMinus.addEventListener("click", () => {
    let val = parseFloat(servingsInput.value) || 1;
    if (val > 0.5) servingsInput.value = (val - 0.5).toFixed(1);
  });
  newPlus.addEventListener("click", () => {
    let val = parseFloat(servingsInput.value) || 1;
    servingsInput.value = (val + 0.5).toFixed(1);
  });

  newCancel.addEventListener("click", () => closeOverlay(overlay));
  backdrop.onclick = () => closeOverlay(overlay);

  newConfirm.addEventListener("click", () => {
    const servings = parseFloat(servingsInput.value);
    if (!servings || servings <= 0) {
      servingsInput.style.borderColor = "#ef4444";
      setTimeout(() => { servingsInput.style.borderColor = ""; }, 1500);
      return;
    }

    const totalCals = Math.round(perServing.calories * servings);
    state.addFoodItem({
      type: "meal",
      name: meal.name,
      thumbnail: meal.thumbnail,
      servings,
      calories: totalCals,
      protein: Math.round(perServing.protein * servings),
      carbs: Math.round(perServing.carbs * servings),
      fat: Math.round(perServing.fat * servings),
    });

    closeOverlay(overlay);
    setTimeout(() => {
      showLogSuccessOverlay(meal.name, servings, totalCals);
    }, 250);
  });
}

function showLogSuccessOverlay(mealName, servings, totalCals) {
  const overlay = document.getElementById("log-success-overlay");
  const textEl = document.getElementById("log-success-text");
  const calsEl = document.getElementById("log-success-cals");
  const backdrop = document.getElementById("log-success-backdrop");

  textEl.textContent = `${mealName} (${servings} servings) has been added to your daily log.`;
  calsEl.textContent = `+${totalCals} calories`;

  overlay.style.display = "flex";

  const svg = document.getElementById("log-success-check");
  const circle = svg.querySelector("circle");
  const path = svg.querySelector("path");
  
  circle.style.animation = "none";
  path.style.animation = "none";
  svg.offsetHeight;
  circle.style.animation = "checkCircle .5s ease-out .15s forwards";
  path.style.animation = "checkMark .35s ease-out .55s forwards";

  const modal = document.getElementById("log-success-modal");
  modal.style.animation = "none";
  modal.offsetHeight;
  modal.style.animation = "overlaySlideIn .35s ease-out";

  backdrop.onclick = () => closeOverlay(overlay);

  setTimeout(() => {
    if (overlay.style.display !== "none") {
      closeOverlay(overlay);
    }
  }, 3000);
}

function showToast(message) {
  createToast(message, {
    className: "toast-success",
    duration: 3500,
    removeDelay: 400,
    iconClass: "fa-solid fa-circle-check",
  });
}

function showDeleteToast() {
  createToast("Item removed from log", { className: "toast-info" });
}

function showClearToast() {
  createToast("Today's log cleared", { className: "toast-info" });
}

function createToast(message, options = {}) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const {
    className = "toast-info",
    duration = 3500,
    removeDelay = 300,
    iconClass = "",
  } = options;

  const toast = document.createElement("div");
  toast.className = `app-toast ${className}`;

  if (iconClass) {
    const icon = document.createElement("i");
    icon.className = `toast-icon ${iconClass}`;
    toast.appendChild(icon);
  }

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });
  });

  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), removeDelay);
  }, duration);
}

function highlightIngredients(text) {
  if (!text) return "";

  const parts = text.split(",");
  const termsToHighlight = [
    "fructose - glucose syrup",
    "glucose-fructose syrup",
    "fructose-glucose syrup",
    "carbon dioxide",
    "natural flavorings",
    "natural flavoring",
    "artificial flavorings",
    "artificial flavoring",
    "natural flavor",
    "artificial flavor",
    "caffeine",
    "phosphoric acid",
    "citric acid",
    "sodium benzoate",
    "potassium sorbate",
    "aspartame",
    "acesulfame K",
    "sucralose",
  ];

  const highlightedParts = parts.map((part) => {
    const trimmed = part.trim();
    const lower = trimmed.toLowerCase();

    const hasCategory =
      /\b(colorant|acid|preservative|emulsifier|stabilizer|sweetener|thickener|colour|colouring):\s*/i.test(
        trimmed,
      );

    const hasTargetTerm = termsToHighlight.some((term) => lower.includes(term));

    if (hasCategory || hasTargetTerm) {
      const parenIndex = trimmed.indexOf("(");
      if (parenIndex !== -1) {
        const beforeParen = trimmed.substring(0, parenIndex).trim();
        const parenContent = trimmed.substring(parenIndex);
        return `<span class="ingredient-highlight">${beforeParen}</span> ${parenContent}`;
      }
      return `<span class="ingredient-highlight">${trimmed}</span>`;
    }

    return trimmed;
  });

  return highlightedParts.join(", ");
}

function showProductDetails(p) {
  const overlay = document.getElementById("product-details-overlay");
  const imgEl = document.getElementById("pd-modal-img");
  const brandEl = document.getElementById("pd-modal-brand");
  const nameEl = document.getElementById("pd-modal-name");
  const qtyEl = document.getElementById("pd-modal-quantity");
  
  const nutriBadge = document.getElementById("pd-badge-nutri");
  const gradeChar = document.getElementById("pd-grade-char");
  const gradeDesc = document.getElementById("pd-grade-desc");
  
  const novaBadge = document.getElementById("pd-badge-nova");
  const novaNum = document.getElementById("pd-nova-num");
  const novaDesc = document.getElementById("pd-nova-desc");

  const calEl = document.getElementById("pd-nutri-cal");
  const protEl = document.getElementById("pd-nutri-prot");
  const carbsEl = document.getElementById("pd-nutri-carbs");
  const fatEl = document.getElementById("pd-nutri-fat");
  const sugarEl = document.getElementById("pd-nutri-sugar");
  const satfatEl = document.getElementById("pd-nutri-satfat");
  const fiberEl = document.getElementById("pd-nutri-fiber");
  const saltEl = document.getElementById("pd-nutri-salt");

  const ingredientsEl = document.getElementById("pd-modal-ingredients");
  
  const cancelBtn = document.getElementById("pd-modal-cancel");
  const confirmBtn = document.getElementById("pd-modal-confirm");
  const closeBtn = document.getElementById("product-details-close");
  const backdrop = document.getElementById("product-details-backdrop");

  imgEl.src = p.image || "";
  imgEl.style.display = p.image ? "block" : "none";
  brandEl.textContent = p.brand || p.brands || "";
  nameEl.textContent = p.name || "Unknown Product";
  
  const quantity = p.quantity || p.weight || p.size || "330 ml";
  qtyEl.textContent = quantity;

  const grade = (p.nutritionGrade || "?").toUpperCase();
  const scoreInfo = {
    A: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", charBg: "#22c55e", desc: "Very Good" },
    B: { bg: "#f7fee7", border: "#d9f99d", text: "#65a30d", charBg: "#84cc16", desc: "Good" },
    C: { bg: "#fef9c3", border: "#fef08a", text: "#ca8a04", charBg: "#eab308", desc: "Average" },
    D: { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", charBg: "#f97316", desc: "Poor" },
    E: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", charBg: "#ef4444", desc: "Bad" }
  };
  const gInfo = scoreInfo[grade] || { bg: "#f9fafb", border: "#e5e7eb", text: "#4b5563", charBg: "#9ca3af", desc: "Unknown" };
  
  nutriBadge.style.backgroundColor = gInfo.bg;
  nutriBadge.style.border = "1px solid " + gInfo.border;
  nutriBadge.style.color = gInfo.text;
  
  gradeChar.style.backgroundColor = gInfo.charBg;
  gradeChar.textContent = grade;
  gradeDesc.textContent = gInfo.desc;

  const nova = p.novaGroup || p.nova || p.nova_group || p.novaScore || 4;
  const novaInfo = {
    1: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", numBg: "#22c55e", desc: "Unprocessed" },
    2: { bg: "#fef9c3", border: "#fef08a", text: "#ca8a04", numBg: "#eab308", desc: "Processed Ingredients" },
    3: { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", numBg: "#f97316", desc: "Processed" },
    4: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", numBg: "#ef4444", desc: "Ultra-processed" }
  };
  const nInfo = novaInfo[nova] || { bg: "#f9fafb", border: "#e5e7eb", text: "#4b5563", numBg: "#9ca3af", desc: "Unknown" };
  
  novaBadge.style.backgroundColor = nInfo.bg;
  novaBadge.style.border = "1px solid " + nInfo.border;
  novaBadge.style.color = nInfo.text;
  
  novaNum.style.backgroundColor = nInfo.numBg;
  novaNum.textContent = nova;
  novaDesc.textContent = nInfo.desc;

  const cal = Math.round(p.nutrients?.calories || 0);
  const prot = parseFloat(p.nutrients?.protein || 0);
  const carbs = parseFloat(p.nutrients?.carbs || 0);
  const fat = parseFloat(p.nutrients?.fat || 0);
  const sugar = parseFloat(p.nutrients?.sugar || p.nutrients?.sugars || 0);
  const satFat = parseFloat(p.nutrients?.saturatedFat || p.nutrients?.["saturated-fat"] || 0);
  const fiber = parseFloat(p.nutrients?.fiber || 0);
  const salt = parseFloat(p.nutrients?.salt || (p.nutrients?.sodium ? (p.nutrients.sodium * 2.5) : 0));

  calEl.textContent = cal;
  protEl.textContent = prot.toFixed(1) + "g";
  carbsEl.textContent = carbs.toFixed(1) + "g";
  fatEl.textContent = fat.toFixed(1) + "g";
  sugarEl.textContent = sugar.toFixed(1) + "g";
  satfatEl.textContent = satFat.toFixed(1) + "g";
  fiberEl.textContent = fiber.toFixed(1) + "g";
  saltEl.textContent = salt.toFixed(2) + "g";

  const pBar = document.getElementById("pd-bar-prot");
  const cBar = document.getElementById("pd-bar-carbs");
  const fBar = document.getElementById("pd-bar-fat");
  const sBar = document.getElementById("pd-bar-sugar");

  if (pBar) pBar.style.width = (prot > 0 ? Math.min(Math.max(prot * 4, 10), 100) : 0) + "%";
  if (cBar) cBar.style.width = (carbs > 0 ? Math.min(Math.max(carbs * 3.5, 15), 100) : 0) + "%";
  if (fBar) fBar.style.width = (fat > 0 ? Math.min(Math.max(fat * 4, 10), 100) : 0) + "%";
  if (sBar) sBar.style.width = (sugar > 0 ? Math.min(Math.max(sugar * 4, 15), 100) : 0) + "%";

  const rawIngredients = p.ingredients || p.ingredientsText || "Water, carbon dioxide, colorant: e150d, acid: phosphoric acid, natural flavorings (including caffeine).";
  ingredientsEl.innerHTML = highlightIngredients(rawIngredients);

  overlay.style.display = "flex";

  const modal = document.getElementById("product-details-modal");
  if (modal) {
    modal.style.animation = "none";
    modal.offsetHeight;
    modal.style.animation = "overlaySlideIn .35s ease-out";
  }

  const newCancel = cancelBtn.cloneNode(true);
  const newConfirm = confirmBtn.cloneNode(true);
  const newClose = closeBtn.cloneNode(true);

  cancelBtn.replaceWith(newCancel);
  confirmBtn.replaceWith(newConfirm);
  closeBtn.replaceWith(newClose);

  const closePD = () => {
    overlay.classList.add("closing");
    setTimeout(() => {
      overlay.style.display = "none";
      overlay.classList.remove("closing");
    }, 220);
  };

  newCancel.addEventListener("click", closePD);
  newClose.addEventListener("click", closePD);
  backdrop.onclick = closePD;

  newConfirm.addEventListener("click", () => {
    state.addFoodItem({
      type: "product",
      name: p.name || "Unknown Product",
      calories: cal,
      protein: prot,
      carbs: carbs,
      fat: fat,
    });

    closePD();
    
    setTimeout(() => {
      showToast(`${p.name || "Product"} logged to your daily intake! 📝`);
    }, 250);
  });
}


// 7. Food Log Functions

function showFoodLog() {
  const allItems = state.getFoodLog();
  const todayStr = new Date().toDateString();
  
  const todayItems = allItems.filter(item => new Date(item.loggedAt).toDateString() === todayStr);

  if (foodlogDate) {
    foodlogDate.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  if (loggedItemsList) {
    if (todayItems.length === 0) {
      loggedItemsList.innerHTML = `
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-utensils text-gray-300 text-3xl"></i>
          </div>
          <p class="text-gray-500 font-medium mb-2">No food logged today</p>
          <p class="text-gray-400 text-sm mb-4">
            Start tracking your nutrition by logging meals or scanning products
          </p>
          <div class="flex justify-center gap-3">
            <a id="empty-browse-btn" href="#meals" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
              <i class="fa-solid fa-plus"></i>
              <span>Browse Recipes</span>
            </a>
            <a id="empty-scan-btn" href="#products" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
              <i class="fa-solid fa-barcode"></i>
              <span>Scan Product</span>
            </a>
          </div>
        </div>`;
        
      $("#empty-browse-btn")?.addEventListener("click", () => navigateTo("meals"));
      $("#empty-scan-btn")?.addEventListener("click", () => navigateTo("products"));
    } else {
      loggedItemsList.innerHTML = todayItems.map((item) => loggedItemRow(item)).join("");

      loggedItemsList.querySelectorAll(".delete-log-item").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          state.removeFoodItem(btn.dataset.id);
          showFoodLog();
          showDeleteToast();
        });
      });
    }
  }

  const loggedHeader = loggedItemsList?.closest(".border-t")?.querySelector("h4");
  if (loggedHeader) loggedHeader.textContent = `Logged Items (${todayItems.length})`;

  if (clearFoodlogBtn) {
    clearFoodlogBtn.classList.toggle("is-visible", todayItems.length > 0);
  }

  updateProgressBars(allItems);

  renderWeeklyOverview(allItems);
}

function updateProgressBars(items) {
  let cals = 0, protein = 0, carbs = 0, fat = 0;
  const todayStr = new Date().toDateString();
  
  items.forEach((item) => {
    const itemDateStr = new Date(item.loggedAt).toDateString();
    if (itemDateStr === todayStr) {
      cals += item.calories || 0;
      protein += item.protein || 0;
      carbs += item.carbs || 0;
      fat += item.fat || 0;
    }
  });

  const targets = { cals: 2000, protein: 50, carbs: 250, fat: 65 };

  const calPct = Math.min(Math.round((cals / targets.cals) * 100), 100);
  const protPct = Math.min(Math.round((protein / targets.protein) * 100), 100);
  const carbsPct = Math.min(Math.round((carbs / targets.carbs) * 100), 100);
  const fatPct = Math.min(Math.round((fat / targets.fat) * 100), 100);

  const calPctEl = $("#cal-pct");
  if (calPctEl) calPctEl.textContent = `${calPct}%`;
  const protPctEl = $("#protein-pct");
  if (protPctEl) protPctEl.textContent = `${protPct}%`;
  const carbsPctEl = $("#carbs-pct");
  if (carbsPctEl) carbsPctEl.textContent = `${carbsPct}%`;
  const fatPctEl = $("#fat-pct");
  if (fatPctEl) fatPctEl.textContent = `${fatPct}%`;

  const calBar = $("#cal-bar");
  if (calBar) calBar.style.width = `${calPct}%`;
  const protBar = $("#protein-bar");
  if (protBar) protBar.style.width = `${protPct}%`;
  const carbsBar = $("#carbs-bar");
  if (carbsBar) carbsBar.style.width = `${carbsPct}%`;
  const fatBar = $("#fat-bar");
  if (fatBar) fatBar.style.width = `${fatPct}%`;

  const calVal = $("#cal-val");
  if (calVal) calVal.textContent = `${Math.round(cals)} kcal`;
  const protVal = $("#protein-val");
  if (protVal) protVal.textContent = `${Math.round(protein)} g`;
  const carbsVal = $("#carbs-val");
  if (carbsVal) carbsVal.textContent = `${Math.round(carbs)} g`;
  const fatVal = $("#fat-val");
  if (fatVal) fatVal.textContent = `${Math.round(fat)} g`;
}

function renderWeeklyOverview(allItems) {
  const weeklyDaysGrid = $("#weekly-days-grid");
  if (!weeklyDaysGrid) return;

  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const daysData = [];

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(today.getTime() - i * msPerDay);
    const dayName = dayDate.toLocaleDateString("en-US", { weekday: "short" });
    const dateNum = dayDate.getDate();
    const dateStr = dayDate.toDateString();

    let dayCals = 0;
    let dayItemsCount = 0;
    allItems.forEach((item) => {
      if (new Date(item.loggedAt).toDateString() === dateStr) {
        dayCals += item.calories || 0;
        dayItemsCount++;
      }
    });

    daysData.push({
      dayName,
      dateNum,
      cals: dayCals,
      itemsCount: dayItemsCount,
      isToday: i === 0,
    });
  }

  weeklyDaysGrid.innerHTML = daysData
    .map((day) => {
      return `
      <div class="text-center ${day.isToday ? "bg-indigo-100 rounded-xl" : ""}">
        <p class="text-xs text-gray-500 mb-1">${day.dayName}</p>
        <p class="text-sm font-medium text-gray-900">${day.dateNum}</p>
        <div class="mt-2 ${day.cals > 0 ? "text-emerald-600" : "text-gray-300"}">
          <p class="text-lg font-bold">${Math.round(day.cals)}</p>
          <p class="text-xs">kcal</p>
        </div>
        ${day.itemsCount > 0 ? `<p class="text-xs text-gray-400 mt-1">${day.itemsCount} items</p>` : ""}
      </div>
    `;
    })
    .join("");

  const totalCals = daysData.reduce((acc, d) => acc + d.cals, 0);
  const avgCals = Math.round(totalCals / 7);
  const totalItems = daysData.reduce((acc, d) => acc + d.itemsCount, 0);
  const daysOnGoal = daysData.filter((d) => d.cals > 0 && d.cals >= 1600 && d.cals <= 2400).length;

  const avgValEl = $("#weekly-avg-val");
  if (avgValEl) avgValEl.textContent = `${avgCals} kcal`;

  const totalItemsEl = $("#weekly-total-items-val");
  if (totalItemsEl) totalItemsEl.textContent = `${totalItems} items`;

  const daysGoalEl = $("#weekly-days-goal-val");
  if (daysGoalEl) daysGoalEl.textContent = `${daysOnGoal} / 7`;

}


// 8. Event Listeners

function setSidebarOpen(isOpen) {
  sidebar?.classList.toggle("open", isOpen);
  sidebarOverlay?.classList.toggle("active", isOpen);
  headerMenuBtn?.setAttribute("aria-expanded", String(isOpen));
  sidebar?.setAttribute("aria-hidden", String(!isOpen));
}

function addEventListeners() {
  navLinks.forEach((link, i) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageNames = ["meals", "products", "foodlog"];
      navigateTo(pageNames[i]);
      setSidebarOpen(false);
    });
  });

  headerMenuBtn?.setAttribute("aria-expanded", "false");
  headerMenuBtn?.setAttribute("aria-controls", "sidebar");
  sidebar?.setAttribute("aria-hidden", "true");

  headerMenuBtn?.addEventListener("click", () => {
    setSidebarOpen(!sidebar?.classList.contains("open"));
  });
  sidebarCloseBtn?.addEventListener("click", () => setSidebarOpen(false));
  sidebarOverlay?.addEventListener("click", () => setSidebarOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar?.classList.contains("open")) {
      setSidebarOpen(false);
      headerMenuBtn?.focus();
    }
  });

  let searchTimer;
  searchInput?.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchMeals(e.target.value), 500);
  });

  backToMealsBtn?.addEventListener("click", () => {
    navigateTo("meals");
  });

  logMealBtn?.addEventListener("click", async () => {
    if (!currentMeal) return;
    logMealBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

    try {
      const ingStrings = currentMeal.ingredients.map((i) => `${i.measure} ${i.ingredient}`);
      const nutRes = await api.analyzeNutrition(currentMeal.name, ingStrings);

      if (nutRes.success) {
        const ps = nutRes.data.perServing;
        openLogMealOverlay(currentMeal, ps, nutRes.data.servings || 1);
      }
    } catch (e) {
      console.error("Failed to log meal:", e);
      showToast("Nutrition could not be calculated. The meal was not logged.");
    } finally {
      logMealBtn.innerHTML = '<i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>';
    }
  });

  gridViewBtn?.addEventListener("click", () => {
    if (currentViewMode === "grid") return;
    currentViewMode = "grid";
    gridViewBtn.classList.add("bg-white", "rounded-md", "shadow-sm");
    gridViewBtn.querySelector("i").className = "fa-solid fa-table-cells text-gray-700";
    
    listViewBtn.classList.remove("bg-white", "rounded-md", "shadow-sm");
    listViewBtn.querySelector("i").className = "fa-solid fa-list text-gray-500";
    
    showMeals(meals);
  });
  
  listViewBtn?.addEventListener("click", () => {
    if (currentViewMode === "list") return;
    currentViewMode = "list";
    listViewBtn.classList.add("bg-white", "rounded-md", "shadow-sm");
    listViewBtn.querySelector("i").className = "fa-solid fa-list text-gray-700";
    
    gridViewBtn.classList.remove("bg-white", "rounded-md", "shadow-sm");
    gridViewBtn.querySelector("i").className = "fa-solid fa-table-cells text-gray-500";
    
    showMeals(meals);
  });

  searchProductBtn?.addEventListener("click", () => {
    const q = productSearchInput?.value.trim();
    if (q) searchProducts(q);
  });
  productSearchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = productSearchInput.value.trim();
      if (q) searchProducts(q);
    }
  });

  lookupBarcodeBtn?.addEventListener("click", () => {
    const code = barcodeInput?.value.trim();
    if (code) lookupBarcode(code);
  });
  barcodeInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const code = barcodeInput.value.trim();
      if (code) lookupBarcode(code);
    }
  });

  nutriScoreFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      nutriScoreFilters.forEach((b) => {
        b.classList.remove("bg-emerald-600", "text-white");
      });
      btn.classList.add("bg-emerald-600", "text-white");
      filterByNutriScore(btn.dataset.grade);
    });
  });

  productCategoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      loadProductsByCategory(btn.dataset.category);
    });
  });

  clearFoodlogBtn?.addEventListener("click", () => {
    if (window.Swal) {
      Swal.fire({
        title: "Clear Today's Log?",
        text: "This will remove all logged food items for today.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, clear it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          clearTodayFoodLog();
          showFoodLog();
          showClearToast();
          Swal.fire({
            title: "Cleared!",
            text: "Your food log has been cleared.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });
    } else if (confirm("Clear all logged items?")) {
      clearTodayFoodLog();
      showFoodLog();
    }
  });

  window.addEventListener("hashchange", () => {
    navigateTo(getPageFromHash());
  });
}


// 9. App Start

async function startApp() {
  addEventListeners();

  const startPage = getPageFromHash();
  navigateTo(startPage);

  await loadMealsPage();

  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 500);
  }
}

document.addEventListener("DOMContentLoaded", startApp);
