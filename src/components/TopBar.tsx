import { useState } from 'react';
import type { JSX } from 'react';
import { getSeasonModifiers, getTimeBreakdown } from '../engine/time.js';
import { useGame } from '../state/useGame.ts';
import { Button } from './Button';

export default function TopBar(): JSX.Element {
  const { state, toggleDrawer } = useGame();
  const time = getTimeBreakdown(state);
  const modifiers: Record<string, number> = getSeasonModifiers(state);
  const [open, setOpen] = useState<boolean>(false);
  const labels: Record<string, string> = { FOOD: 'Food', RAW: 'Raw' };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-border bg-card">
      <span className="tabular-nums text-xl">Year {time.year}</span>
      <h1 className="font-semibold">Apocalypse Idle</h1>
      <div className="relative flex items-center gap-2">
        <Button
          variant="ghost"
          className="text-xl tabular-nums px-0"
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {time.season.icon} {time.season.label}, Day {time.day}
        </Button>
        {open && (
          <div
            className="absolute top-full right-0 mt-1 p-2 bg-card border border-border rounded text-xs shadow-lg"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {Object.entries(modifiers).map(([key, val]) => (
              <div key={key} className="whitespace-nowrap">
                {labels[key] || key} x{val.toFixed(2)}
              </div>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="text-xl px-2"
          onClick={toggleDrawer}
        >
          ☰
        </Button>
      </div>
    </header>
  );
}
