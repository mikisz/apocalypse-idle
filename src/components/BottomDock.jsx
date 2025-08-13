import React from 'react';
import { useGame } from '../state/useGame.tsx';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const tabs = [
  { id: 'base', icon: '🏠', label: 'Base' },
  { id: 'population', icon: '👥', label: 'Population' },
  { id: 'research', icon: '🧠', label: 'Research' },
  { id: 'expeditions', icon: '🗺', label: 'Expeditions' },
];

export default function BottomDock() {
  const { state, setActiveTab } = useGame();

  return (
    <Tabs
      value={state.ui.activeTab}
      onValueChange={setActiveTab}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card shadow-lg"
    >
      <TabsList className="w-full grid grid-cols-4 rounded-none border-t bg-card p-3 h-16">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="flex flex-col py-4 text-xl"
          >
            <span aria-hidden="true">{t.icon}</span>
            <span className="sr-only">{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
