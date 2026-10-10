/**
 * FlavorCraft Main Application Controller
 * Handles UI interactions, filtering, dynamic rendering, recipe creation & editing,
 * servings scaling, kitchen timer with audio chime, and print integration.
 */

// Preset photo options for quick visual recipe creation
const PHOTO_PRESETS = [
  { name: 'Fried Rice', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80' },
  { name: 'Beef Rendang', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80' },
  { name: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=800&auto=format&fit=crop&q=80' },
  { name: 'Garlic Chicken', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80' },
  { name: 'Chicken Satay', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80' },
  { name: 'Pancakes', url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&auto=format&fit=crop&q=80' },
  { name: 'Warm Soup', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80' },
  { name: 'Lava Cake', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80' },
  { name: 'Smoothie Bowl', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80' },
  { name: 'Fresh Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' },
  { name: 'Grilled Steak', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80' },
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80' }
];

const DEFAULT_FOOD_PLACEHOLDER = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80';

// App State
const state = {
  recipes: [],
  filteredRecipes: [],
  activeCategory: 'all',
  activeDifficulty: 'all',
  activeTime: 'all',
  activeSort: 'newest',
  searchQuery: '',
  favoritesOnly: false,
  activeDetailRecipe: null,
  scaledServings: 1,
  recipeToDeleteId: null,
  timerInterval: null,
  timerSecondsLeft: 0,
  timerIsRunning: false
};

// DOM Elements
const elements = {
  recipesGrid: document.getElementById('recipesGrid'),
  emptyState: document.getElementById('emptyState'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  addRecipeBtn: document.getElementById('addRecipeBtn'),
  emptyAddBtn: document.getElementById('emptyAddBtn'),
  favoritesFilterBtn: document.getElementById('favoritesFilterBtn'),
  categoryPills: document.getElementById('categoryPills'),
  difficultyFilter: document.getElementById('difficultyFilter'),
  timeFilter: document.getElementById('timeFilter'),
  sortFilter: document.getElementById('sortFilter'),
  clearAllFiltersBtn: document.getElementById('clearAllFiltersBtn'),
  filterStatusNotice: document.getElementById('filterStatusNotice'),
  filterStatusText: document.getElementById('filterStatusText'),
  resetFiltersLink: document.getElementById('resetFiltersLink'),
  totalRecipesCount: document.getElementById('totalRecipesCount'),
  quickMealsCount: document.getElementById('quickMealsCount'),
  favoritesCount: document.getElementById('favoritesCount'),
  storageBadge: document.getElementById('storageBadge'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  moreActionsBtn: document.getElementById('moreActionsBtn'),
  moreActionsMenu: document.getElementById('moreActionsMenu'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  importFileInput: document.getElementById('importFileInput'),
  resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
  brandLogo: document.getElementById('brandLogo'),
  
  // Detail Modal
  recipeModal: document.getElementById('recipeModal'),
  recipeDetailContent: document.getElementById('recipeDetailContent'),
  closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),

  // Form Modal
  formModal: document.getElementById('formModal'),
  formModalTitle: document.getElementById('formModalTitle'),
  closeFormModalBtn: document.getElementById('closeFormModalBtn'),
  cancelFormBtn: document.getElementById('cancelFormBtn'),
  recipeForm: document.getElementById('recipeForm'),
  formRecipeId: document.getElementById('formRecipeId'),
  recipeTitleInput: document.getElementById('recipeTitleInput'),
  recipeCategoryInput: document.getElementById('recipeCategoryInput'),
  recipeCustomCategoryInput: document.getElementById('recipeCustomCategoryInput'),
  recipeCuisineInput: document.getElementById('recipeCuisineInput'),
  recipeDescInput: document.getElementById('recipeDescInput'),
  recipePrepTimeInput: document.getElementById('recipePrepTimeInput'),
  recipeCookTimeInput: document.getElementById('recipeCookTimeInput'),
  recipeServingsInput: document.getElementById('recipeServingsInput'),
  recipeImageUrlInput: document.getElementById('recipeImageUrlInput'),
  recipeImageFileInput: document.getElementById('recipeImageFileInput'),
  uploadDropzone: document.getElementById('uploadDropzone'),
  presetGallery: document.getElementById('presetGallery'),
  imagePreviewBox: document.getElementById('imagePreviewBox'),
  imagePreviewImg: document.getElementById('imagePreviewImg'),
  imagePreviewPlaceholder: document.getElementById('imagePreviewPlaceholder'),
  ingredientsListBuilder: document.getElementById('ingredientsListBuilder'),
  addIngredientRowBtn: document.getElementById('addIngredientRowBtn'),
  bulkIngredientsToggle: document.getElementById('bulkIngredientsToggle'),
  bulkIngredientsPane: document.getElementById('bulkIngredientsPane'),
  bulkIngredientsText: document.getElementById('bulkIngredientsText'),
  applyBulkIngredientsBtn: document.getElementById('applyBulkIngredientsBtn'),
  stepsListBuilder: document.getElementById('stepsListBuilder'),
  addStepRowBtn: document.getElementById('addStepRowBtn'),
  bulkStepsToggle: document.getElementById('bulkStepsToggle'),
  bulkStepsPane: document.getElementById('bulkStepsPane'),
  bulkStepsText: document.getElementById('bulkStepsText'),
  applyBulkStepsBtn: document.getElementById('applyBulkStepsBtn'),
  recipeTipsInput: document.getElementById('recipeTipsInput'),
  recipeTagsInput: document.getElementById('recipeTagsInput'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteRecipeTitle: document.getElementById('deleteRecipeTitle'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  renderPresetGallery();
  
  // Initialize storage layer (API vs Local)
  const isOnline = await window.recipeStore.init();
  updateStorageBadge(isOnline);

  await loadRecipes();
  setupEventListeners();
});

function updateStorageBadge(isOnline) {
  if (isOnline) {
    elements.storageBadge.textContent = '🟢 Server API Active';
    elements.storageBadge.classList.add('online');
    elements.storageBadge.title = 'Saved to data/recipes.json via backend server';
  } else {
    elements.storageBadge.textContent = '💾 Browser Storage';
    elements.storageBadge.classList.remove('online');
    elements.storageBadge.title = 'Saved locally in browser localStorage';
  }
}

// ==========================================================================
// Theme Handling
// ==========================================================================

function initTheme() {
  const savedTheme = localStorage.getItem('pa_recipe_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    elements.themeIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-theme');
    elements.themeIcon.textContent = '🌙';
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('pa_recipe_theme', isDark ? 'dark' : 'light');
  showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'info');
}

// ==========================================================================
// Data Operations & Filtering
// ==========================================================================

async function loadRecipes() {
  try {
    state.recipes = await window.recipeStore.getAll();
    applyFilters();
  } catch (err) {
    console.error('Failed to load recipes:', err);
    showToast('Failed to load recipes data', 'error');
  }
}

function applyFilters() {
  let list = [...state.recipes];

  // Search filter
  const q = state.searchQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(r => {
      const titleMatch = (r.title || '').toLowerCase().includes(q);
      const descMatch = (r.description || '').toLowerCase().includes(q);
      const cuisineMatch = (r.cuisine || '').toLowerCase().includes(q);
      const tagsMatch = (r.tags || []).some(t => t.toLowerCase().includes(q));
      const ingMatch = (r.ingredients || []).some(i => {
        const name = typeof i === 'string' ? i : (i.name || '');
        return name.toLowerCase().includes(q);
      });
      return titleMatch || descMatch || cuisineMatch || tagsMatch || ingMatch;
    });
  }

  // Category filter
  if (state.activeCategory !== 'all') {
    list = list.filter(r => (r.category || '').toLowerCase() === state.activeCategory.toLowerCase());
  }

  // Difficulty filter
  if (state.activeDifficulty !== 'all') {
    list = list.filter(r => (r.difficulty || '').toLowerCase() === state.activeDifficulty.toLowerCase());
  }

  // Max Time filter
  if (state.activeTime !== 'all') {
    const maxMins = parseInt(state.activeTime, 10);
    list = list.filter(r => {
      const totalTime = (parseInt(r.prepTime || 0, 10)) + (parseInt(r.cookTime || 0, 10));
      return totalTime <= maxMins;
    });
  }

  // Favorites filter
  if (state.favoritesOnly) {
    list = list.filter(r => Boolean(r.isFavorite));
  }

  // Sorting
  if (state.activeSort === 'fastest') {
    list.sort((a, b) => {
      const timeA = (parseInt(a.prepTime || 0, 10)) + (parseInt(a.cookTime || 0, 10));
      const timeB = (parseInt(b.prepTime || 0, 10)) + (parseInt(b.cookTime || 0, 10));
      return timeA - timeB;
    });
  } else if (state.activeSort === 'az') {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else {
    // Newest
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  state.filteredRecipes = list;
  renderRecipesGrid();
  updateStats();
  updateFilterNotice();
}

function updateStats() {
  elements.totalRecipesCount.textContent = state.recipes.length;
  
  const quickCount = state.recipes.filter(r => {
    const total = (parseInt(r.prepTime || 0, 10)) + (parseInt(r.cookTime || 0, 10));
    return total <= 30;
  }).length;
  elements.quickMealsCount.textContent = quickCount;

  const favsCount = state.recipes.filter(r => Boolean(r.isFavorite)).length;
  elements.favoritesCount.textContent = favsCount;
}

function updateFilterNotice() {
  const isFiltered = state.searchQuery ||
    state.activeCategory !== 'all' ||
    state.activeDifficulty !== 'all' ||
    state.activeTime !== 'all' ||
    state.favoritesOnly;

  if (isFiltered) {
    elements.filterStatusNotice.style.display = 'flex';
    let parts = [];
    if (state.searchQuery) parts.push(`matching "${state.searchQuery}"`);
    if (state.activeCategory !== 'all') parts.push(`in ${state.activeCategory}`);
    if (state.activeDifficulty !== 'all') parts.push(`${state.activeDifficulty} difficulty`);
    if (state.activeTime !== 'all') parts.push(`under ${state.activeTime}m`);
    if (state.favoritesOnly) parts.push('favorites only');

    elements.filterStatusText.textContent = `Showing ${state.filteredRecipes.length} recipes (${parts.join(', ')})`;
  } else {
    elements.filterStatusNotice.style.display = 'none';
  }
}

function resetAllFilters() {
  state.searchQuery = '';
  elements.searchInput.value = '';
  elements.clearSearchBtn.style.display = 'none';
  state.activeCategory = 'all';
  state.activeDifficulty = 'all';
  elements.difficultyFilter.value = 'all';
  state.activeTime = 'all';
  elements.timeFilter.value = 'all';
  state.activeSort = 'newest';
  elements.sortFilter.value = 'newest';
  state.favoritesOnly = false;
  elements.favoritesFilterBtn.classList.remove('btn-primary');
  elements.favoritesFilterBtn.classList.add('btn-secondary');

  // Update pills
  elements.categoryPills.querySelectorAll('.pill').forEach(p => {
    p.classList.toggle('active', p.dataset.category === 'all');
  });

  applyFilters();
}

// ==========================================================================
// Rendering Recipes Cards
// ==========================================================================

function renderRecipesGrid() {
  elements.recipesGrid.innerHTML = '';

  if (state.filteredRecipes.length === 0) {
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  state.filteredRecipes.forEach(recipe => {
    const card = createRecipeCardElement(recipe);
    elements.recipesGrid.appendChild(card);
  });
}

function createRecipeCardElement(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.tabIndex = 0;

  const totalTime = (parseInt(recipe.prepTime || 0, 10)) + (parseInt(recipe.cookTime || 0, 10));
  const imageUrl = recipe.image || DEFAULT_FOOD_PLACEHOLDER;
  const isFav = Boolean(recipe.isFavorite);
  const diff = recipe.difficulty || 'Easy';
  const category = recipe.category || 'Main Course';
  const servings = recipe.servings || 4;

  const tagsHtml = (recipe.tags || []).slice(0, 3).map(tag => 
    `<span class="tag-chip">#${escapeHtml(tag)}</span>`
  ).join('');

  card.innerHTML = `
    <div class="card-media">
      <img class="card-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(recipe.title)}" loading="lazy" onerror="this.src='${DEFAULT_FOOD_PLACEHOLDER}'">
      <span class="card-badge">${escapeHtml(category)}</span>
      <button class="card-favorite-btn ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" data-id="${escapeHtml(recipe.id)}" aria-label="Favorite">
        ♥
      </button>
    </div>
    <div class="card-body">
      <div class="card-meta-row">
        <span class="difficulty-tag ${escapeHtml(diff)}">${escapeHtml(diff)}</span>
        <span class="time-tag">⏱️ ${totalTime}m</span>
      </div>
      <h3 class="card-title">${escapeHtml(recipe.title)}</h3>
      <p class="card-desc">${escapeHtml(recipe.description || 'A delightful dish to make and enjoy.')}</p>
      
      <div class="card-tags">
        ${tagsHtml}
      </div>

      <div class="card-footer">
        <span class="servings-info">🍽️ ${servings} Servings</span>
        <div class="card-actions-btn-group">
          <button class="btn btn-sm btn-secondary edit-recipe-btn" data-id="${escapeHtml(recipe.id)}" title="Edit Recipe">✏️</button>
          <button class="btn btn-sm btn-primary view-recipe-btn" data-id="${escapeHtml(recipe.id)}">View Recipe →</button>
        </div>
      </div>
    </div>
  `;

  // Click card body to open details
  card.addEventListener('click', (e) => {
    // If clicked on favorite button or edit button, ignore opening modal
    if (e.target.closest('.card-favorite-btn') || e.target.closest('.edit-recipe-btn')) {
      return;
    }
    openRecipeDetail(recipe.id);
  });

  // Favorite button listener
  const favBtn = card.querySelector('.card-favorite-btn');
  favBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  });

  // Edit button listener
  const editBtn = card.querySelector('.edit-recipe-btn');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditRecipeModal(recipe.id);
  });

  return card;
}

async function toggleFavorite(recipeId) {
  const recipe = state.recipes.find(r => String(r.id) === String(recipeId));
  if (!recipe) return;

  const newStatus = !recipe.isFavorite;
  recipe.isFavorite = newStatus;
  await window.recipeStore.update(recipeId, { isFavorite: newStatus });
  
  showToast(newStatus ? 'Added to favorites ❤️' : 'Removed from favorites', 'info');
  applyFilters();

  // If detail modal is open for this recipe, re-render favorite state
  if (state.activeDetailRecipe && String(state.activeDetailRecipe.id) === String(recipeId)) {
    state.activeDetailRecipe.isFavorite = newStatus;
  }
}

// ==========================================================================
// Recipe Detail Modal & Servings Scaler
// ==========================================================================

function openRecipeDetail(recipeId) {
  const recipe = state.recipes.find(r => String(r.id) === String(recipeId));
  if (!recipe) return;

  state.activeDetailRecipe = recipe;
  state.scaledServings = recipe.servings || 4;
  renderRecipeDetailContent();

  elements.recipeModal.classList.add('show');
  elements.recipeModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeRecipeDetail() {
  elements.recipeModal.classList.remove('show');
  elements.recipeModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopKitchenTimer();
  state.activeDetailRecipe = null;
}

function renderRecipeDetailContent() {
  const recipe = state.activeDetailRecipe;
  if (!recipe) return;

  const totalTime = (parseInt(recipe.prepTime || 0, 10)) + (parseInt(recipe.cookTime || 0, 10));
  const originalServings = recipe.servings || 4;
  const currentServings = state.scaledServings;
  const scaleRatio = currentServings / originalServings;

  // Scale and format ingredients
  const ingredientsHtml = (recipe.ingredients || []).map((ing, idx) => {
    let ingName = '';
    let ingAmt = '';
    let ingUnit = '';

    if (typeof ing === 'string') {
      ingName = ing;
    } else {
      ingName = ing.name || '';
      if (ing.amount !== undefined && ing.amount !== null && ing.amount !== '') {
        const numAmt = parseFloat(ing.amount);
        if (!isNaN(numAmt)) {
          const scaledNum = numAmt * scaleRatio;
          ingAmt = formatIngredientAmount(scaledNum);
        } else {
          ingAmt = ing.amount;
        }
      }
      ingUnit = ing.unit || '';
    }

    const displayAmount = ingAmt ? `${ingAmt} ${ingUnit}`.trim() : '';

    return `
      <li class="ingredient-item" data-idx="${idx}">
        <input type="checkbox" class="ingredient-checkbox" id="ing-check-${idx}">
        <label for="ing-check-${idx}" class="ingredient-text">
          ${displayAmount ? `<span class="ingredient-amt">${escapeHtml(displayAmount)}</span>` : ''} 
          ${escapeHtml(ingName)}
        </label>
      </li>
    `;
  }).join('');

  // Instructions
  const stepsHtml = (recipe.instructions || []).map((step, idx) => `
    <li class="step-card" data-step="${idx}">
      <div class="step-number">${idx + 1}</div>
      <div class="step-content">
        <p class="step-text">${escapeHtml(step)}</p>
        <button class="step-toggle-btn" data-step="${idx}">Mark as completed</button>
      </div>
    </li>
  `).join('');

  // Tips section
  const tipsHtml = recipe.tips ? `
    <div class="chef-tips-box">
      <span class="tips-icon">💡</span>
      <div class="tips-text">
        <strong>Chef's Pro Tip:</strong> ${escapeHtml(recipe.tips)}
      </div>
    </div>
  ` : '';

  const imageUrl = recipe.image || DEFAULT_FOOD_PLACEHOLDER;

  elements.recipeDetailContent.innerHTML = `
    <div class="detail-hero-media">
      <img class="detail-hero-img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(recipe.title)}" onerror="this.src='${DEFAULT_FOOD_PLACEHOLDER}'">
      <div class="detail-hero-overlay">
        <div class="detail-hero-badges">
          <span class="card-badge">${escapeHtml(recipe.category || 'Main Course')}</span>
          ${recipe.cuisine ? `<span class="card-badge">🌍 ${escapeHtml(recipe.cuisine)}</span>` : ''}
          <span class="difficulty-tag ${escapeHtml(recipe.difficulty || 'Easy')}">${escapeHtml(recipe.difficulty || 'Easy')}</span>
        </div>
        <h2 class="detail-title">${escapeHtml(recipe.title)}</h2>
      </div>
    </div>

    <div class="detail-body">
      <!-- Quick metrics -->
      <div class="metrics-strip">
        <div class="metric-item">
          <span class="metric-label">Prep Time</span>
          <span class="metric-value">⏱️ ${recipe.prepTime || 0} mins</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Cook Time</span>
          <span class="metric-value">🔥 ${recipe.cookTime || 0} mins</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Total Time</span>
          <span class="metric-value">⏳ ${totalTime} mins</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Difficulty</span>
          <span class="metric-value">${escapeHtml(recipe.difficulty || 'Easy')}</span>
        </div>
      </div>

      <p class="card-desc" style="-webkit-line-clamp: unset; font-size: 1rem; color: var(--text-main);">
        ${escapeHtml(recipe.description || '')}
      </p>

      <!-- Servings Scaler Widget -->
      <div class="servings-scaler">
        <div class="scaler-info">
          <span class="scaler-title">Serving Size Calculator</span>
          <span class="scaler-sub">Ingredient amounts scale dynamically with servings</span>
        </div>
        <div class="scaler-controls">
          <button class="scaler-btn" id="decreaseServingsBtn" title="Decrease servings">−</button>
          <span class="scaler-count" id="currentServingsDisplay">${currentServings}</span>
          <button class="scaler-btn" id="increaseServingsBtn" title="Increase servings">+</button>
        </div>
      </div>

      <!-- Ingredients List -->
      <div class="detail-section">
        <div class="section-title-wrap">
          <h3 class="detail-section-title">Ingredients</h3>
          <button class="btn btn-sm btn-secondary" id="copyIngredientsBtn" title="Copy ingredients to clipboard">
            📋 Copy Checklist
          </button>
        </div>
        <ul class="ingredients-list" id="modalIngredientsList">
          ${ingredientsHtml || '<p class="text-muted">No ingredients specified.</p>'}
        </ul>
      </div>

      <!-- Cooking Steps -->
      <div class="detail-section">
        <div class="section-title-wrap">
          <h3 class="detail-section-title">Step-by-Step Instructions</h3>
        </div>
        <ol class="steps-list" id="modalStepsList">
          ${stepsHtml || '<p class="text-muted">No instructions provided.</p>'}
        </ol>
      </div>

      <!-- Kitchen Timer Widget -->
      <div class="kitchen-timer-widget">
        <div class="timer-header">
          <span class="timer-title">⏱️ Kitchen Cooking Timer</span>
          <div class="timer-presets">
            <button class="timer-preset-btn" data-mins="3">+3m</button>
            <button class="timer-preset-btn" data-mins="5">+5m</button>
            <button class="timer-preset-btn" data-mins="10">+10m</button>
            <button class="timer-preset-btn" data-mins="15">+15m</button>
            <button class="timer-preset-btn" data-mins="20">+20m</button>
          </div>
        </div>
        <div class="timer-display" id="kitchenTimerDisplay">00:00</div>
        <div class="timer-controls">
          <button class="btn btn-sm btn-primary" id="timerStartPauseBtn">Start Timer</button>
          <button class="btn btn-sm btn-secondary" id="timerResetBtn">Reset</button>
        </div>
      </div>

      <!-- Chef's Pro Tips -->
      ${tipsHtml}
    </div>

    <!-- Detail Modal Action Footer -->
    <div class="detail-actions-bar">
      <div class="left-actions">
        <button class="btn btn-secondary" id="printRecipeBtn">🖨️ Print Recipe</button>
        <button class="btn btn-secondary" id="shareRecipeBtn">🔗 Share</button>
      </div>
      <div class="right-actions">
        <button class="btn btn-secondary" id="detailEditBtn">✏️ Edit Recipe</button>
        <button class="btn btn-danger" id="detailDeleteBtn">🗑️ Delete</button>
      </div>
    </div>
  `;

  // Attach Detail Event Listeners
  attachDetailModalListeners();
}

function attachDetailModalListeners() {
  const recipe = state.activeDetailRecipe;
  if (!recipe) return;

  // Servings Scaler Buttons
  const decBtn = document.getElementById('decreaseServingsBtn');
  const incBtn = document.getElementById('increaseServingsBtn');

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      if (state.scaledServings > 1) {
        state.scaledServings--;
        renderRecipeDetailContent();
      }
    });
  }

  if (incBtn) {
    incBtn.addEventListener('click', () => {
      if (state.scaledServings < 40) {
        state.scaledServings++;
        renderRecipeDetailContent();
      }
    });
  }

  // Ingredient checkbox click handling
  const ingItems = elements.recipeDetailContent.querySelectorAll('.ingredient-item');
  ingItems.forEach(item => {
    const cb = item.querySelector('.ingredient-checkbox');
    cb.addEventListener('change', () => {
      item.classList.toggle('checked', cb.checked);
    });
  });

  // Step item completion click handling
  const stepCards = elements.recipeDetailContent.querySelectorAll('.step-card');
  stepCards.forEach(card => {
    const btn = card.querySelector('.step-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isDone = card.classList.toggle('completed');
        btn.textContent = isDone ? 'Completed ✓' : 'Mark as completed';
      });
    }
  });

  // Copy Ingredients Checklist
  const copyBtn = document.getElementById('copyIngredientsBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const scaleRatio = state.scaledServings / (recipe.servings || 4);
      const textList = (recipe.ingredients || []).map(ing => {
        if (typeof ing === 'string') return `• ${ing}`;
        let amtStr = '';
        if (ing.amount) {
          const num = parseFloat(ing.amount);
          amtStr = isNaN(num) ? ing.amount : formatIngredientAmount(num * scaleRatio);
        }
        return `• ${amtStr} ${ing.unit || ''} ${ing.name || ''}`.replace(/\s+/g, ' ').trim();
      }).join('\n');

      const fullText = `🛒 Ingredients for ${recipe.title} (${state.scaledServings} servings):\n\n${textList}`;
      navigator.clipboard.writeText(fullText).then(() => {
        showToast('Ingredients copied to clipboard! 📋', 'success');
      }).catch(() => {
        showToast('Failed to copy to clipboard', 'error');
      });
    });
  }

  // Print Recipe
  const printBtn = document.getElementById('printRecipeBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Share Recipe Link
  const shareBtn = document.getElementById('shareRecipeBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: recipe.title,
          text: `Check out this delicious recipe: ${recipe.title}`,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Recipe page link copied! 🔗', 'success');
        });
      }
    });
  }

  // Edit from detail
  const editBtn = document.getElementById('detailEditBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const id = recipe.id;
      closeRecipeDetail();
      openEditRecipeModal(id);
    });
  }

  // Delete from detail
  const deleteBtn = document.getElementById('detailDeleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const id = recipe.id;
      closeRecipeDetail();
      openDeleteConfirmModal(id);
    });
  }

  // Timer controls in Detail
  setupKitchenTimerListeners();
}

