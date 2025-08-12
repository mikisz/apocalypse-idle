import React from 'react';
import { ScrollArea } from './ui/scroll-area';

export default function EventLog({ log = [] }) {
  return (
    <ScrollArea className="h-40">
      <ul className="text-sm space-y-1">
        {log.map((entry) => (
          <li key={entry.id}>
            <span className="text-muted mr-2">
              {new Date(entry.time).toLocaleString()}
            </span>
            {entry.text}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
