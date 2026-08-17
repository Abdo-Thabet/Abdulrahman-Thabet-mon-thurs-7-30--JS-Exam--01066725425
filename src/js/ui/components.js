
// 1. Loading and Empty States

export function spinner() {
  return `<div class="flex items-center justify-center py-12 col-span-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>`;
}

export function emptyState(message = "No items found", subtitle = "Try a different search term") {
  return `<div class="flex flex-col items-center justify-center py-12 text-center col-span-full">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
    </div>
    <p class="text-gray-500 text-lg">${message}</p>
    <p class="text-gray-400 text-sm mt-2">${subtitle}</p>
  </div>`;
}

// 2. Meal Components

export function categoryCard(category) {
  const iconMap = {
    "Beef": { icon: "fa-drumstick-bite", from: "from-red-100", to: "to-red-50", iconBg: "bg-gradient-to-br from-red-400 to-red-500", border: "border-red-200", hoverBorder: "hover:border-red-400" },
    "Chicken": { icon: "fa-drumstick-bite", from: "from-orange-100", to: "to-orange-50", iconBg: "bg-gradient-to-br from-orange-400 to-orange-500", border: "border-orange-200", hoverBorder: "hover:border-orange-400" },
    "Dessert": { icon: "fa-cake-candles", from: "from-pink-100", to: "to-pink-50", iconBg: "bg-gradient-to-br from-pink-400 to-pink-500", border: "border-pink-200", hoverBorder: "hover:border-pink-400" },
    "Lamb": { icon: "fa-drumstick-bite", from: "from-rose-100", to: "to-rose-50", iconBg: "bg-gradient-to-br from-rose-400 to-rose-500", border: "border-rose-200", hoverBorder: "hover:border-rose-400" },
    "Miscellaneous": { icon: "fa-bowl-food", from: "from-teal-100", to: "to-teal-50", iconBg: "bg-gradient-to-br from-teal-400 to-teal-500", border: "border-teal-200", hoverBorder: "hover:border-teal-400" },
    "Pasta": { icon: "fa-plate-wheat", from: "from-amber-100", to: "to-amber-50", iconBg: "bg-gradient-to-br from-amber-400 to-amber-500", border: "border-amber-200", hoverBorder: "hover:border-amber-400" },
    "Pork": { icon: "fa-bacon", from: "from-red-100", to: "to-red-50", iconBg: "bg-gradient-to-br from-red-400 to-red-500", border: "border-red-200", hoverBorder: "hover:border-red-400" },
    "Seafood": { icon: "fa-fish", from: "from-blue-100", to: "to-blue-50", iconBg: "bg-gradient-to-br from-blue-400 to-blue-500", border: "border-blue-200", hoverBorder: "hover:border-blue-400" },
    "Side": { icon: "fa-bowl-rice", from: "from-emerald-100", to: "to-emerald-50", iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-500", border: "border-emerald-200", hoverBorder: "hover:border-emerald-400" },
    "Starter": { icon: "fa-utensils", from: "from-blue-100", to: "to-blue-50", iconBg: "bg-gradient-to-br from-blue-400 to-blue-500", border: "border-blue-200", hoverBorder: "hover:border-blue-400" },
    "Vegan": { icon: "fa-leaf", from: "from-green-100", to: "to-green-50", iconBg: "bg-gradient-to-br from-green-400 to-green-500", border: "border-green-200", hoverBorder: "hover:border-green-400" },
    "Vegetarian": { icon: "fa-seedling", from: "from-lime-100", to: "to-yellow-50", iconBg: "bg-gradient-to-br from-lime-400 to-green-500", border: "border-lime-200", hoverBorder: "hover:border-lime-400" },
  };
  const style = iconMap[category.name] || { icon: "fa-utensils", from: "from-gray-100", to: "to-gray-50", iconBg: "bg-gradient-to-br from-gray-400 to-gray-500", border: "border-gray-200", hoverBorder: "hover:border-gray-400" };

  return `<div class="category-card bg-gradient-to-br ${style.from} ${style.to} rounded-xl p-3 border ${style.border} ${style.hoverBorder} hover:shadow-md cursor-pointer transition-all group" data-category="${category.name}">
    <div class="flex items-center gap-2.5">
      <div class="text-white w-9 h-9 ${style.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
        <i class="fa-solid ${style.icon}"></i>
      </div>
      <div><h3 class="text-sm font-bold text-gray-900">${category.name}</h3></div>
    </div>
  </div>`;
}

export function recipeCard(meal, viewMode = "grid") {
  if (viewMode === "list") {
    return `<div class="recipe-card flex bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.id}">
      <div class="w-40 h-40 shrink-0 overflow-hidden bg-gray-100">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy"/>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">${meal.instructions && meal.instructions.length > 0 ? meal.instructions[0] : (meal.category ? meal.category + " cuisine" : "Delicious recipe")}</p>
        </div>
        <div class="flex items-center justify-between text-xs mt-auto">
          <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category || ""}</span>
          <span class="font-semibold text-blue-500"><i class="fa-solid fa-globe mr-1"></i>${meal.area || ""}</span>
        </div>
      </div>
    </div>`;
  }

  return `<div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.id}">
    <div class="relative h-48 overflow-hidden">
      <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy"/>
      <div class="absolute bottom-3 left-3 flex gap-2 flex-wrap">
        ${meal.category ? `<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.category}</span>` : ""}
        ${meal.area ? `<span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${meal.area}</span>` : ""}
      </div>
    </div>
    <div class="p-4">
      <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
      <p class="text-xs text-gray-600 mb-3 line-clamp-2">${meal.instructions && meal.instructions.length > 0 ? meal.instructions[0] : (meal.category ? meal.category + " cuisine" : "Delicious recipe")}</p>
      <div class="flex items-center justify-between text-xs">
        <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category || ""}</span>
        <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.area || ""}</span>
      </div>
    </div>
  </div>`;
}

