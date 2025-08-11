export const ROLES = {
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    skill: 'Farming',
    resource: 'potatoes',
    building: 'potatoField',
  },
  woodcutter: {
    id: 'woodcutter',
    name: 'Woodcutter',
    skill: 'Woodcutting',
    resource: 'wood',
    building: 'loggingCamp',
  },
  scavenger: {
    id: 'scavenger',
    name: 'Scavenger',
    skill: 'Scavenging',
    resource: 'scrap',
    building: 'scrapyard',
  },
  quarryWorker: {
    id: 'quarryWorker',
    name: 'Quarry Worker',
    skill: 'Quarrying',
    resource: 'stone',
    building: 'quarry',
  },
  scientist: {
    id: 'scientist',
    name: 'Scientist',
    skill: 'Scientist',
    resource: 'science',
    building: 'school',
  },
};

export const ROLE_LIST = Object.values(ROLES);
export const ROLE_BY_RESOURCE = Object.fromEntries(
  ROLE_LIST.map((r) => [r.resource, r.id]),
);
export const SKILL_LABELS = Object.fromEntries(
  ROLE_LIST.map((r) => [r.id, r.skill]),
);

export const ROLE_BUILDINGS = Object.fromEntries(
  ROLE_LIST.map((r) => [r.id, r.building]),
);
export const BUILDING_ROLES = Object.fromEntries(
  ROLE_LIST.map((r) => [r.building, r.id]),
);
