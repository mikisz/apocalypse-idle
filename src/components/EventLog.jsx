import React from 'react';

export default function EventLog({ log = [] }) {
  return (
    <ul className="text-sm space-y-1">
      {log.map((entry, i) => (
        <li key={i}>{entry}</li>
      ))}
    </ul>
  );
}
