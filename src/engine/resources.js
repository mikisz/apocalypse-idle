export function clampResource(value, capacity) {
  let v = Number.isFinite(value) ? value : 0;
  let c;
  if (Number.isFinite(capacity)) c = Math.max(0, capacity);
  else if (capacity > 0) c = Infinity;
  else c = 0;
  const result = Math.max(0, Math.min(c, v));
  return Math.round(result * 1e6) / 1e6;
}
