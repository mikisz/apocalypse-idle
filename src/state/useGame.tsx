import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { defaultState } from './defaultState.js';

export type GameState = typeof defaultState;

export interface GameContextValue {
  state: GameState;
  setActiveTab: (tab: string) => void;
  toggleDrawer: () => void;
  setSettlerRole: (id: string, role: string | null) => void;
  beginResearch: (id: string) => void;
  abortResearch: () => void;
  setState: Dispatch<SetStateAction<GameState>>;
  dismissOfflineModal: () => void;
  resetGame: () => void;
  loadError: boolean;
  retryLoad: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
