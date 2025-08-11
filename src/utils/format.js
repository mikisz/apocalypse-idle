export function formatAmount(n) {
  const abs = Math.abs(n || 0);
  const sign = n < 0 ? '-' : '';
  const fmt = (value, suffix) => {
    const rounded = value.toFixed(1);
    if (Number(rounded) === 0) return '0';
    return `${rounded.replace(/\.0$/, '')}${suffix}`;
  };
  if (abs >= 1e12) return sign + fmt(abs / 1e12, 'T');
  if (abs >= 1e9) return sign + fmt(abs / 1e9, 'B');
  if (abs >= 1e6) return sign + fmt(abs / 1e6, 'M');
  if (abs >= 1e3) return sign + fmt(abs / 1e3, 'k');
  return sign + (Math.round(abs * 100) / 100).toString();
}

export function formatRate(perSec) {
  if (!Number.isFinite(perSec)) perSec = 0;
  return `+${formatAmount(perSec)}/s`;
}
