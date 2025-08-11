const STORAGE_KEY = 'apocalypse-idle-save'
export const SCHEMA_VERSION = 1

export function saveGame(state) {
  try {
    const data = { ...state, schemaVersion: SCHEMA_VERSION, lastSaved: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  } catch (err) {
    console.error('Save failed', err)
    return state
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.schemaVersion === SCHEMA_VERSION ? parsed : null
  } catch (err) {
    console.error('Load failed', err)
    return null
  }
}

export function deleteSave() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Delete failed', err)
  }
}

