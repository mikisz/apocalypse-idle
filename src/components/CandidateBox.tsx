import type { JSX } from 'react';
import { useGame, type GameState } from '../state/useGame.tsx';
import { SKILL_LABELS } from '../data/roles.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import {
  candidateToSettler,
  type Candidate,
  type Settler,
} from '../engine/candidates.ts';
import { formatAge } from '../utils/format.js';
import { DAYS_PER_YEAR } from '../engine/time.ts';
import { XP_TIME_TO_NEXT_LEVEL_SECONDS } from '../data/balance.js';
import Accordion from './Accordion.jsx';
import { Button } from './ui/button';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/card';

interface Skill {
  level: number;
  xp?: number;
}
export default function CandidateBox(): JSX.Element | null {
  const { state, setState } = useGame();
  if (!state.population?.candidate) return null;
  const candidate: Candidate = state.population.candidate;

  const updateAfterDecision = (accepted: boolean): void => {
    setState((prev: GameState) => {
      const baseSettler: Settler = candidateToSettler(candidate);
      const newSettler: GameState['population']['settlers'][number] = {
        ...baseSettler,
        role: null,
        happiness: prev.colony.happiness.value,
        happinessBreakdown: prev.colony.happiness.breakdown,
      };
      const settlers = accepted
        ? [...prev.population.settlers, newSettler]
        : prev.population.settlers;
      return {
        ...prev,
        population: { ...prev.population, settlers, candidate: null },
        colony: { ...prev.colony, radioTimer: RADIO_BASE_SECONDS },
      };
    });
  };

  const accept = (): void => updateAfterDecision(true);
  const reject = (): void => updateAfterDecision(false);

  const skills: Record<string, Skill> = candidate.skills;
  const sortedSkills = Object.entries(skills)
    .filter(([, s]) => s.level > 0)
    .sort((a, b) => b[1].level - a[1].level);

  const { years, days } = formatAge(candidate.age * DAYS_PER_YEAR);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {candidate.firstName} {candidate.lastName}
            <span className="px-1 border rounded text-xs">{candidate.sex}</span>
          </CardTitle>
          <CardDescription>
            {years}y, {days}d
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Accordion
          title="Skills"
          contentClassName="p-2 space-y-2"
          action={undefined}
          noBottomBorder={undefined}
        >
          <ul className="space-y-2">
            {sortedSkills.length > 0 ? (
              sortedSkills.map(([id, s]) => {
                const threshold = XP_TIME_TO_NEXT_LEVEL_SECONDS(s.level);
                const prog =
                  threshold > 0 ? Math.min((s.xp || 0) / threshold, 1) : 0;
                const pct = prog * 100;
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-1">
                      {SKILL_LABELS[id] || id}
                      <span className="px-1 bg-muted rounded text-xs">
                        [{s.level}]
                      </span>
                    </span>
                    <div className="flex items-center gap-1 w-32">
                      <span className="text-xs">{s.level}</span>
                      <div
                        className="flex-1 h-2 bg-border rounded"
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full bg-green-600 rounded"
                          style={{ width: `${pct}%` }}
                        />
                        <span className="sr-only">
                          {Math.round(pct)}% to next level
                        </span>
                      </div>
                      <span className="text-xs">{s.level + 1}</span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="text-xs text-muted-foreground">
                No notable skills
              </li>
            )}
          </ul>
        </Accordion>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button variant="outline" size="sm" onClick={reject}>
          Reject
        </Button>
        <Button variant="secondary" size="sm" onClick={accept}>
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
}
