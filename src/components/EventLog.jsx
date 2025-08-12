import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';

export default function EventLog({ log = [] }) {
  return (
    <Card className="h-40">
      <CardContent className="h-full p-0">
        <ScrollArea className="h-full px-4">
          <ul className="text-sm space-y-1">
            {log.map((entry) => (
              <li key={entry.id}>
                <span className="muted-foreground mr-2">
                  {new Date(entry.time).toLocaleString()}
                </span>
                {entry.text}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
