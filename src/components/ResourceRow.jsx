import React from 'react';
import PropTypes from 'prop-types';
import { formatAmount, formatRate } from '../utils/format.js';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export default function ResourceRow({
  icon,
  name,
  amount,
  capacity,
  capped,
  rate,
  tooltip,
  supply,
  demand,
  stored,
}) {
  const displayAmount =
    capacity != null && Math.abs(amount - capacity) < 1e-6 ? capacity : amount;
  const displayStored =
    stored != null && capacity != null && Math.abs(stored - capacity) < 1e-6
      ? capacity
      : (stored ?? amount);

  const content = (
    <li className="flex items-center justify-between text-sm tabular-nums">
      <span className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span>{name}</span>
      </span>
      <span className="flex flex-col items-end">
        {supply != null && demand != null ? (
          <span>
            {formatRate(supply)} / {formatRate(demand)}
          </span>
        ) : (
          <span className={capped ? 'text-orange-500' : undefined}>
            {formatAmount(displayAmount)}
            {capacity != null && ` / ${formatAmount(capacity)}`}
          </span>
        )}
        {supply != null && demand != null ? (
          <span className="text-xs text-muted-foreground">
            {formatAmount(displayStored)}
            {capacity != null && ` / ${formatAmount(capacity)}`}
          </span>
        ) : rate != null ? (
          <span className="text-xs text-muted-foreground">{rate}</span>
        ) : null}
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

ResourceRow.propTypes = {
  icon: PropTypes.node,
  name: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  capacity: PropTypes.number,
  capped: PropTypes.bool,
  rate: PropTypes.string,
  tooltip: PropTypes.node,
  supply: PropTypes.number,
  demand: PropTypes.number,
  stored: PropTypes.number,
};
