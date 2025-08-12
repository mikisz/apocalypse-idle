import React from 'react';

export default function EventLog({ log = [] }) {
  return (
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
  );
}
