import React from 'react';

export default function EventLog({ log = [] }) {
  return (
    <ul className="text-sm space-y-1">
      {log.map((entry) => (
        <li key={entry.id}>{entry.text}</li>
      ))}
    </ul>
  );
}
