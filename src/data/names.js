export const FIRST_NAMES = {
  M: [
    'James', 'John', 'Robert', 'Michael', 'William',
    'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
    'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
    'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  ],
  F: [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth',
    'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
    'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra',
    'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  ],
}

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
]

export function makeRandomSettler({ sex } = {}) {
  const chosenSex = sex || (Math.random() < 0.5 ? 'M' : 'F')
  const firstPool = FIRST_NAMES[chosenSex]
  const firstName = firstPool[Math.floor(Math.random() * firstPool.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    firstName,
    lastName,
    sex: chosenSex,
    isDead: false,
    ageSeconds: 0,
    role: null,
    skills: {},
  }
}