// Helpers for ingredient formatting
function formatIngredientAmount(amount) {
  if (amount <= 0) return '';
  // Check nice fractions
  const rounded = Math.round(amount * 100) / 100;
  if (rounded === 0.25) return '1/4';
  if (rounded === 0.33) return '1/3';
  if (rounded === 0.5) return '1/2';
  if (rounded === 0.67) return '2/3';
  if (rounded === 0.75) return '3/4';
  if (Number.isInteger(rounded)) return rounded.toString();
  return rounded.toFixed(1).replace(/\.0$/, '');
}

// ==========================================================================
// Built-in Kitchen Timer
// ==========================================================================

function setupKitchenTimerListeners() {
  const display = document.getElementById('kitchenTimerDisplay');
  const startBtn = document.getElementById('timerStartPauseBtn');
  const resetBtn = document.getElementById('timerResetBtn');
  const presetBtns = elements.recipeDetailContent.querySelectorAll('.timer-preset-btn');

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.dataset.mins, 10);
      state.timerSecondsLeft += mins * 60;
      updateTimerDisplay();
    });
  });

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (state.timerIsRunning) {
        pauseKitchenTimer();
        startBtn.textContent = 'Resume Timer';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
      } else {
        if (state.timerSecondsLeft <= 0) {
          state.timerSecondsLeft = 5 * 60; // default 5 mins if 0
        }
        startKitchenTimer();
        startBtn.textContent = 'Pause Timer';
        startBtn.classList.remove('btn-primary');
        startBtn.classList.add('btn-secondary');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopKitchenTimer();
      updateTimerDisplay();
      if (startBtn) {
        startBtn.textContent = 'Start Timer';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
      }
    });
  }

  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('kitchenTimerDisplay');
  if (!display) return;
  const m = Math.floor(state.timerSecondsLeft / 60);
  const s = state.timerSecondsLeft % 60;
  display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startKitchenTimer() {
  state.timerIsRunning = true;
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.timerSecondsLeft > 0) {
      state.timerSecondsLeft--;
      updateTimerDisplay();
    } else {
      stopKitchenTimer();
      playTimerChime();
      showToast('⏰ Kitchen Timer Finished! Time to check your dish!', 'success');
      const startBtn = document.getElementById('timerStartPauseBtn');
      if (startBtn) {
        startBtn.textContent = 'Start Timer';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
      }
    }
  }, 1000);
}

