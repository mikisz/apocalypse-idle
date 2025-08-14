import React from 'react';
import { RESOURCES } from '../data/resources.js';
import { formatAmount } from '../utils/format.js';
import { RESEARCH_MAP } from '../data/research.js';
import { Button } from './Button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Container } from './ui/container';
import { Switch } from './ui/switch';

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
  isDesiredOn = true,
  resourceShortage = false,
  buildTooltip,
  showPowerWarning = false,
  onBuild,
  onDemolish,
  onToggle,
}) {
  const formatPerSec = (perSec, res) => {
    const sign = perSec >= 0 ? '+' : '-';
    return `${sign}${Math.abs(perSec).toFixed(2)} ${RESOURCES[res].name}/s`;
  };

  const columnCount =
    1 +
    (perOutputs.length > 0 || building.capacityAdd ? 1 : 0) +
    (perInputs.length > 0 ? 1 : 0);
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  }[columnCount];

  const capacityEntries = Object.entries(building.capacityAdd || {});
  const hasFoodCapacity = capacityEntries.some(([res]) => res === 'FOOD');

  return (
    <Container className="space-y-3 shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{building.name}</span>
          <span className="text-sm text-muted-foreground">
            {building.maxCount != null
              ? `${count}/${building.maxCount}`
              : `(${count})`}
          </span>
          {!isDesiredOn && (
            <span className="px-1 text-xs text-white bg-gray-600 rounded">
              Off
            </span>
          )}
          {isDesiredOn && offlineReason === 'power' && (
            <span className="px-1 text-xs text-white bg-red-600 rounded">
              No Power
            </span>
          )}
          {isDesiredOn &&
            (resourceShortage || offlineReason === 'resources') && (
              <span className="px-1 text-xs text-white bg-red-600 rounded">
                No Resources
              </span>
            )}
        </div>
        <div className="space-x-2 flex items-center">
          <Switch checked={isDesiredOn} onCheckedChange={onToggle} />
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
        <div className={`grid gap-6 text-xs ${gridColsClass}`}>
          <div>
            <div className="text-xs font-medium">Cost:</div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {costEntries.map(([res, amt]) => (
                <span key={res} className="flex items-center gap-1">
                  {RESOURCES[res].icon} {formatAmount(amt)}{' '}
                  {RESOURCES[res].name}
                </span>
              ))}
            </div>
          </div>
          {perOutputs.length > 0 ? (
            <div>
              <div className="text-xs font-medium">Produces:</div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
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
                <div className="text-xs font-medium">Increase:</div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {building.cardTextOverride ? (
                    <span>{building.cardTextOverride}</span>
                  ) : (
                    Object.entries(building.capacityAdd).map(([res, cap]) => {
                      const resource = RESOURCES[res];
                      return resource ? (
                        <span key={res} className="flex items-center gap-1">
                          {resource.icon} +{formatAmount(cap)} {resource.name}{' '}
                          capacity
                        </span>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            )
          )}
          {perInputs.length > 0 && (
            <div>
              <div className="text-xs font-medium">Consume:</div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {perInputs.map((i) => (
                  <span key={i.res} className="flex items-center gap-1">
                    {RESOURCES[i.res].icon} {formatPerSec(-i.perSec, i.res)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {!unlocked && building.requiresResearch && (
          <div className="text-xs text-red-400">
            Requires:{' '}
            {RESEARCH_MAP[building.requiresResearch]?.name ||
              building.requiresResearch}
          </div>
        )}
        {showPowerWarning && (
          <div className="text-xs">No Power storage. Excess is lost.</div>
        )}
      </div>
    </Container>
  );
}
