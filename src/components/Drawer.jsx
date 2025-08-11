import { useGame } from '../state/useGame.js'
import { saveGame, loadGame } from '../engine/persistence.js'

export default function Drawer() {
  const { state, toggleDrawer, setState } = useGame()

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
                onClick={() => saveGame(state)}
              >
                Save
              </button>
              <button
                className="px-2 py-1 rounded border border-stroke"
                onClick={() => {
                  const loaded = loadGame()
                  if (loaded) setState(loaded)
                }}
              >
                Load
              </button>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}

