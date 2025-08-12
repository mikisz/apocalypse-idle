import React, { useState } from 'react';
import { useGame } from '../state/useGame.ts';
import { formatAge } from '../utils/format.js';
import { computeRoleBonuses } from '../engine/settlers.js';
import { XP_TIME_TO_NEXT_LEVEL_SECONDS } from '../data/balance.js';
import { ROLE_LIST, SKILL_LABELS } from '../data/roles.js';
import { RESOURCES } from '../data/resources.js';
import { getSettlerCapacity } from '../state/selectors.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import Accordion from '@/components/Accordion.jsx';

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
    <div className="h-full p-4 pb-20">
      <Tabs defaultValue="settlers" className="h-full flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="settlers" className="flex-1">
            Settlers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-4">
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
        </TabsContent>
        <TabsContent
          value="settlers"
          className="flex-1 overflow-y-auto space-y-4"
        >
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyLiving}
                onChange={(e) => setOnlyLiving(e.target.checked)}
              />
              Only living
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={unassignedOnly}
                onChange={(e) => setUnassignedOnly(e.target.checked)}
              />
              Unassigned only
            </label>
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
                  <span key={role} className="px-2 py-0.5 bg-bg3 rounded text-xs">
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
                    <div className="relative inline-block w-36">
                      <select
                        value={s.role || 'idle'}
                        onChange={(e) => setSettlerRole(s.id, e.target.value)}
                        className="appearance-none w-full rounded bg-gray-800 text-white px-3 py-2 pr-8 hover:bg-gray-700 focus:outline-none"
                      >
                        <option value="idle">Idle</option>
                        {availableRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <span className="w-2 h-2 border-r-2 border-b-2 border-white rotate-45" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">Level {activeSkill.level}</div>
                      <div className="h-2 bg-stroke rounded">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
