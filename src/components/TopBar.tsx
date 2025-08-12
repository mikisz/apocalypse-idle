import { useState } from 'react';
import type { JSX } from 'react';
import { getSeasonModifiers, getTimeBreakdown } from '../engine/time.js';
import { useGame } from '../state/useGame.ts';

export default function TopBar(): JSX.Element {
  const { state, toggleDrawer } = useGame();
  const time = getTimeBreakdown(state);
  const modifiers: Record<string, number> = getSeasonModifiers(state);
  const [open, setOpen] = useState<boolean>(false);
  const labels: Record<string, string> = { FOOD: 'Food', RAW: 'Raw' };
  const settlers = state.population?.settlers || [];
  const avgHappiness =
    settlers.length > 0
      ? Math.round(
          settlers.reduce((sum, s) => sum + (s.happiness || 0), 0) /
            settlers.length,
        )
      : 0;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-stroke bg-bg2">
      <span className="tabular-nums text-xl">Year {time.year}</span>
      <h1 className="font-semibold">Apocalypse Idle</h1>
      <div className="relative flex items-center gap-2">
        <span className="tabular-nums text-sm">
          Avg Happiness: {avgHappiness}%
        </span>
        <button
          className="text-xl tabular-nums"
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {time.season.icon} {time.season.label}, Day {time.day}
        </button>
        {open && (
          <div
            className="absolute top-full right-0 mt-1 p-2 bg-bg2 border border-stroke rounded text-xs shadow-lg"
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
        <button
          className="text-xl px-2 py-1 rounded border border-stroke"
          onClick={toggleDrawer}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