function pauseKitchenTimer() {
  state.timerIsRunning = false;
  clearInterval(state.timerInterval);
}

function stopKitchenTimer() {
  state.timerIsRunning = false;
  clearInterval(state.timerInterval);
  state.timerSecondsLeft = 0;
}

function playTimerChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.log('Audio chime not supported');
  }
}

// ==========================================================================
// Add / Edit Recipe Modal & Form Operations
// ==========================================================================

function openAddRecipeModal() {
  elements.formModalTitle.textContent = 'Add New Recipe';
  elements.formRecipeId.value = '';
  elements.recipeForm.reset();

  // Reset custom category
  elements.recipeCustomCategoryInput.style.display = 'none';
  elements.recipeCustomCategoryInput.value = '';

  // Clear builders
  elements.ingredientsListBuilder.innerHTML = '';
  elements.stepsListBuilder.innerHTML = '';
  clearFormErrors();

  // Add 3 default ingredient rows
  addIngredientRow();
  addIngredientRow();
  addIngredientRow();

  // Add 2 default step rows
  addStepRow();
  addStepRow();

  // Reset photo preview
  updatePhotoPreview('');

  elements.formModal.classList.add('show');
  elements.formModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function openEditRecipeModal(recipeId) {
  const recipe = state.recipes.find(r => String(r.id) === String(recipeId));
  if (!recipe) return;

  elements.formModalTitle.textContent = 'Edit Recipe';
  elements.formRecipeId.value = recipe.id;
  clearFormErrors();

  // Basic info
  elements.recipeTitleInput.value = recipe.title || '';
  elements.recipeCuisineInput.value = recipe.cuisine || '';
  elements.recipeDescInput.value = recipe.description || '';
  elements.recipePrepTimeInput.value = recipe.prepTime || 15;
  elements.recipeCookTimeInput.value = recipe.cookTime || 20;
  elements.recipeServingsInput.value = recipe.servings || 4;

  // Category
  const cat = recipe.category || 'Main Course';
  const hasOption = Array.from(elements.recipeCategoryInput.options).some(o => o.value === cat);
  if (hasOption) {
    elements.recipeCategoryInput.value = cat;
    elements.recipeCustomCategoryInput.style.display = 'none';
  } else {
    elements.recipeCategoryInput.value = 'Custom';
    elements.recipeCustomCategoryInput.style.display = 'block';
    elements.recipeCustomCategoryInput.value = cat;
  }

  // Difficulty radio
  const diff = recipe.difficulty || 'Easy';
  const radio = elements.recipeForm.querySelector(`input[name="difficultyRadio"][value="${diff}"]`);
  if (radio) radio.checked = true;

  // Photo
  elements.recipeImageUrlInput.value = recipe.image || '';
  updatePhotoPreview(recipe.image || '');

  // Ingredients builder
  elements.ingredientsListBuilder.innerHTML = '';
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => {
      if (typeof ing === 'string') {
        addIngredientRow(ing, '', '');
      } else {
        addIngredientRow(ing.name || '', ing.amount || '', ing.unit || '');
      }
    });
  } else {
    addIngredientRow();
  }

  // Steps builder
  elements.stepsListBuilder.innerHTML = '';
  if (recipe.instructions && recipe.instructions.length > 0) {
    recipe.instructions.forEach(step => addStepRow(step));
  } else {
    addStepRow();
  }

  // Tips & tags
  elements.recipeTipsInput.value = recipe.tips || '';
  elements.recipeTagsInput.value = (recipe.tags || []).join(', ');

  elements.formModal.classList.add('show');
  elements.formModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeFormModal() {
  elements.formModal.classList.remove('show');
  elements.formModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Dynamic Ingredient Row
function addIngredientRow(name = '', amt = '', unit = '') {
  const row = document.createElement('div');
  row.className = 'builder-row';
  row.innerHTML = `
    <input type="text" class="form-input ing-name" placeholder="Ingredient name (e.g. Chicken breast)" value="${escapeHtml(name)}">
    <input type="text" class="form-input ing-amt" placeholder="Qty (e.g. 2)" value="${escapeHtml(amt)}">
    <input type="text" class="form-input ing-unit" placeholder="Unit (e.g. cups, tbsp)" value="${escapeHtml(unit)}">
    <button type="button" class="row-delete-btn" title="Remove ingredient">&times;</button>
  `;

  row.querySelector('.row-delete-btn').addEventListener('click', () => {
    row.remove();
  });

  elements.ingredientsListBuilder.appendChild(row);
}

// Dynamic Step Row
function addStepRow(text = '') {
  const count = elements.stepsListBuilder.children.length + 1;
  const row = document.createElement('div');
  row.className = 'builder-row';
  row.innerHTML = `
    <span class="step-num-badge" style="font-weight:700; color:var(--primary); min-width:24px;">#${count}</span>
    <input type="text" class="form-input step-desc" placeholder="Describe this cooking step..." value="${escapeHtml(text)}">
    <button type="button" class="row-delete-btn" title="Remove step">&times;</button>
  `;

  row.querySelector('.row-delete-btn').addEventListener('click', () => {
    row.remove();
    renumberSteps();
  });

  elements.stepsListBuilder.appendChild(row);
}

function renumberSteps() {
  const rows = elements.stepsListBuilder.querySelectorAll('.builder-row');
  rows.forEach((r, idx) => {
    const badge = r.querySelector('.step-num-badge');
    if (badge) badge.textContent = `#${idx + 1}`;
  });
}

// Preset photo gallery setup
function renderPresetGallery() {
  elements.presetGallery.innerHTML = '';
  PHOTO_PRESETS.forEach(preset => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.innerHTML = `
      <img src="${preset.url}" alt="${preset.name}" loading="lazy">
      <span>${preset.name}</span>
    `;
    card.addEventListener('click', () => {
      elements.presetGallery.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      elements.recipeImageUrlInput.value = preset.url;
      updatePhotoPreview(preset.url);
      showToast(`Selected "${preset.name}" photo`, 'info');
    });
    elements.presetGallery.appendChild(card);
  });
}

