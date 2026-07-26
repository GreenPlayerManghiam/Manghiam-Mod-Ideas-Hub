/**
 * AppPersistence.js — localStorage helpers for Manghiam Mod Hub
 * ─────────────────────────────────────────────────────────────
 *
 * PROBLEM: Mods uploaded by users live in React state and vanish on refresh.
 * SOLUTION: Use these helpers in App.jsx to persist everything to localStorage.
 *
 * HOW TO INTEGRATE IN App.jsx:
 * ─────────────────────────────────────────────────────────────
 * import {
 *   loadPersistedMods,
 *   saveModToStorage,
 *   deleteModFromStorage,
 *   applyFeaturedOverrides,
 * } from './components/AppPersistence'
 *
 * // 1. Initialize mods state — merge static seed data with persisted uploads:
 * const [mods, setMods] = useState(() => {
 *   const persisted = loadPersistedMods()
 *   const merged = [...seedMods, ...persisted]
 *   return applyFeaturedOverrides(merged)
 * })
 *
 * // 2. When user uploads a mod:
 * const handleAddMod = (newMod) => {
 *   saveModToStorage(newMod)
 *   setMods(prev => applyFeaturedOverrides([newMod, ...prev]))
 * }
 *
 * // 3. When founder toggles featured:
 * const handleToggleFeature = (modId) => {
 *   setMods(prev => applyFeaturedOverrides(prev))
 * }
 *
 * // 4. When user deletes their mod:
 * const handleDeleteMod = (modId) => {
 *   deleteModFromStorage(modId)
 *   setMods(prev => prev.filter(m => m.id !== modId))
 * }
 *
 * // 5. Pass handleToggleFeature to ModCard, ModDetail, ModPage:
 * <ModCard mod={mod} onSelect={...} onToggleFeature={handleToggleFeature} currentUser={currentUser} />
 * ─────────────────────────────────────────────────────────────
 */

const KEYS = {
  UPLOADED_MODS: 'modhub_uploaded_mods',
  FEATURED_OVERRIDES: 'modhub_featured_overrides',
}

/** Load all user-uploaded mods from localStorage */
export function loadPersistedMods() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.UPLOADED_MODS) || '[]')
  } catch {
    return []
  }
}

/** Save a single newly uploaded mod to localStorage */
export function saveModToStorage(mod) {
  try {
    const existing = loadPersistedMods()
    // Avoid duplicates
    const filtered = existing.filter((m) => m.id !== mod.id)
    const updated = [{ ...mod, uploaded: true }, ...filtered]
    localStorage.setItem(KEYS.UPLOADED_MODS, JSON.stringify(updated))
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert(
        '⚠️ Storage is full!\n\nYour browser\'s local storage is nearly full. ' +
        'Try deleting some of your older uploaded mods to free up space. ' +
        'Note: images take the most space.'
      )
    }
  }
}

/** Delete a mod from localStorage by ID */
export function deleteModFromStorage(modId) {
  try {
    const existing = loadPersistedMods()
    localStorage.setItem(KEYS.UPLOADED_MODS, JSON.stringify(existing.filter((m) => m.id !== modId)))
  } catch {
    // ignore
  }
}

/**
 * Apply Founder's featured overrides to a mods array.
 * The Founder can feature or un-feature any mod via ModCard/ModDetail/ModPage.
 * Overrides are stored in localStorage as { [modId]: true | false }.
 */
export function applyFeaturedOverrides(mods) {
  try {
    const overrides = JSON.parse(localStorage.getItem(KEYS.FEATURED_OVERRIDES) || '{}')
    return mods.map((mod) => {
      if (Object.prototype.hasOwnProperty.call(overrides, mod.id)) {
        return { ...mod, featured: overrides[mod.id] }
      }
      return mod
    })
  } catch {
    return mods
  }
}

/**
 * Toggle a mod's featured status (Founder only).
 * Returns the new featured state (true/false).
 */
export function toggleFeaturedInStorage(modId, currentFeatured) {
  try {
    const overrides = JSON.parse(localStorage.getItem(KEYS.FEATURED_OVERRIDES) || '{}')
    overrides[modId] = !currentFeatured
    localStorage.setItem(KEYS.FEATURED_OVERRIDES, JSON.stringify(overrides))
    return !currentFeatured
  } catch {
    return currentFeatured
  }
}

/** Check current localStorage usage (approximate, in MB) */
export function getStorageUsageMB() {
  try {
    let total = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage.getItem(key).length * 2 // UTF-16 = 2 bytes per char
      }
    }
    return (total / (1024 * 1024)).toFixed(2)
  } catch {
    return '?'
  }
}
