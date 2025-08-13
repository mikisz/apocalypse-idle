export function setPowerStatus(buildings, id, count, shortage) {
  const entry = buildings[id] || { count };
  if (shortage) {
    buildings[id] = { ...entry, offlineReason: 'power' };
  } else if (entry.offlineReason) {
    const copy = { ...entry };
    delete copy.offlineReason;
    buildings[id] = copy;
  }
}
