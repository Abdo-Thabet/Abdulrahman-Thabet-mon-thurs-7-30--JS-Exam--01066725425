
// 1. State Setup

const STORAGE_KEY = "nutriplan_foodlog";

const appState = {
  currentPage: "meals",
  search: "",
  category: "",
  area: "",
  meals: [],
  products: [],
};

// 2. App State Functions

export function setState(updates) {
  Object.assign(appState, updates);
  return getState();
}

export function getState() {
  return { ...appState };
}

// 3. Food Log State Functions

export function getFoodLog() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFoodLog(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addFoodItem(item) {
  const log = getFoodLog();
  log.push({
    ...item,
    id: Date.now().toString(),
    loggedAt: new Date().toISOString(),
  });
  saveFoodLog(log);
  return log;
}

export function removeFoodItem(id) {
  let log = getFoodLog();
  log = log.filter((item) => item.id !== id);
  saveFoodLog(log);
  return log;
}

export function clearFoodLog() {
  saveFoodLog([]);
  return [];
}

export function clearTodayFoodLog() {
  const today = new Date().toDateString();
  const remaining = getFoodLog().filter(
    (item) => new Date(item.loggedAt).toDateString() !== today,
  );
  saveFoodLog(remaining);
  return remaining;
}