function updatePhotoPreview(url) {
  if (url && url.trim()) {
    elements.imagePreviewImg.src = url.trim();
    elements.imagePreviewImg.style.display = 'block';
    elements.imagePreviewPlaceholder.style.display = 'none';
  } else {
    elements.imagePreviewImg.src = '';
    elements.imagePreviewImg.style.display = 'none';
    elements.imagePreviewPlaceholder.style.display = 'block';
  }
}

// Form Validation and Submission
async function handleRecipeFormSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const title = elements.recipeTitleInput.value.trim();
  const desc = elements.recipeDescInput.value.trim();
  const prepTime = parseInt(elements.recipePrepTimeInput.value, 10);
  const cookTime = parseInt(elements.recipeCookTimeInput.value, 10);
  const servings = parseInt(elements.recipeServingsInput.value, 10);

  let category = elements.recipeCategoryInput.value;
  if (category === 'Custom') {
    category = elements.recipeCustomCategoryInput.value.trim() || 'Custom';
  }

  const cuisine = elements.recipeCuisineInput.value.trim();
  const diffRadio = elements.recipeForm.querySelector('input[name="difficultyRadio"]:checked');
  const difficulty = diffRadio ? diffRadio.value : 'Easy';

  const imageUrl = elements.recipeImageUrlInput.value.trim() || DEFAULT_FOOD_PLACEHOLDER;
  const tips = elements.recipeTipsInput.value.trim();
  const tags = elements.recipeTagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // Collect ingredients
  const ingredients = [];
  const ingRows = elements.ingredientsListBuilder.querySelectorAll('.builder-row');
  ingRows.forEach(row => {
    const name = row.querySelector('.ing-name').value.trim();
    const amt = row.querySelector('.ing-amt').value.trim();
    const unit = row.querySelector('.ing-unit').value.trim();
    if (name) {
      ingredients.push({
        name,
        amount: amt ? (isNaN(parseFloat(amt)) ? amt : parseFloat(amt)) : '',
        unit
      });
    }
  });

  // Collect steps
  const instructions = [];
  const stepRows = elements.stepsListBuilder.querySelectorAll('.builder-row');
  stepRows.forEach(row => {
    const text = row.querySelector('.step-desc').value.trim();
    if (text) {
      instructions.push(text);
    }
  });

  // Validation
  let isValid = true;
  if (!title) {
    document.getElementById('titleError').textContent = 'Please enter a recipe title.';
    isValid = false;
  }
  if (!desc) {
    document.getElementById('descError').textContent = 'Please provide a short description.';
    isValid = false;
  }
  if (ingredients.length === 0) {
    document.getElementById('ingredientsError').textContent = 'Please add at least one ingredient.';
    isValid = false;
  }
  if (instructions.length === 0) {
    document.getElementById('stepsError').textContent = 'Please add at least one cooking step.';
    isValid = false;
  }

  if (!isValid) return;

  const recipePayload = {
    title,
    category,
    cuisine,
    description: desc,
    prepTime: isNaN(prepTime) ? 15 : prepTime,
    cookTime: isNaN(cookTime) ? 20 : cookTime,
    servings: isNaN(servings) ? 4 : servings,
    difficulty,
    image: imageUrl,
    ingredients,
    instructions,
    tips,
    tags
  };

  const editingId = elements.formRecipeId.value;

  try {
    if (editingId) {
      // Update existing
      await window.recipeStore.update(editingId, recipePayload);
      showToast(`Updated "${title}" successfully! 🎉`, 'success');
    } else {
      // Create new
      recipePayload.isFavorite = false;
      await window.recipeStore.create(recipePayload);
      showToast(`Created new recipe "${title}"! 🍳`, 'success');
    }

    closeFormModal();
    await loadRecipes();

    // If detail modal was open for the updated recipe, refresh it
    if (editingId && state.activeDetailRecipe && String(state.activeDetailRecipe.id) === String(editingId)) {
      openRecipeDetail(editingId);
    }
  } catch (err) {
    console.error('Failed to save recipe:', err);
    showToast('Failed to save recipe. Please check console.', 'error');
  }
}

