
// 1. API Setup

const BASE_URL = "https://nutriplan-api.vercel.app/api";
const MEALDB_URL = "https://www.themealdb.com/api/json/v1/1";
const API_KEY = "dKXbFDmt4sDjtFld7sbM5laEDr7sx882ajoRZyP9";


// 2. Meal API Functions

export async function searchMeals(query = "") {
  const response = await fetch(`${MEALDB_URL}/search.php?s=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Failed to search meals");
  const data = await response.json();
  return { results: (data.meals || []).map(normalizeMeal) };
}

export async function filterMeals(params = {}) {
  const key = params.category ? "c" : params.area ? "a" : "i";
  const value = params.category || params.area || params.ingredient || "";
  const response = await fetch(`${MEALDB_URL}/filter.php?${key}=${encodeURIComponent(value)}`);
  if (!response.ok) throw new Error("Failed to filter meals");
  const data = await response.json();
  const meals = data.meals || [];
  const detailedMeals = await Promise.all(
    meals.map(async (meal) => {
      try {
        return (await getMealById(meal.idMeal)).result;
      } catch {
        return normalizeMeal(meal);
      }
    }),
  );
  return { results: detailedMeals };
}

export async function getMealById(id) {
  const response = await fetch(`${MEALDB_URL}/lookup.php?i=${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("Failed to get meal");
  const data = await response.json();
  const meal = data.meals?.[0];
  if (!meal) throw new Error("Meal not found");
  return { result: normalizeMeal(meal) };
}

export async function getRandomMeals(count = 10) {
  const requests = Array.from({ length: count }, async () => {
    const response = await fetch(`${MEALDB_URL}/random.php`);
    if (!response.ok) throw new Error("Failed to get random meals");
    const data = await response.json();
    return data.meals?.[0] ? normalizeMeal(data.meals[0]) : null;
  });
  const meals = (await Promise.all(requests)).filter(Boolean);
  return { results: [...new Map(meals.map((meal) => [meal.id, meal])).values()] };
}

export async function getMealCategories() {
  const response = await fetch(`${MEALDB_URL}/categories.php`);
  if (!response.ok) throw new Error("Failed to get categories");
  const data = await response.json();
  return {
    results: (data.categories || []).map((category) => ({
      id: category.idCategory,
      name: category.strCategory,
      thumbnail: category.strCategoryThumb,
      description: category.strCategoryDescription,
    })),
  };
}

export async function getMealAreas() {
  const response = await fetch(`${MEALDB_URL}/list.php?a=list`);
  if (!response.ok) throw new Error("Failed to get areas");
  const data = await response.json();
  return {
    results: (data.meals || []).map((area) => ({
      name: area.strArea,
      value: area.strCountry || area.strArea,
    })),
  };
}

function normalizeMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i += 1) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    if (ingredient) {
      ingredients.push({ ingredient, measure: meal[`strMeasure${i}`]?.trim() || "" });
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory || "",
    area: meal.strArea || "",
    thumbnail: meal.strMealThumb,
    instructions: meal.strInstructions
      ? meal.strInstructions.split(/\r?\n/).map((step) => step.trim()).filter(Boolean)
      : [],
    ingredients,
    youtube: meal.strYoutube || "",
    source: meal.strSource || "",
    tags: meal.strTags ? meal.strTags.split(",").map((tag) => tag.trim()) : [],
  };
}


// 3. Nutrition API Function

export async function analyzeNutrition(recipeName, ingredients) {
  const response = await fetch(`${BASE_URL}/nutrition/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ recipeName, ingredients }),
  });
  if (!response.ok) throw new Error("Failed to analyze nutrition");
  return response.json();
}


// 4. Product API Functions

export async function searchProducts(query) {
  const response = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Failed to search products");
  return response.json();
}

export async function getProductByBarcode(code) {
  const response = await fetch(`${BASE_URL}/products/barcode/${encodeURIComponent(code)}`);
  if (!response.ok) throw new Error("Failed to get product by barcode");
  return response.json();
}

export async function getProductsByCategory(category, page = 1, limit = 24) {
  const response = await fetch(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to get products by category");
  return response.json();
}

export async function getProductCategories(page = 1, limit = 50) {
  const response = await fetch(
    `${BASE_URL}/products/categories?page=${page}&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to get product categories");
  return response.json();
}
