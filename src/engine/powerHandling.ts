export function setOfflineReason(
  buildings: Record<string, any>,
  id: string,
  count: number,
  reason: string | null,
): void {
  const entry = buildings[id] || { count };

  // Only persist recognised reasons. This currently includes "power" when a
  // building can't get enough energy and "resources" when input materials are
  // missing. Unknown values should clear any previous offline reason.
  if (reason === 'power' || reason === 'resources') {
    buildings[id] = { ...entry, offlineReason: reason };
  } else if (entry.offlineReason) {
    const copy = { ...entry };
    delete copy.offlineReason;
    buildings[id] = copy;
  } else if (!buildings[id]) {
    buildings[id] = entry;
  }
}