function clearFormErrors() {
  document.getElementById('titleError').textContent = '';
  document.getElementById('descError').textContent = '';
  document.getElementById('ingredientsError').textContent = '';
  document.getElementById('stepsError').textContent = '';
}

// Bulk ingredients parsing
function parseBulkIngredients(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  lines.forEach(line => {
    // Strip bullet points or numbers e.g. "- 2 cups Rice" or "1. 2 cups Rice"
    const cleaned = line.replace(/^[\*\-\•\d\.\)]+\s*/, '').trim();
    if (!cleaned) return;

    // Regex to extract quantity, unit, name
    // e.g. "2 cups Jasmine Rice" or "500g Chicken"
    const match = cleaned.match(/^([\d\.\/\½\¼\¾]+)\s*([a-zA-Z]+)?\s+(.+)$/);
    if (match) {
      addIngredientRow(match[3].trim(), match[1].trim(), (match[2] || '').trim());
    } else {
      addIngredientRow(cleaned, '', '');
    }
  });
}

// Bulk steps parsing
function parseBulkSteps(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  lines.forEach(line => {
    const cleaned = line.replace(/^[\*\-\•\d\.\)]+\s*/, '').trim();
    if (cleaned) {
      addStepRow(cleaned);
    }
  });
}

// ==========================================================================
// Delete Recipe Operations
// ==========================================================================

