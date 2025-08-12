export function createLogEntry(text, time = Date.now()) {
  return {
    id: globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2),
    text,
    time,
  };
}
