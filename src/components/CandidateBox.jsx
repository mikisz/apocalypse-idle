import React from 'react';
import { useGame } from '../state/useGame.js';
import { SKILL_LABELS } from '../data/roles.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { candidateToSettler } from '../engine/candidates.js';

export default function CandidateBox() {
  const { state, setState } = useGame();
  const candidate = state.population?.candidate;
  if (!candidate) return null;

  const accept = () => {
    setState((prev) => {
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

  const reject = () => {
    setState((prev) => ({
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
        {candidate.firstName} {candidate.lastName} • {candidate.sex === 'M' ? 'Male' : 'Female'} • Age {candidate.age}
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
