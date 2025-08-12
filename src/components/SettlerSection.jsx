import React from 'react';
import Accordion from './Accordion.jsx';

export default function SettlerSection({ title, info }) {
  const {
    total,
    capacity,
    color,
    radioLine,
    progress,
    radioCount,
    candidatePending,
    powered,
  } = info;

  return (
    <Accordion key={title} title={title} defaultOpen>
      <div className={`text-sm mb-1 ${color}`}>
        Settlers {total}/{capacity}
      </div>
      <div className="text-xs text-muted-foreground mb-1">{radioLine}</div>
      {radioCount > 0 && !candidatePending && powered && (
        <div className="h-2 bg-border rounded mb-1">
          <div
            className="h-full bg-green-600 rounded"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </Accordion>
  );
}
