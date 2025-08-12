import type { JSX } from 'react';
import { useGame } from '../state/useGame.js';
import { SKILL_LABELS } from '../data/roles.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { candidateToSettler } from '../engine/candidates.js';

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
  const { state, setState } = useGame() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const candidate: Candidate | null = state.population?.candidate ?? null;
  if (!candidate) return null;

  const accept = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setState((prev: any) => {
      const settlers = [
        ...prev.population.settlers,
        candidateToSettler(candidate),
      ];
      return {
        ...prev,
        population: { ...prev.population, settlers, candidate: null },
        colony: { ...prev.colony, radioTimer: RADIO_BASE_SECONDS },
      };
    });
  };

  const reject = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setState((prev: any) => ({
      ...prev,
      population: { ...prev.population, candidate: null },
      colony: { ...prev.colony, radioTimer: RADIO_BASE_SECONDS },
    }));
  };

  const skills = Object.entries(candidate.skills || {})
    .filter(([, s]) => s.level > 0)
    .map(([id, s]) => `${SKILL_LABELS[id] || id} ${s.level}`)
    .join(', ');

  return (
    <div className="p-4 border border-stroke bg-bg2 rounded space-y-2">
      <div className="font-semibold">A new settler has arrived!</div>
      <div className="text-sm">
        {candidate.firstName} {candidate.lastName} •{' '}
        {candidate.sex === 'M' ? 'Male' : 'Female'} • Age {candidate.age}
      </div>
      <div className="text-xs text-muted">{skills || 'No skills'}</div>
      <div className="space-x-2">
        <button
          className="px-2 py-1 border border-stroke rounded"
          onClick={accept}
        >
          Accept
        </button>
        <button
          className="px-2 py-1 border border-stroke rounded"
          onClick={reject}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
