import { useGame } from '../state/useGame.ts';
import { formatTime } from '../utils/time.js';
import { Button } from './Button';

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
        <Button variant="outline" onClick={dismissOfflineModal}>
          Continue
        </Button>
      </div>
    </div>
  );
}
