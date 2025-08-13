import React, { useState } from 'react';
import { useGame } from '../state/useGame.tsx';
import { formatAge } from '../utils/format.js';
import { computeRoleBonuses } from '../engine/settlers.js';
import { XP_TIME_TO_NEXT_LEVEL_SECONDS } from '../data/balance.js';
import { ROLE_LIST, SKILL_LABELS } from '../data/roles.js';
import { RESOURCES } from '../data/resources.js';
import { getSettlerCapacity } from '../state/selectors.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Accordion from '@/components/Accordion.jsx';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const BONUS_LABELS = ROLE_LIST.reduce((acc, r) => {
  acc[r.id] = RESOURCES[r.resource].name;
  return acc;
}, {});

export default function PopulationView() {
  const { state, setSettlerRole } = useGame();
  const [onlyLiving, setOnlyLiving] = useState(true);
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const settlers = state.population?.settlers ?? [];
  const availableRoles = ROLE_LIST.filter(
    (r) => (state.buildings?.[r.building]?.count || 0) > 0,
  );
  const filtered = settlers
    .filter((s) => !onlyLiving || !s.isDead)
    .filter((s) => !unassignedOnly || s.role == null);
  const living = settlers.filter((s) => !s.isDead).length;
  const capacity = getSettlerCapacity(state);
  const bonuses = computeRoleBonuses(settlers);

  return (
    <div className="h-full p-4 pb-24 overflow-y-auto space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Settlers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-lg font-semibold">
            {living}/{capacity}
          </CardContent>
        </Card>
        {Object.entries(BONUS_LABELS).map(([role, label]) => (
          <Card key={role} className="text-center">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {label} bonus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-lg font-semibold">
              +{Math.round(bonuses[role] || 0)}%
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            id="onlyLiving"
            checked={onlyLiving}
            onCheckedChange={(v) => setOnlyLiving(v === true)}
          />
          <label htmlFor="onlyLiving">Only living</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="unassignedOnly"
            checked={unassignedOnly}
            onCheckedChange={(v) => setUnassignedOnly(v === true)}
          />
          <label htmlFor="unassignedOnly">Unassigned only</label>
        </div>
      </div>
      {filtered.length > 0 ? (
        filtered.map((s) => {
          const { years, days } = formatAge(s.ageDays);
          const skillEntries = Object.entries(s.skills || {})
            .filter(([, sk]) => sk.level > 0)
            .sort((a, b) => b[1].level - a[1].level);
          return (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {s.firstName} {s.lastName}
                    <span className="px-1 border rounded text-xs">{s.sex}</span>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {years}y, {days}d
                  </div>
                </div>
                <Select
                  value={s.role || 'idle'}
                  onValueChange={(v) => setSettlerRole(s.id, v)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idle">Idle</SelectItem>
                    {availableRoles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded">
                  <Accordion
                    title={`Happiness: ${Math.round(s.happiness || 0)}%`}
                    contentClassName="p-2 space-y-0.5"
                  >
                    <ul className="space-y-0.5 text-xs">
                      {(s.happinessBreakdown || []).map((b, idx) => (
                        <li key={idx}>
                          {b.label}: {b.value >= 0 ? '+' : ''}
                          {b.value}
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                </div>
                <Accordion title="Skills" contentClassName="p-2 space-y-2">
                  <ul className="space-y-2">
                    {skillEntries.map(([role, skill]) => {
                      const threshold = XP_TIME_TO_NEXT_LEVEL_SECONDS(
                        skill.level,
                      );
                      const prog =
                        threshold > 0 ? Math.min(skill.xp / threshold, 1) : 0;
                      return (
                        <li
                          key={role}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex items-center gap-1">
                            {SKILL_LABELS[role] || role}
                            <span className="px-1 bg-muted rounded text-xs">
                              [{skill.level}]
                            </span>
                          </span>
                          <div className="flex items-center gap-1 w-32">
                            <span className="text-xs">{skill.level}</span>
                            <div className="flex-1 h-2 bg-border rounded">
                              <div
                                className="h-full bg-green-600 rounded"
                                style={{ width: `${prog * 100}%` }}
                              />
                            </div>
                            <span className="text-xs">{skill.level + 1}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Accordion>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center text-muted-foreground">No survivors</div>
      )}
    </div>
  );
}
