import { FIRST_NAMES, LAST_NAMES } from '../data/names.js';
import { ROLE_LIST } from '../data/roles.js';
import { DAYS_PER_YEAR } from './time.js';

function randomSkillLevel(rng = Math.random) {
  const r = rng();
  if (r < 0.68) return 0;
  if (r < 0.87) return 1;
  if (r < 0.95) return 2;
  if (r < 0.985) return 3;
  if (r < 0.996) return 4;
  if (r < 0.999) return 5;
  return 6;
}

function pickRandom(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateCandidate(rng = Math.random) {
  const sex = rng() < 0.5 ? 'M' : 'F';
  const firstNames = FIRST_NAMES[sex];
  const firstName = pickRandom(firstNames, rng);
  const lastName = pickRandom(LAST_NAMES, rng);
  const age = Math.floor(18 + Math.pow(rng(), 1.6) * 47);

  const skills = {};
  ROLE_LIST.forEach((r) => {
    skills[r.id] = { level: randomSkillLevel(rng) };
  });

  if (age > 45 && rng() < 0.15) {
    const key = pickRandom(ROLE_LIST, rng).id;
    skills[key].level = Math.min(6, skills[key].level + 1);
  }

  const nonZero = Object.keys(skills).filter((k) => skills[k].level > 0);
  const maxNonZero = rng() < 0.5 ? 3 : 4;
  if (nonZero.length > maxNonZero) {
    for (let i = nonZero.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [nonZero[i], nonZero[j]] = [nonZero[j], nonZero[i]];
    }
    nonZero.slice(maxNonZero).forEach((key) => {
      skills[key].level = 0;
    });
  }

  if (ROLE_LIST.every((r) => skills[r.id].level === 6)) {
    const key = pickRandom(ROLE_LIST, rng).id;
    skills[key].level = 5;
  }

  return {
    id: globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Date.now().toString(),
    firstName,
    lastName,
    sex,
    age,
    skills,
  };
}

export function candidateToSettler(candidate) {
  return {
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    sex: candidate.sex,
    ageDays: candidate.age * DAYS_PER_YEAR,
    isDead: false,
    role: null,
    skills: candidate.skills,
  };
}
