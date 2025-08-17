import React, { forwardRef, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { RESEARCH_MAP } from '../../data/research.js';
import { RESOURCES } from '../../data/resources.js';
import { BUILDING_MAP } from '../../data/buildings.js';
import { formatAmount } from '../../utils/format.js';
import { formatTime } from '../../utils/time.js';
import { Button } from '@/components/Button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

const CATEGORY_INFO = {
  FOOD: { name: 'Food', icon: '🍲' },
  RAW: { name: 'Raw Materials', icon: '⚒️' },
  CONSTRUCTION_MATERIALS: { name: 'Construction Materials', icon: '🏗️' },
  ENERGY: { name: 'Energy', icon: '⚡' },
  SOCIETY: { name: 'Science', icon: '📚' },
  WOOD: { name: 'Wood', icon: RESOURCES.wood.icon },
  SCRAP: { name: 'Scrap', icon: RESOURCES.scrap.icon },
};

function buildDetails(node) {
  const sections = [];
  if (node.unlocks?.buildings?.length) {
    const names = node.unlocks.buildings
      .map((b) => BUILDING_MAP[b]?.name || b)
      .join(', ');
    sections.push({
      title: `New building${node.unlocks.buildings.length > 1 ? 's' : ''}:`,
      content: names,
    });
  }
  if (node.unlocks?.categories?.length) {
    const names = node.unlocks.categories
      .map((c) => CATEGORY_INFO[c]?.name || c.replaceAll('_', ' '))
      .join(', ');
    sections.push({
      title: 'New resource category:',
      content: names,
    });
  }
  if (node.unlocks?.resources?.length) {
    const names = node.unlocks.resources
      .map(
        (r) =>
          `${RESOURCES[r]?.icon ? `${RESOURCES[r].icon} ` : ''}${
            RESOURCES[r]?.name || r
          }`,
      )
      .join(', ');
    sections.push({
      title: `New resource${node.unlocks.resources.length > 1 ? 's' : ''}:`,
      content: names,
    });
  }
  const effs = Array.isArray(node.effects)
    ? node.effects
    : node.effects
      ? [node.effects]
      : [];
  effs.forEach((e) => {
    if (e.percent) {
      const pct = (e.percent * 100).toFixed(0);
      const info =
        (e.resource && RESOURCES[e.resource]) ||
        CATEGORY_INFO[e.category] ||
        {};
      const name = info.name || e.resource || e.category;
      const icon = info.icon ? `${info.icon} ` : '';
      sections.push({ title: 'Effect:', content: `${icon}+${pct}% ${name}` });
    }
  });
  if (node.prereqs?.length) {
    const names = node.prereqs.map((id) => RESEARCH_MAP[id].name).join(', ');
    sections.push({ title: 'Requires:', content: names });
  }
  if (node.milestones?.produced) {
    const items = Object.entries(node.milestones.produced).map(([res, amt]) => (
      <span key={res} className="flex items-center gap-1">
        {RESOURCES[res]?.icon} {RESOURCES[res]?.name || res} ≥ {amt}
      </span>
    ));
    sections.push({
      title: 'Milestones:',
      content: <div className="flex flex-wrap gap-2">{items}</div>,
    });
  }
  return sections;
}

const ResearchNode = forwardRef(({ node, status, onStart }, ref) => {
  const details = buildDetails(node);
  const cost = node.cost?.science || 0;
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => !isTouch && setOpen(true)}
        onMouseLeave={() => !isTouch && setOpen(false)}
        onClick={isTouch ? () => setOpen(!open) : undefined}
      >
        <div
          ref={ref}
          className={`relative w-80 min-w-[20rem] p-3 border rounded bg-card text-sm flex flex-col gap-2 ${
            status === 'completed'
              ? 'opacity-80 border-border text-muted-foreground'
              : status === 'inProgress'
                ? 'border-blue-500'
                : status === 'available'
                  ? 'border-blue-300'
                  : 'opacity-50 border-border'
          }`}
        >
          <div className="flex items-center gap-1 font-semibold text-base">
            {node.name}
          </div>
          <div className="text-muted-foreground">{node.shortDesc}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              {RESOURCES.science.icon} {formatAmount(cost)}
            </span>
            <span className="flex items-center gap-1">
              🕐 {formatTime(node.timeSec)}
            </span>
          </div>
          {status === 'available' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 border-blue-400 text-blue-200 hover:bg-blue-900/20"
              onClick={(e) => {
                e.stopPropagation();
                onStart(node.id);
              }}
            >
              Start
            </Button>
          )}
          {status === 'locked' && (
            <div className="mt-1">
              <Button
                variant="outline"
                size="sm"
                disabled
                onClick={(e) => e.stopPropagation()}
              >
                Locked
              </Button>
            </div>
          )}
          {status === 'inProgress' && (
            <div className="mt-1 text-blue-400 flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              In Progress
            </div>
          )}
          {status === 'completed' && (
            <span className="absolute top-1 right-1 text-white">
              <Check className="w-4 h-4" />
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        onMouseLeave={() => !isTouch && setOpen(false)}
      >
        {isTouch && (
          <button
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="space-y-3 pt-2">
          {details.map((d, idx) => (
            <div key={idx} className="text-sm">
              <p className="text-muted-foreground">{d.title}</p>
              <div className="mt-1 text-base font-medium">{d.content}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default ResearchNode;
