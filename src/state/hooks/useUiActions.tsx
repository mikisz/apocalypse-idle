import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { GameState } from '../useGame.tsx';

export interface UiActions {
  setActiveTab: (tab: string) => void;
  toggleDrawer: () => void;
  dismissOfflineModal: () => void;
}

export default function useUiActions(
  setState: Dispatch<SetStateAction<GameState>>,
): UiActions {
  const setActiveTab = useCallback(
    (tab: string) => {
      setState((prev: GameState) => ({
        ...prev,
        ui: { ...prev.ui, activeTab: tab },
      }));
    },
    [setState],
  );

  const toggleDrawer = useCallback(() => {
    setState((prev: GameState) => ({
      ...prev,
      ui: { ...prev.ui, drawerOpen: !prev.ui.drawerOpen },
    }));
  }, [setState]);

  const dismissOfflineModal = useCallback(() => {
    setState((prev: GameState) => ({
      ...prev,
      ui: { ...prev.ui, offlineProgress: null },
    }));
  }, [setState]);

  return { setActiveTab, toggleDrawer, dismissOfflineModal };
}
