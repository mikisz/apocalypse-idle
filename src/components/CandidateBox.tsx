import type { JSX } from 'react';
import { useGame } from '../state/useGame.ts';
import { SKILL_LABELS } from '../data/roles.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { candidateToSettler } from '../engine/candidates.js';
import { Button } from './Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from './ui/card';

interface Skill {
  level: number;
}

interface Candidate {
  firstName: string;
  lastName: string;
  sex: 'M' | 'F';
  age: number;
  skills?: Record<string, Skill>;
}

export default function CandidateBox(): JSX.Element | null {
  const { state, setState } = useGame();
  const candidate = state.population?.candidate as Candidate | null;
  if (!candidate) return null;

  const updateAfterDecision = (accepted: boolean): void => {
    setState((prev) => {
      const newSettler = candidateToSettler(
        candidate,
      ) as (typeof prev.population.settlers)[number];
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

  const accept = (): void => {
    updateAfterDecision(true);
  };

  const reject = (): void => {
    updateAfterDecision(false);
  };

  const skills = Object.entries(candidate.skills || {})
    .filter(([, s]) => s.level > 0)
    .map(([id, s]) => `${SKILL_LABELS[id] || id} ${s.level}`)
    .join(', ');

  return (
    <Card>
      <CardHeader>
        <CardTitle>A new settler has arrived!</CardTitle>
        <CardDescription>
          {candidate.firstName} {candidate.lastName} •{' '}
          {candidate.sex === 'M' ? 'Male' : 'Female'} • Age {candidate.age}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-muted">{skills || 'No skills'}</div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={accept}>
            Accept
          </Button>
          <Button variant="outline" size="sm" onClick={reject}>
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
