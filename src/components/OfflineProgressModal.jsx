import { useGame } from '../state/useGame.ts';
import { formatTime } from '../utils/time.js';
import { Button } from './Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

export default function OfflineProgressModal() {
  const { state, dismissOfflineModal } = useGame();
  const info = state.ui.offlineProgress;

  return (
    <Dialog
      open={!!info}
      onOpenChange={(open) => {
        if (!open) dismissOfflineModal();
      }}
    >
      {info && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>While you were away...</DialogTitle>
            <DialogDescription>
              You were gone for {formatTime(info.elapsed)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            {Object.entries(info.gains).map(([res, amt]) => (
              <div key={res}>
                {res}: {Math.floor(amt)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={dismissOfflineModal}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
