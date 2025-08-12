import React from 'react';
import { BUILDINGS } from '../data/buildings.js';
import { useGame } from '../state/useGame.js';

const POWER_CONSUMERS = BUILDINGS.filter(
  (b) => b.inputsPerSecBase?.power || b.poweredMode,
);
const PRIORITY_LEVELS = [5, 4, 3, 2, 1];

export default function PowerPriorityModal({ onClose }) {
  const { state } = useGame();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg2 p-4 rounded shadow max-w-md w-full">
        <h2 className="text-lg mb-4">Power priorities</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {PRIORITY_LEVELS.map((p) => (
            <details key={p} open>
              <summary className="font-semibold">Priority {p}</summary>
              <ul className="pl-4 list-disc">
                {POWER_CONSUMERS.filter(
                  (c) => state.powerTypePriority?.[c.id]?.priority === p,
                ).map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-2 py-1 border rounded text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
