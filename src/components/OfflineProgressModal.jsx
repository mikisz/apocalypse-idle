import React from 'react';
import { useGame } from '../state/useGame.tsx';
import { formatTime } from '../utils/time.js';
import { Button } from './Button';
import { RESOURCES } from '../data/resources.js';
import { sanitize } from '../utils/sanitize.js';
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

  const resources = Object.entries(info?.gains || {});

  const events = [];
  if (info?.deaths?.length) {
    events.push({ title: 'Settler deaths', items: info.deaths });
  }
  const research = info?.researchCompleted || info?.research;
  if (research?.length) {
    events.push({ title: 'Research completed', items: research });
  }
  const arrivals = info?.candidateArrivals || info?.candidates;
  if (arrivals?.length) {
    events.push({ title: 'Radio contact', items: arrivals });
  }

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
          <div className="space-y-6">
            {resources.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-lg font-semibold">Resources</h3>
                <ul className="space-y-1 text-sm">
                  {resources.map(([res, amt]) => (
                    <li key={res} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {RESOURCES[res]?.icon && (
                          <span>{RESOURCES[res].icon}</span>
                        )}
                        <span>{RESOURCES[res]?.name || res}</span>
                      </span>
                      <span className="font-mono">{Math.floor(amt)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {events.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold">Events</h3>
                {events.map((e, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-medium">{e.title}</h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {e.items.map((text, i) => (
                        <li key={i}>
                          <span
                            dangerouslySetInnerHTML={{ __html: sanitize(text) }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}
          </div>
          <DialogFooter>
            <Button onClick={dismissOfflineModal}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
