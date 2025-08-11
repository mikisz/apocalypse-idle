import { useRef } from 'react'
import { useGame } from '../state/useGame.js'
import { exportSaveFile, load } from '../engine/persistence.js'

export default function Drawer() {
    const { state, toggleDrawer, setState, resetGame } = useGame()
    const fileInput = useRef(null)

    const handleFile = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result
          const { state: loaded, migratedFrom } = load(text)
          const note = migratedFrom
            ? `Save loaded (migrated from v${migratedFrom})`
            : 'Save loaded'
          const log = [note, ...(loaded.log || [])].slice(0, 100)
          setState({ ...loaded, log })
        } catch (err) {
          console.error(err)
          setState((prev) => ({
            ...prev,
            log: [`Failed to load save: ${err.message}`, ...prev.log].slice(0, 100),
          }))
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 ${state.ui.drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleDrawer}
      />
      <aside
        className={`fixed top-0 bottom-0 right-0 w-64 bg-bg2 border-l border-stroke z-50 transform transition-transform ${state.ui.drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 space-y-6">
          <section>
            <h2 className="font-semibold mb-2">📊 Statistics</h2>
            <p className="text-sm text-muted">Coming soon</p>
          </section>
          <section>
            <h2 className="font-semibold mb-2">⚙️ Settings</h2>
            <p className="text-sm text-muted">Coming soon</p>
          </section>
          <section>
            <h2 className="font-semibold mb-2">💾 Save/Load</h2>
            <div className="flex gap-2">
                <button
                  className="px-2 py-1 rounded border border-stroke"
                  onClick={() => {
                    exportSaveFile(state)
                    setState((prev) => ({
                      ...prev,
                      log: ['Save exported', ...prev.log].slice(0, 100),
                    }))
                  }}
                >
                  Save
                </button>
                <button
                  className="px-2 py-1 rounded border border-stroke"
                  onClick={() => fileInput.current?.click()}
                >
                  Load
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </section>
          <section>
            <h2 className="font-semibold mb-2">🧹 Reset</h2>
            <button
              className="px-2 py-1 rounded border border-stroke"
              onClick={resetGame}
            >
              Reset colony
            </button>
          </section>
        </div>
      </aside>
    </>
  )
}

