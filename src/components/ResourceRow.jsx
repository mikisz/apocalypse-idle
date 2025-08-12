import React from 'react';
import { formatAmount } from '../utils/format.js';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export default function ResourceRow({
  icon,
  name,
  amount,
  capacity,
  rate,
  tooltip,
}) {
  const content = (
    <li className="flex items-center justify-between text-sm tabular-nums px-1 py-0.5">
      <span className="flex items-center gap-1">
        {icon && <span>{icon}</span>}
        <span>{name}</span>
      </span>
      <span className="flex flex-col items-end">
        <span>
          {formatAmount(amount)}
          {capacity != null && ` / ${formatAmount(capacity)}`}
        </span>
        {rate != null && (
          <span className="text-xs muted-foreground">{rate}</span>
        )}
      </span>
    </li>
  );

  if (!tooltip) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
