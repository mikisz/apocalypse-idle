import React, { forwardRef } from 'react';
import { RESEARCH_MAP } from '../../data/research.js';
import { RESOURCES } from '../../data/resources.js';
import { formatAmount } from '../../utils/format.js';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buildTooltip(node) {
  const lines = [];
  if (node.unlocks?.buildings?.length) {
    const names = node.unlocks.buildings.map((b) => b).join(', ');
    lines.push(`New buildings: ${names}`);
  }
  if (node.unlocks?.categories?.length) {
    lines.push(`New resource category: ${node.unlocks.categories.join(', ')}`);
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
    <div
      ref={ref}
      className={`relative w-56 p-3 border rounded bg-bg2/50 text-sm flex flex-col gap-1 ${
        status === 'completed'
          ? 'opacity-80 border-green-600'
          : status === 'inProgress'
            ? 'border-blue-500'
            : status === 'available'
              ? 'border-blue-300'
              : 'opacity-50 border-stroke'
      }`}
      title={tooltip}
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
        <button
          className="mt-1 px-2 py-1 border border-blue-400 rounded text-blue-200 hover:bg-blue-900/20"
          onClick={() => onStart(node.id)}
        >
          Start
        </button>
      )}
      {status === 'locked' && (
        <div className="mt-1">
          <button className="px-2 py-1 border rounded opacity-50 cursor-not-allowed">
            Locked
          </button>
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
  );
});

export default ResearchNode;
