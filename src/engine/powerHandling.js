export function setOfflineReason(buildings, id, count, reason) {
  const entry = buildings[id] || { count };
  if (reason) {
    buildings[id] = { ...entry, offlineReason: reason };
  } else if (entry.offlineReason) {
    const copy = { ...entry };
    delete copy.offlineReason;
    buildings[id] = copy;
  } else if (!buildings[id]) {
    buildings[id] = entry;
  }
}
