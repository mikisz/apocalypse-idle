import React, { useState } from 'react';
import { useGame } from '../state/useGame.ts';
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
    <div className="h-full p-4 pb-20 overflow-y-auto space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-normal text-muted">
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
              <CardTitle className="text-sm font-normal text-muted">
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
            onCheckedChange={setOnlyLiving}
          />
          <label htmlFor="onlyLiving">Only living</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="unassignedOnly"
            checked={unassignedOnly}
            onCheckedChange={setUnassignedOnly}
          />
          <label htmlFor="unassignedOnly">Unassigned only</label>
        </div>
      </div>
      {filtered.length > 0 ? (
        filtered.map((s) => {
          const { years, days } = formatAge(s.ageDays);
          const activeSkill = s.skills?.[s.role] || { level: 0, xp: 0 };
          const threshold = XP_TIME_TO_NEXT_LEVEL_SECONDS(activeSkill.level);
          const progress = threshold > 0 ? activeSkill.xp / threshold : 0;
          const badges = Object.entries(s.skills || {})
            .filter(([, skill]) => skill.level > 0)
            .map(([role, skill]) => (
              <span key={role} className="px-2 py-0.5 bg-card rounded text-xs">
                {SKILL_LABELS[role] || role} {skill.level}
              </span>
            ));
          return (
            <Card key={s.id} className="flex flex-col gap-2">
              <CardHeader>
                <CardTitle>
                  {s.firstName} {s.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span
                    className={`px-2 py-0.5 rounded text-xs text-white ${
                      s.sex === 'M' ? 'bg-blue-700' : 'bg-pink-700'
                    }`}
                  >
                    {s.sex}
                  </span>
                  <span>
                    Age: {years}y {days}d
                  </span>
                </div>
                <Accordion
                  title={`Happiness: ${Math.round(s.happiness || 0)}%`}
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
                <div className="space-y-1">
                  <div className="text-sm">Level {activeSkill.level}</div>
                  <div className="h-2 bg-border rounded">
                    <div
                      className="h-full bg-green-600 rounded"
                      style={{ width: `${Math.min(progress, 1) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">{badges}</div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center text-muted">No survivors</div>
      )}
    </div>
  );
}
