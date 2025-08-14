export function createLogEntry(text, time = Date.now()) {
  const crypto = globalThis.crypto;

  let id;
  if (crypto?.randomUUID) {
    id = crypto.randomUUID();
  } else if (crypto?.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0'));
    id = `${hex.slice(0, 4).join('')}-${hex
      .slice(4, 6)
      .join('')}-${hex.slice(6, 8).join('')}-${hex
      .slice(8, 10)
      .join('')}-${hex.slice(10, 16).join('')}`;
  } else {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  return {
    id,
    text,
    time,
  };
}
