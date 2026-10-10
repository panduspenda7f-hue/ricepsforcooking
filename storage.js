/**
 * Storage Abstraction Layer
 * Supports both REST API backend (when server.py is running)
 * and localStorage fallback (when opened directly as file:// or offline).
 */

const STORAGE_KEY = 'pa_recipes_store';

class RecipeStore {
  constructor() {
    this.useApi = false;
    this.apiBase = window.location.origin;
  }

  async init() {
    // Check if current page is served via HTTP/HTTPS and has healthy API
    if (window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ok') {
            this.useApi = true;
          }
        }
      } catch (e) {
        console.warn('API healthcheck failed, falling back to localStorage:', e);
        this.useApi = false;
      }
    } else {
      this.useApi = false;
    }

    // Initialize local storage if empty
    if (!this.useApi) {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        const seed = (typeof INITIAL_RECIPES !== 'undefined') ? INITIAL_RECIPES : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    }

    return this.useApi;
  }

  async getAll() {
    if (this.useApi) {
      try {
        const res = await fetch('/api/recipes');
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Error fetching from API, falling back to localStorage:', e);
      }
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
    }
    return (typeof INITIAL_RECIPES !== 'undefined') ? [...INITIAL_RECIPES] : [];
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(r => String(r.id) === String(id)) || null;
  }

  async create(recipe) {
    if (!recipe.id) {
      recipe.id = 'recipe-' + Date.now();
    }
    if (!recipe.createdAt) {
      recipe.createdAt = new Date().toISOString();
    }

    if (this.useApi) {
      try {
        const res = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe)
        });
        if (res.ok) {
          const data = await res.json();
          // Also sync to local storage as backup
          this._syncLocalAdd(data.recipe || recipe);
          return data.recipe || recipe;
        }
      } catch (e) {
        console.warn('API create failed, saving to localStorage:', e);
      }
    }

    this._syncLocalAdd(recipe);
    return recipe;
  }

  async update(id, updatedFields) {
    if (this.useApi) {
      try {
        const res = await fetch(`/api/recipes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        });
        if (res.ok) {
          const data = await res.json();
          this._syncLocalUpdate(id, data.recipe || updatedFields);
          return data.recipe || updatedFields;
        }
      } catch (e) {
        console.warn('API update failed, updating localStorage:', e);
      }
    }

    return this._syncLocalUpdate(id, updatedFields);
  }

  async delete(id) {
    if (this.useApi) {
      try {
        const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
        if (res.ok) {
          this._syncLocalDelete(id);
          return true;
        }
      } catch (e) {
        console.warn('API delete failed, removing from localStorage:', e);
      }
    }

    return this._syncLocalDelete(id);
  }

  async resetToDefaults() {
    const seed = (typeof INITIAL_RECIPES !== 'undefined') ? [...INITIAL_RECIPES] : [];
    if (this.useApi) {
      try {
        await fetch('/api/recipes/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seed)
        });
      } catch (e) {
        console.warn('API reset failed:', e);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  async importAll(recipesList) {
    if (!Array.isArray(recipesList)) {
      throw new Error('Import data must be an array of recipes');
    }
    if (this.useApi) {
      try {
        await fetch('/api/recipes/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipesList)
        });
      } catch (e) {
        console.warn('API import failed:', e);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipesList));
    return recipesList;
  }

  // --- Local helpers ---
  _syncLocalAdd(recipe) {
    const list = this._getLocalList();
    list.unshift(recipe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  _syncLocalUpdate(id, updated) {
    const list = this._getLocalList();
    const index = list.findIndex(r => String(r.id) === String(id));
    if (index !== -1) {
      list[index] = { ...list[index], ...updated, id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list[index];
    }
    return null;
  }

  _syncLocalDelete(id) {
    let list = this._getLocalList();
    list = list.filter(r => String(r.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }

  _getLocalList() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return (typeof INITIAL_RECIPES !== 'undefined') ? [...INITIAL_RECIPES] : [];
  }
}

// Global instance
window.recipeStore = new RecipeStore();

