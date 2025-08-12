import { useGame } from '../state/useGame.ts';
import { Button } from './Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

export default function CorruptSaveModal() {
  const { loadError, retryLoad, resetGame } = useGame();

  return (
    <Dialog
      open={loadError}
      onOpenChange={(open) => {
        if (!open) retryLoad();
      }}
    >
      {loadError && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Load Failed</DialogTitle>
            <DialogDescription>
              Your save data appears corrupted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={retryLoad}>
              Retry
            </Button>
            <Button variant="outline" onClick={resetGame}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
