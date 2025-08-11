import { GameProvider } from './state/GameContext.jsx'
import HUD from './components/HUD.jsx'
import Actions from './components/Actions.jsx'
import Log from './components/Log.jsx'

function Card({ title, children }) {
  return (
    <section className="bg-panel border border-stroke rounded-xl2 shadow-card p-3">
      {title && <h2 className="text-sm font-semibold text-muted mb-2">{title}</h2>}
      {children}
    </section>
  )
}

export default function App() {
  return (
    <GameProvider>
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:grid grid-rows-[auto_1fr] bg-bg2 border-r border-stroke sticky top-0 h-screen p-4">
          <div className="w-10 h-10 grid place-items-center bg-panel border border-stroke rounded-xl text-lg mb-3">☢︎</div>
          <nav className="grid gap-1">
            <a className="px-3 py-2 rounded-lg border border-transparent hover:bg-[#12192a] hover:border-stroke cursor-pointer transition">Mapa</a>
            <a className="px-3 py-2 rounded-lg border border-transparent hover:bg-[#12192a] hover:border-stroke cursor-pointer transition">Baza</a>
            <a className="px-3 py-2 rounded-lg border border-transparent hover:bg-[#12192a] hover:border-stroke cursor-pointer transition">Ocalali</a>
            <a className="px-3 py-2 rounded-lg border border-transparent hover:bg-[#12192a] hover:border-stroke cursor-pointer transition">Technologie</a>
            <a className="px-3 py-2 rounded-lg border border-transparent hover:bg-[#12192a] hover:border-stroke cursor-pointer transition">Zapis</a>
          </nav>
        </aside>

        {/* Shell */}
        <div className="grid grid-rows-[auto_1fr] min-h-screen">
          {/* Topbar */}
          <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b border-stroke bg-gradient-to-b from-[rgba(16,21,34,.95)] to-[rgba(16,21,34,.6)] backdrop-blur">
            <div className="flex items-center gap-3">
              <button className="md:hidden rounded-lg px-2 py-1 border border-stroke text-xl">☰</button>
              <h1 className="text-base font-semibold tracking-wide">Apocalypse Idle</h1>
            </div>
            <span className="text-xs text-muted border border-stroke px-2 py-1 rounded-full">Wczesny prototyp</span>
          </header>

          {/* Content */}
          <main className="p-3 md:p-4 grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-[1.2fr_1fr_.8fr] items-start">
            <Card title="Zasoby">
              <HUD />
            </Card>
            <Card title="Akcje & Budynki">
              <Actions />
            </Card>
            <Card title="Dziennik">
              <Log />
            </Card>
          </main>
        </div>

        {/* Mobile Dock */}
        <nav className="md:hidden sticky bottom-0 left-0 right-0 flex gap-2 p-2 border-t border-stroke bg-gradient-to-t from-[rgba(16,21,34,.95)] to-[rgba(16,21,34,.7)] backdrop-blur">
          <button className="flex-1 py-2 rounded-xl border border-stroke bg-[#12192a] text-lg">🏠</button>
          <button className="flex-1 py-2 rounded-xl border border-stroke bg-[#12192a] text-lg">👥</button>
          <button className="flex-1 py-2 rounded-xl border border-stroke bg-[#12192a] text-lg">🧠</button>
          <button className="flex-1 py-2 rounded-xl border border-stroke bg-[#12192a] text-lg">⚙️</button>
        </nav>
      </div>
    </GameProvider>
  )
}
