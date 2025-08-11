import React from 'react';
import { useGame } from '../state/useGame.js';

const tabs = [
  { id: 'base', icon: '🏠', label: 'Base' },
  { id: 'population', icon: '👥', label: 'Population' },
  { id: 'research', icon: '🧠', label: 'Research' },
  { id: 'expeditions', icon: '🗺', label: 'Expeditions' },
];

export default function BottomDock() {
  const { state, setActiveTab } = useGame();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-stroke bg-bg2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          aria-label={t.label}
          aria-current={state.ui.activeTab === t.id ? 'page' : undefined}
          className={`flex-1 py-2 text-xl ${
            state.ui.activeTab === t.id
              ? 'text-ink bg-panel font-semibold'
              : 'text-muted'
          }`}
        >
          {t.icon}
          <span className="sr-only">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
