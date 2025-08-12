import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { generateCandidate } from './candidates.js';

export function updateRadio(
  state,
  elapsedSeconds,
  candidateGenerator = generateCandidate,
) {
  let candidate = state.population?.candidate || null;
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
