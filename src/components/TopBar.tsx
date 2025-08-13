import type { JSX } from 'react';
import { getSeasonModifiers, getTimeBreakdown } from '../engine/time.js';
import { useGame } from '../state/useGame.tsx';
import { Button } from './Button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export default function TopBar(): JSX.Element {
  const { state, toggleDrawer } = useGame();
  const time = getTimeBreakdown(state);
  const modifiers: Record<string, number> = getSeasonModifiers(state);
  const labels: Record<string, string> = { FOOD: 'Food', RAW: 'Raw' };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-border bg-card">
      <span className="tabular-nums text-xl">Year {time.year}</span>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="text-xl tabular-nums px-0">
              {time.season.icon} {time.season.label}, Day {time.day}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {Object.entries(modifiers).map(([key, val]) => (
              <div key={key} className="whitespace-nowrap">
                {labels[key] || key} x{val.toFixed(2)}
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
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
