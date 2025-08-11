export const ROLES = {
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    skill: 'Farming',
    resource: 'potatoes',
  },
  woodcutter: {
    id: 'woodcutter',
    name: 'Woodcutter',
    skill: 'Woodcutting',
    resource: 'wood',
  },
  scavenger: {
    id: 'scavenger',
    name: 'Scavenger',
    skill: 'Scavenging',
    resource: 'scrap',
  },
  quarryWorker: {
    id: 'quarryWorker',
    name: 'Quarry Worker',
    skill: 'Quarrying',
    resource: 'stone',
  },
  scientist: {
    id: 'scientist',
    name: 'Scientist',
    skill: 'Scientist',
    resource: 'science',
  },
};

export const ROLE_LIST = Object.values(ROLES);
export const ROLE_BY_RESOURCE = Object.fromEntries(
  ROLE_LIST.map((r) => [r.resource, r.id]),
);
export const SKILL_LABELS = Object.fromEntries(
  ROLE_LIST.map((r) => [r.id, r.skill]),
);
