import React from 'react';
import { useGame } from '../state/useGame.tsx';
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
            {info.deaths?.length > 0 && (
              <div className="mb-2 space-y-1">
                <div>The following settlers died:</div>
                {info.deaths.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
            )}
            {(info.researchCompleted || info.research)?.length > 0 && (
              <div className="mb-2 space-y-1">
                <div>Research completed:</div>
                {(info.researchCompleted || info.research).map((r, i) => (
                  <div key={i}>{r}</div>
                ))}
              </div>
            )}
            {(info.candidateArrivals || info.candidates)?.length > 0 && (
              <div className="mb-2 space-y-1">
                <div>Radio contact:</div>
                {(info.candidateArrivals || info.candidates).map((c, i) => (
                  <div key={i}>{c}</div>
                ))}
              </div>
            )}
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
