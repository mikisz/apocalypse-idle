import { GameProvider } from './state/GameContext.jsx';
import TopBar from './components/TopBar.tsx';
import BottomDock from './components/BottomDock.jsx';
import Drawer from './components/Drawer.jsx';
import OfflineProgressModal from './components/OfflineProgressModal.jsx';
import CorruptSaveModal from './components/CorruptSaveModal.jsx';
import BaseView from './views/BaseView.jsx';
import PopulationView from './views/PopulationView.jsx';
import ResearchView from './views/ResearchView.jsx';
import ExpeditionsView from './views/ExpeditionsView.jsx';
import { useGame } from './state/useGame.ts';

function ActiveView() {
  const { state } = useGame();
  switch (state.ui.activeTab) {
    case 'population':
      return <PopulationView />;
    case 'research':
      return <ResearchView />;
    case 'expeditions':
      return <ExpeditionsView />;
    default:
      return <BaseView />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className="h-screen flex flex-col bg-background text-foreground">
        <TopBar />
        <div className="flex-1 overflow-hidden">
          <ActiveView />
        </div>
        <BottomDock />
        <Drawer />
        <OfflineProgressModal />
        <CorruptSaveModal />
      </div>
    </GameProvider>
  );
}
