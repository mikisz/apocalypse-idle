export function clampResource(value, capacity) {
  let v = Number.isFinite(value) ? value : 0;
  const c = Number.isFinite(capacity) ? Math.max(0, capacity) : 0;
  const result = Math.max(0, Math.min(c, v));
  return Math.round(result * 1e6) / 1e6;
}
