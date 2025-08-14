export const ROLES = {
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    skill: 'Farming',
    resources: ['potatoes'],
    buildings: ['potatoField'],
  },
  hunter: {
    id: 'hunter',
    name: 'Hunter',
    skill: 'Hunting',
    resources: ['meat'],
    buildings: ['huntersHut'],
  },
  gatherer: {
    id: 'gatherer',
    name: 'Gatherer',
    skill: 'Gathering',
    resources: ['wood', 'scrap', 'stone'],
    buildings: ['loggingCamp', 'scrapyard', 'quarry'],
  },
  carpenter: {
    id: 'carpenter',
    name: 'Carpenter',
    skill: 'Carpentry',
    resources: ['planks'],
    buildings: ['sawmill'],
  },
  metalworker: {
    id: 'metalworker',
    name: 'Metalworker',
    skill: 'Metalworking',
    resources: ['metalParts'],
    buildings: ['metalWorkshop'],
  },
  mason: {
    id: 'mason',
    name: 'Mason',
    skill: 'Masonry',
    resources: ['bricks'],
    buildings: ['brickKiln'],
  },
  toolsmith: {
    id: 'toolsmith',
    name: 'Toolsmith',
    skill: 'Toolsmithing',
    resources: ['tools'],
    buildings: ['toolsmithy'],
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    skill: 'Engineering',
    resources: ['power'],
    buildings: ['woodGenerator'],
  },
  scientist: {
    id: 'scientist',
    name: 'Scientist',
    skill: 'Scientist',
    resources: ['science'],
    buildings: ['school'],
  },
};

export const ROLE_LIST = Object.values(ROLES);

export const ROLE_BY_RESOURCE = ROLE_LIST.reduce((acc, r) => {
  r.resources.forEach((res) => {
    acc[res] = r.id;
  });
  return acc;
}, {});

export const SKILL_LABELS = Object.fromEntries(
  ROLE_LIST.map((r) => [r.id, r.skill]),
);

export const ROLE_BUILDINGS = Object.fromEntries(
  ROLE_LIST.map((r) => [r.id, r.buildings]),
);

export const BUILDING_ROLES = ROLE_LIST.reduce((acc, r) => {
  r.buildings.forEach((b) => {
    acc[b] = r.id;
  });
  return acc;
}, {});
