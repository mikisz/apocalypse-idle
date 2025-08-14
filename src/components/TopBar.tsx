import type { JSX } from 'react';
import { getTimeBreakdown } from '../engine/time.ts';
import { useGame } from '../state/useGame.tsx';
import { Button } from './Button';

export default function TopBar(): JSX.Element {
  const { state, toggleDrawer } = useGame();
  const time = getTimeBreakdown(state);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-border bg-card">
      <span className="tabular-nums text-xl">Year {time.year}</span>
      <div className="flex items-center gap-2">
        <span className="text-xl tabular-nums">
          {time.season.icon} {time.season.label}, Day {time.day}
        </span>
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
