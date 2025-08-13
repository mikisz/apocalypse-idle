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
import { useGame } from './state/useGame.tsx';
import { ToastProvider, Toaster } from './components/ui/toast.tsx';

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
    <ToastProvider>
      <GameProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <TopBar />
          <div className="flex-1">
            <ActiveView />
          </div>
          <BottomDock />
          <Drawer />
          <OfflineProgressModal />
          <CorruptSaveModal />
          <Toaster />
        </div>
      </GameProvider>
    </ToastProvider>
  );
}
