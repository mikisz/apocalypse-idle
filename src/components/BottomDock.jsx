import { useGame } from '../state/useGame.js'

const tabs = [
  { id: 'base', icon: '🏠' },
  { id: 'population', icon: '👥' },
  { id: 'research', icon: '🧠' },
  { id: 'expeditions', icon: '🗺' },
]

export default function BottomDock() {
  const { state, setActiveTab } = useGame()

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-stroke bg-bg2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`flex-1 py-2 text-xl ${
            state.ui.activeTab === t.id ? 'text-ink' : 'text-muted'
          }`}
        >
          {t.icon}
        </button>
      ))}
    </nav>
  )
}

