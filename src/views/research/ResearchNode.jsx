import React, { forwardRef } from 'react';
import { RESEARCH_MAP } from '../../data/research.js';
import { RESOURCES } from '../../data/resources.js';
import { BUILDING_MAP } from '../../data/buildings.js';
import { formatAmount } from '../../utils/format.js';
import { formatTime } from '../../utils/time.js';
import { Button } from '@/components/Button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

function buildTooltip(node) {
  const lines = [];
  if (node.unlocks?.buildings?.length) {
    if (node.unlocks.buildings.length === 1) {
      const b = node.unlocks.buildings[0];
      const name = BUILDING_MAP[b]?.name || b;
      lines.push(`New building: ${name}`);
    } else {
      const names = node.unlocks.buildings
        .map((b) => BUILDING_MAP[b]?.name || b)
        .join(', ');
      lines.push(`New buildings: ${names}`);
    }
  }
  if (node.unlocks?.categories?.length) {
    lines.push(`New resource category: ${node.unlocks.categories.join(', ')}`);
  }
  if (node.unlocks?.resources?.length) {
    if (node.unlocks.resources.length === 1) {
      const r = node.unlocks.resources[0];
      const name = RESOURCES[r]?.name || r;
      const cat = RESOURCES[r]?.category;
      lines.push(`New ${cat ? `${cat} ` : ''}resource: ${name}`);
    } else {
      const names = node.unlocks.resources
        .map((r) => RESOURCES[r]?.name || r)
        .join(', ');
      lines.push(`New resources: ${names}`);
    }
  }
  const effs = Array.isArray(node.effects)
    ? node.effects
    : node.effects
      ? [node.effects]
      : [];
  effs.forEach((e) => {
    if (e.percent) {
      const pct = (e.percent * 100).toFixed(0);
      if (e.category) lines.push(`+${pct}% ${e.category}`);
      else if (e.resource) lines.push(`+${pct}% ${e.resource}`);
    }
  });
  if (node.prereqs?.length) {
    const names = node.prereqs.map((id) => RESEARCH_MAP[id].name).join(', ');
    lines.push(`Requires: ${names}`);
  }
  if (node.milestones?.produced) {
    const parts = Object.entries(node.milestones.produced).map(
      ([res, amt]) => `${RESOURCES[res]?.name || res} ≥ ${amt}`,
    );
    lines.push(`Milestones: ${parts.join(', ')}`);
  }
  return lines.join('\n');
}

const ResearchNode = forwardRef(({ node, status, reasons, onStart }, ref) => {
  const tooltip = buildTooltip(node);
  const cost = node.cost?.science || 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={ref}
          className={`relative w-64 p-3 border rounded bg-card/50 text-sm flex flex-col gap-1 ${
            status === 'completed'
              ? 'opacity-80 border-green-600'
              : status === 'inProgress'
                ? 'border-blue-500'
                : status === 'available'
                  ? 'border-blue-300'
                  : 'opacity-50 border-border'
          }`}
        >
          <div className="font-semibold text-base">{node.name}</div>
          <div className="text-muted">{node.shortDesc}</div>
          <div className="flex items-center gap-1">
            <span>{RESOURCES.science.icon}</span>
            <span>{formatAmount(cost)}</span>
          </div>
          <div className="text-xs text-muted">
            Research time: {formatTime(node.timeSec)}
          </div>
          {status === 'available' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 border-blue-400 text-blue-200 hover:bg-blue-900/20"
              onClick={() => onStart(node.id)}
            >
              Start
            </Button>
          )}
          {status === 'locked' && (
            <div className="mt-1">
              <Button variant="outline" size="sm" disabled>
                Locked
              </Button>
              <div className="mt-1 space-y-1 text-xs text-red-400">
                {reasons.missingPrereqs?.length > 0 && (
                  <div>Require: {reasons.missingPrereqs.join(', ')}</div>
                )}
                {reasons.missingMilestones?.length > 0 && (
                  <div>
                    {reasons.missingMilestones.map((m) => `${m}`).join(', ')}
                  </div>
                )}
                {reasons.needScience > 0 && (
                  <div>Need {formatAmount(reasons.needScience)} more</div>
                )}
              </div>
            </div>
          )}
          {status === 'inProgress' && (
            <div className="mt-1 text-blue-400 flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              In Progress
            </div>
          )}
          {status === 'completed' && (
            <span className="absolute top-1 right-1 text-green-500">✔</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
});

export default ResearchNode;
