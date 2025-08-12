import { FIRST_NAMES, LAST_NAMES } from '../data/names.js';
import { ROLE_LIST } from '../data/roles.js';
import { DAYS_PER_YEAR } from './time.js';

function randomSkillLevel(rng = Math.random) {
  const r = rng();
  if (r < 0.6) return 0;
  if (r < 0.8) return 1;
  if (r < 0.9) return 2;
  if (r < 0.96) return 3;
  if (r < 0.99) return 4;
  if (r < 0.995) return 5;
  return 6;
}

export function generateCandidate(rng = Math.random) {
  const sex = rng() < 0.5 ? 'M' : 'F';
  const firstNames = FIRST_NAMES[sex];
  const firstName = firstNames[Math.floor(rng() * firstNames.length)];
  const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  const age = Math.floor(18 + rng() * 48); // 18..65
  const skills = {};
  ROLE_LIST.forEach((r) => {
    skills[r.id] = { level: randomSkillLevel(rng) };
  });
  if (age > 40 && rng() < 0.3) {
    const idx = Math.floor(rng() * ROLE_LIST.length);
    const key = ROLE_LIST[idx].id;
    skills[key].level = Math.min(6, skills[key].level + 1);
  }
  if (ROLE_LIST.every((r) => skills[r.id].level === 6)) {
    const key = ROLE_LIST[Math.floor(rng() * ROLE_LIST.length)].id;
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
