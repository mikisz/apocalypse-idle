import { useGame } from '../state/useGame.ts';
import { Button } from './Button';

export default function CorruptSaveModal() {
  const { loadError, retryLoad, resetGame } = useGame();
  if (!loadError) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg2 p-4 rounded border border-stroke max-w-sm w-full space-y-4">
        <h2 className="font-semibold text-lg">Save Load Failed</h2>
        <p>Your save data appears corrupted.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={retryLoad}>
            Retry
          </Button>
          <Button variant="outline" onClick={resetGame}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
