export const RESEARCH = [
  {
    id: 'basicEnergy',
    name: 'Basic Energy',
    type: 'unlock',
    shortDesc:
      'Learn the fundamentals of generating and storing electrical power.',
    cost: { science: 80 },
    timeSec: 120,
    prereqs: ['industry1'],
    unlocks: {
      resources: ['power'],
      buildings: ['woodGenerator', 'battery'],
      categories: ['Energy'],
    },
    row: 1,
    effects: [],
  },
  {
    id: 'industry1',
    name: 'Industry I',
    type: 'unlock',
    shortDesc:
      'Unlocks basic processing and storage for construction materials.',
    cost: { science: 60 },
    timeSec: 90,
    prereqs: [],
    unlocks: {
      buildings: ['sawmill', 'metalWorkshop', 'materialsDepot'],
      categories: ['CONSTRUCTION_MATERIALS'],
      resources: ['planks', 'metalParts'],
    },
    row: 0,
    effects: [],
  },
  {
    id: 'hunting1',
    name: 'Hunting I',
    type: 'unlock',
    shortDesc: 'Unlocks hunting for supplemental food.',
    cost: { science: 50 }, // changed: 35→50
    timeSec: 90, // changed: 45→90
    prereqs: [],
    unlocks: { buildings: ['huntersHut'], resources: ['meat'] },
    row: 1,
    effects: [],
  },
  {
    id: 'radio',
    name: 'Radio',
    type: 'unlock',
    shortDesc: 'Unlocks radio broadcasts to attract settlers.',
    cost: { science: 150 }, // changed: 120→150
    timeSec: 240, // changed: 180→240
    prereqs: ['industry1', 'basicEnergy'],
    unlocks: { buildings: ['radio'] },
    row: 1,
    effects: [],
  },
  {
    id: 'woodworking1',
    name: 'Woodworking I',
    type: 'efficiency',
    shortDesc: '+5% to wood and derived planks.',
    cost: { science: 60 }, // changed: 50→60
    timeSec: 90, // changed: 70→90
    prereqs: ['industry1'],
    effects: [{ category: 'WOOD', percent: 0.05, type: 'output' }],
    row: 1,
  },
  {
    id: 'salvaging1',
    name: 'Salvaging I',
    type: 'efficiency',
    shortDesc: '+5% to scrap and derived metal parts.',
    cost: { science: 60 }, // changed: 50→60
    timeSec: 90, // changed: 70→90
    prereqs: ['industry1'],
    effects: [{ category: 'SCRAP', percent: 0.05, type: 'output' }],
    row: 1,
  },
  {
    id: 'logistics1',
    name: 'Logistics I',
    type: 'efficiency',
    shortDesc:
      '+5% storage capacity for raw materials and construction materials.',
    cost: { science: 60 },
    timeSec: 90,
    prereqs: ['industry1'],
    effects: [
      { category: 'RAW', percent: 0.05, type: 'storage' },
      { category: 'CONSTRUCTION_MATERIALS', percent: 0.05, type: 'storage' },
    ],
    row: 1,
  },
  {
    id: 'industry2',
    name: 'Industry II',
    type: 'unlock',
    shortDesc: 'Unlocks advanced tools and further processing.',
    cost: { science: 200 },
    timeSec: 240,
    prereqs: ['industry1'],
    milestones: { produced: { planks: 50, metalParts: 30 } },
    unlocks: { buildings: ['toolsmithy'] },
    row: 2,
    effects: [],
  },
  {
    id: 'woodworking2',
    name: 'Woodworking II',
    type: 'efficiency',
    shortDesc: 'Additional +5% to wood and planks.',
    cost: { science: 140 }, // changed: 110→140
    timeSec: 240, // changed: 180→240
    prereqs: ['woodworking1', 'industry2'],
    effects: [{ category: 'WOOD', percent: 0.05, type: 'output' }],
    row: 3,
  },
  {
    id: 'salvaging2',
    name: 'Salvaging II',
    type: 'efficiency',
    shortDesc: 'Additional +5% to scrap and metal parts.',
    cost: { science: 140 }, // changed: 110→140
    timeSec: 240, // changed: 180→240
    prereqs: ['salvaging1', 'industry2'],
    effects: [{ category: 'SCRAP', percent: 0.05, type: 'output' }],
    row: 3,
  },
  {
    id: 'logistics2',
    name: 'Logistics II',
    type: 'efficiency',
    shortDesc:
      'Additional +5% storage capacity for raw materials and construction materials.',
    cost: { science: 150 }, // changed: 120→150
    timeSec: 270, // changed: 210→270
    prereqs: ['logistics1', 'industry2'],
    effects: [
      { category: 'RAW', percent: 0.05, type: 'storage' },
      { category: 'CONSTRUCTION_MATERIALS', percent: 0.05, type: 'storage' },
    ],
    row: 3,
  },
  {
    id: 'hunting2',
    name: 'Hunting II',
    type: 'efficiency',
    shortDesc: '+10% to all food outputs.',
    cost: { science: 130 },
    timeSec: 240,
    prereqs: ['hunting1'],
    effects: [{ category: 'FOOD', percent: 0.1, type: 'output' }],
    row: 2,
  },
  {
    id: 'industryProduction',
    name: 'Industry Production',
    type: 'efficiency',
    shortDesc: '+10% output for construction materials.',
    cost: { science: 130 },
    timeSec: 240,
    prereqs: ['industry1'],
    effects: [{ category: 'CONSTRUCTION_MATERIALS', percent: 0.1, type: 'output' }],
    row: 2,
  },
];

export const RESEARCH_MAP = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));