// 3. Product Components

export function productCard(product) {
  const grade = (product.nutritionGrade || "?").toUpperCase();
  const gradeColors = { A: "bg-green-500", B: "bg-lime-500", C: "bg-yellow-500", D: "bg-orange-500", E: "bg-red-500" };
  const bgColor = gradeColors[grade] || "bg-gray-400";
  const cal = Math.round(product.nutrients?.calories || 0);
  const prot = Math.round(product.nutrients?.protein || 0);
  const carbs = Math.round(product.nutrients?.carbs || 0);
  const fat = Math.round(product.nutrients?.fat || 0);
  const sugar = Math.round(product.nutrients?.sugar || product.nutrients?.sugars || 0);
  const brand = product.brand || product.brands || "";
  const quantity = product.quantity || product.weight || product.size || "330 ml";
  
  const nova = product.novaGroup || product.nova || product.nova_group || product.novaScore || 4;
  const novaColors = { 1: "bg-green-500", 2: "bg-yellow-500", 3: "bg-orange-500", 4: "bg-red-500" };
  const novaBg = novaColors[nova] || "bg-red-500";

  return `<div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${product.barcode || ""}">
    <div class="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
      ${product.image ? `
        <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${product.image}" alt="${product.name || 'Product Image'}" loading="lazy" />
      ` : `
        <i class="fa-solid fa-box text-gray-300 text-4xl"></i>
      `}
      <div class="absolute top-2 left-2 ${bgColor} text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${grade}</div>
      <div class="absolute top-2 right-2 ${novaBg} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${nova}">
        ${nova}
      </div>
    </div>
    <div class="p-4">
      ${brand ? `<p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${brand}</p>` : ""}
      <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${product.name || "Unknown Product"}</h3>
      <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span><i class="fa-solid fa-weight-scale mr-1"></i>${quantity}</span>
        <span><i class="fa-solid fa-fire mr-1"></i>${cal} kcal/100g</span>
      </div>
      <div class="grid grid-cols-4 gap-1 text-center">
        <div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${prot}g</p><p class="text-[10px] text-gray-500">Protein</p></div>
        <div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${carbs}g</p><p class="text-[10px] text-gray-500">Carbs</p></div>
        <div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${fat}g</p><p class="text-[10px] text-gray-500">Fat</p></div>
        <div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${sugar}g</p><p class="text-[10px] text-gray-500">Sugar</p></div>
      </div>
    </div>
  </div>`;
}

// 4. Food Log Components

export function loggedItemRow(item) {
  const isProduct = item.type === "product";
  const typeColor = isProduct ? "text-blue-600" : "text-emerald-600";
  return `<div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all" data-id="${item.id}">
    <div class="flex items-center gap-4">
      ${item.thumbnail
        ? `<img src="${item.thumbnail}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover" />`
        : `<div class="w-14 h-14 ${isProduct ? "bg-blue-100" : "bg-emerald-100"} rounded-xl flex items-center justify-center">
            <i class="fa-solid ${isProduct ? "fa-box text-blue-600" : "fa-utensils text-emerald-600"} text-xl"></i>
          </div>`}
      <div>
        <p class="font-semibold text-gray-900">${item.name}</p>
        <p class="text-sm text-gray-500">
          ${item.servings ? `${item.servings} serving${item.servings !== 1 ? "s" : ""}` : item.brand || item.serving || (isProduct ? "Product" : "1 serving")}
          <span class="mx-1">&bull;</span>
          <span class="${typeColor}">${isProduct ? "Product" : "Recipe"}</span>
        </p>
        <p class="text-xs text-gray-400 mt-1">${new Date(item.loggedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="text-right">
        <p class="text-lg font-bold text-emerald-600">${Math.round(item.calories || 0)}</p>
        <p class="text-xs text-gray-500">kcal</p>
      </div>
      <div class="hidden md:flex gap-2 text-xs text-gray-500">
        <span class="px-2 py-1 bg-blue-50 rounded">${Math.round(item.protein || 0)}g P</span>
        <span class="px-2 py-1 bg-amber-50 rounded">${Math.round(item.carbs || 0)}g C</span>
        <span class="px-2 py-1 bg-purple-50 rounded">${Math.round(item.fat || 0)}g F</span>
      </div>
      <button class="delete-log-item text-gray-400 hover:text-red-500 transition-all p-2" data-id="${item.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  </div>`;
}
