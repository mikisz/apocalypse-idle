import React from 'react';
import { RESOURCES } from '../data/resources.js';
import { formatAmount } from '../utils/format.js';
import { RESEARCH_MAP } from '../data/research.js';
import { Button } from './Button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export default function BuildingRow({
  building,
  count = 0,
  atMax = false,
  costEntries = [],
  perOutputs = [],
  perInputs = [],
  canAfford = false,
  unlocked = false,
  offlineReason,
  buildTooltip,
  showPowerWarning = false,
  onBuild,
  onDemolish,
}) {
  const formatPerSec = (perSec, res) => {
    const sign = perSec >= 0 ? '+' : '-';
    return `${sign}${Math.abs(perSec).toFixed(2)} ${RESOURCES[res].name}/s`;
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{building.name}</span>
          <span className="text-sm text-muted-foreground">
            {building.maxCount != null
              ? `${count}/${building.maxCount}`
              : `(${count})`}
          </span>
          {offlineReason && (
            <span className="px-1 text-xs text-white bg-red-600 rounded">
              {offlineReason === 'power' ? 'No Power' : 'Offline'}
            </span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDemolish}
            disabled={count <= 0}
          >
            Demolish
          </Button>
          {buildTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={onBuild}
                  disabled={!canAfford || !unlocked || atMax}
                >
                  Build
                </Button>
              </TooltipTrigger>
              <TooltipContent>{buildTooltip}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              size="sm"
              onClick={onBuild}
              disabled={!canAfford || !unlocked || atMax}
            >
              Build
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-6 text-sm">
        <div>{building.description}</div>
        <div
          className={`grid gap-6 text-xs ${
            perOutputs.length > 0 || building.capacityAdd
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          <div>
            <div className="font-medium">Cost:</div>
            <div className="mt-2 flex flex-wrap gap-3">
              {costEntries.map(([res, amt]) => (
                <span key={res} className="flex items-center gap-1">
                  {RESOURCES[res].icon} {formatAmount(amt)} {RESOURCES[res].name}
                </span>
              ))}
            </div>
          </div>
          {perOutputs.length > 0 ? (
            <div>
              <div className="font-medium">Produces:</div>
              <div className="mt-2 flex flex-wrap gap-3">
                {perOutputs.map((o) => (
                  <span key={o.res} className="flex items-center gap-1">
                    {RESOURCES[o.res].icon} {formatPerSec(o.perSec, o.res)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            building.capacityAdd && (
              <div>
                <div className="font-medium">Increase:</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {Object.entries(building.capacityAdd).map(([res, cap]) => (
                    <span key={res} className="flex items-center gap-1">
                      {RESOURCES[res].icon} +{formatAmount(cap)}{' '}
                      {RESOURCES[res].name} capacity
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
        {perInputs.map((i) => (
          <div key={`in-${i.res}`} className="text-xs mt-2">
            Consumes: {formatPerSec(-i.perSec, i.res)}
          </div>
        ))}
        {!unlocked && building.requiresResearch && (
          <div className="text-xs text-red-400">
            Requires:{' '}
            {RESEARCH_MAP[building.requiresResearch]?.name ||
              building.requiresResearch}
          </div>
        )}
        {building.maxCount != null && (
          <div className="text-xs">Max: {building.maxCount}</div>
        )}
        {showPowerWarning && (
          <div className="text-xs">No Power storage. Excess is lost.</div>
        )}
      </div>
    </div>
  );
}
