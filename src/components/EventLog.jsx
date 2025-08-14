import React from 'react';
import PropTypes from 'prop-types';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';

export default function EventLog({ log = [] }) {
  return (
    <Card className="h-40 border-none p-0 shadow-none">
      <CardContent className="h-full p-0">
        <ScrollArea className="h-full border-none">
          <ul className="text-sm space-y-2">
            {log.map((entry) => (
              <li key={entry.id}>
                <span className="text-muted-foreground mr-2">
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

EventLog.propTypes = {
  log: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      time: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      text: PropTypes.string.isRequired,
    }),
  ),
};