function openDeleteConfirmModal(recipeId) {
  const recipe = state.recipes.find(r => String(r.id) === String(recipeId));
  if (!recipe) return;

  state.recipeToDeleteId = recipeId;
  elements.deleteRecipeTitle.textContent = `"${recipe.title}"`;
  elements.deleteModal.classList.add('show');
  elements.deleteModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  elements.deleteModal.classList.remove('show');
  elements.deleteModal.setAttribute('aria-hidden', 'true');
  state.recipeToDeleteId = null;
}

async function handleConfirmDelete() {
  if (!state.recipeToDeleteId) return;
  const id = state.recipeToDeleteId;

  try {
    await window.recipeStore.delete(id);
    closeDeleteModal();
    showToast('Recipe deleted successfully', 'info');
    await loadRecipes();
  } catch (err) {
    console.error('Failed to delete recipe:', err);
    showToast('Failed to delete recipe', 'error');
  }
}

// ==========================================================================
// Backup, Import, and Reset
// ==========================================================================

function exportRecipesJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.recipes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `flavorcraft_recipes_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Recipes exported to JSON download 📥', 'success');
}

function handleImportFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) {
        throw new Error('Imported JSON must contain an array of recipes');
      }
      await window.recipeStore.importAll(parsed);
      await loadRecipes();
      showToast(`Imported ${parsed.length} recipes successfully! 📤`, 'success');
    } catch (err) {
      console.error('Failed to import JSON:', err);
      showToast('Invalid recipe JSON file format', 'error');
    }
  };
  reader.readAsText(file);
}

async function resetDefaultRecipes() {
  const confirmReset = window.confirm('Reset all recipes to default initial dishes? Custom recipes will be replaced with defaults.');
  if (!confirmReset) return;

  try {
    await window.recipeStore.resetToDefaults();
    await loadRecipes();
    showToast('Reset recipes to defaults 🔄', 'info');
  } catch (err) {
    showToast('Failed to reset recipes', 'error');
  }
}

// ==========================================================================
// Toast Notifications
// ==========================================================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Security Helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

function setupEventListeners() {
  // Brand click resets filters
  elements.brandLogo.addEventListener('click', () => {
    resetAllFilters();
  });

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    applyFilters();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    applyFilters();
  });

  // Category Pills
  elements.categoryPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    elements.categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.activeCategory = pill.dataset.category;
    applyFilters();
  });

  // Difficulty Filter
  elements.difficultyFilter.addEventListener('change', (e) => {
    state.activeDifficulty = e.target.value;
    applyFilters();
  });

  // Time Filter
  elements.timeFilter.addEventListener('change', (e) => {
    state.activeTime = e.target.value;
    applyFilters();
  });

  // Sort Filter
  elements.sortFilter.addEventListener('change', (e) => {
    state.activeSort = e.target.value;
    applyFilters();
  });

  // Favorites Filter Button
  elements.favoritesFilterBtn.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    if (state.favoritesOnly) {
      elements.favoritesFilterBtn.classList.remove('btn-secondary');
      elements.favoritesFilterBtn.classList.add('btn-primary');
    } else {
      elements.favoritesFilterBtn.classList.remove('btn-primary');
      elements.favoritesFilterBtn.classList.add('btn-secondary');
    }
    applyFilters();
  });

  // Reset Filters links
  elements.clearAllFiltersBtn.addEventListener('click', resetAllFilters);
  elements.resetFiltersLink.addEventListener('click', resetAllFilters);

  // Add Recipe Buttons
  elements.addRecipeBtn.addEventListener('click', openAddRecipeModal);
  elements.emptyAddBtn.addEventListener('click', openAddRecipeModal);

  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // More Actions Menu Toggle
  elements.moreActionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.moreActionsMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    elements.moreActionsMenu.classList.remove('show');
  });

  // Export / Import / Reset Defaults
  elements.exportDataBtn.addEventListener('click', exportRecipesJson);
  elements.importFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImportFile(e.target.files[0]);
    }
  });
  elements.resetDefaultsBtn.addEventListener('click', resetDefaultRecipes);

  // Detail Modal Close
  elements.closeDetailModalBtn.addEventListener('click', closeRecipeDetail);
  elements.recipeModal.addEventListener('click', (e) => {
    if (e.target === elements.recipeModal) {
      closeRecipeDetail();
    }
  });

  // Form Modal Close
  elements.closeFormModalBtn.addEventListener('click', closeFormModal);
  elements.cancelFormBtn.addEventListener('click', closeFormModal);
  elements.formModal.addEventListener('click', (e) => {
    if (e.target === elements.formModal) {
      closeFormModal();
    }
  });

  // Form Category Change (custom option toggle)
  elements.recipeCategoryInput.addEventListener('change', (e) => {
    if (e.target.value === 'Custom') {
      elements.recipeCustomCategoryInput.style.display = 'block';
      elements.recipeCustomCategoryInput.focus();
    } else {
      elements.recipeCustomCategoryInput.style.display = 'none';
    }
  });

  // Image source tabs
  const tabBtns = elements.formModal.querySelectorAll('.image-source-tabs .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      elements.formModal.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Image URL input live preview
  elements.recipeImageUrlInput.addEventListener('input', (e) => {
    updatePhotoPreview(e.target.value);
  });

  // File Upload via Dropzone
  elements.uploadDropzone.addEventListener('click', () => {
    elements.recipeImageFileInput.click();
  });

  elements.recipeImageFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFileUpload(e.target.files[0]);
    }
  });

  elements.uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadDropzone.classList.add('drag-over');
  });

  elements.uploadDropzone.addEventListener('dragleave', () => {
    elements.uploadDropzone.classList.remove('drag-over');
  });

  elements.uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadDropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileUpload(e.dataTransfer.files[0]);
    }
  });

  function handleImageFileUpload(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WebP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Url = ev.target.result;
      elements.recipeImageUrlInput.value = base64Url;
      updatePhotoPreview(base64Url);
      showToast('Image uploaded successfully! 📸', 'success');
    };
    reader.readAsDataURL(file);
  }

  // Builder buttons
  elements.addIngredientRowBtn.addEventListener('click', () => addIngredientRow());
  elements.addStepRowBtn.addEventListener('click', () => addStepRow());

  // Bulk Ingredients
  elements.bulkIngredientsToggle.addEventListener('click', () => {
    const isHidden = elements.bulkIngredientsPane.style.display === 'none';
    elements.bulkIngredientsPane.style.display = isHidden ? 'block' : 'none';
  });

  elements.applyBulkIngredientsBtn.addEventListener('click', () => {
    const text = elements.bulkIngredientsText.value;
    if (text.trim()) {
      parseBulkIngredients(text);
      elements.bulkIngredientsText.value = '';
      elements.bulkIngredientsPane.style.display = 'none';
      showToast('Parsed and added bulk ingredients', 'info');
    }
  });

  // Bulk Steps
  elements.bulkStepsToggle.addEventListener('click', () => {
    const isHidden = elements.bulkStepsPane.style.display === 'none';
    elements.bulkStepsPane.style.display = isHidden ? 'block' : 'none';
  });

  elements.applyBulkStepsBtn.addEventListener('click', () => {
    const text = elements.bulkStepsText.value;
    if (text.trim()) {
      parseBulkSteps(text);
      elements.bulkStepsText.value = '';
      elements.bulkStepsPane.style.display = 'none';
      showToast('Parsed and added bulk steps', 'info');
    }
  });

  // Recipe Form Submit
  elements.recipeForm.addEventListener('submit', handleRecipeFormSubmit);

  // Delete Modal Buttons
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) {
      closeDeleteModal();
    }
  });

  // Global ESC key to close open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.deleteModal.classList.contains('show')) {
        closeDeleteModal();
      } else if (elements.formModal.classList.contains('show')) {
        closeFormModal();
      } else if (elements.recipeModal.classList.contains('show')) {
        closeRecipeDetail();
      }
    }
  });
}

