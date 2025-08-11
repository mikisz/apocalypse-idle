const STORAGE_KEY = 'apocalypse-idle-save'

export function saveGame(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Save failed', err)
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Load failed', err)
    return null
  }
}

