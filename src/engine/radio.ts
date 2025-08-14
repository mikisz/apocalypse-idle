import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { generateCandidate, type Candidate } from './candidates.ts';

export function updateRadio(
  state: any,
  elapsedSeconds: number,
  candidateGenerator: () => Candidate = generateCandidate,
): { candidate: Candidate | null; radioTimer: number } {
  let candidate: Candidate | null = state.population?.candidate || null;
  let radioTimer = state.colony?.radioTimer ?? RADIO_BASE_SECONDS;
  if ((state.buildings?.radio?.count || 0) > 0) {
    const powered = (state.resources?.power?.amount || 0) > 0;
    if (powered && !candidate) {
      radioTimer = Math.max(0, radioTimer - elapsedSeconds);
      if (radioTimer <= 0) {
        candidate = candidateGenerator();
        radioTimer = 0;
      }
    }
  }
  return { candidate, radioTimer };
}
