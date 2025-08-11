import { useGame } from '../state/useGame.js';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

export default function OfflineProgressModal() {
  const { state, dismissOfflineModal } = useGame();
  const info = state.ui.offlineProgress;
  if (!info) return null;

  const { elapsed, gains } = info;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg2 p-4 rounded border border-stroke max-w-sm w-full space-y-4">
        <h2 className="font-semibold text-lg">While you were away...</h2>
        <p>You were gone for {formatTime(elapsed)}</p>
        <div className="space-y-1">
          {Object.entries(gains).map(([res, amt]) => (
            <div key={res}>
              {res}: {Math.floor(amt)}
            </div>
          ))}
        </div>
        <button
          className="px-4 py-2 rounded border border-stroke"
          onClick={dismissOfflineModal}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
