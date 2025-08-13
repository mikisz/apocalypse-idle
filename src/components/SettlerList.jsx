import React from 'react';
import { formatAge } from '../utils/format.js';
import { XP_TIME_TO_NEXT_LEVEL_SECONDS } from '../data/balance.js';
import { SKILL_LABELS } from '../data/roles.js';
import { Button } from './ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Container } from './ui/container';
import Accordion from './Accordion.jsx';

const HAPPINESS_ICONS = {
  Base: '😁',
  Overcrowding: '👬',
  'Food variety': '🥗',
};

export default function SettlerList({
  settlers,
  availableRoles,
  setSettlerRole,
  onBanish,
}) {
  return settlers.length > 0 ? (
    settlers.map((s) => {
      const { years, days } = formatAge(s.ageDays);
      const skillEntries = Object.entries(s.skills || {})
        .filter(([, sk]) => sk.level > 0 || (sk.xp || 0) > 0)
        .sort((a, b) => b[1].level - a[1].level);
      return (
        <Card key={s.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                {s.firstName} {s.lastName}
                <span className="px-1 border rounded text-xs">{s.sex}</span>
                {s.isDead && (
                  <span className="px-1 bg-red-600 text-white rounded text-xs">
                    Dead
                  </span>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {years}y, {days}d
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Select
                value={s.role || 'idle'}
                onValueChange={(v) => setSettlerRole(s.id, v)}
                disabled={s.isDead}
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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBanish(s)}
              >
                Banish
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Container className="shadow-none p-0">
              <Accordion
                title={`Happiness: ${Math.round(s.happiness || 0)}%`}
                contentClassName="p-0"
              >
                <ul className="mt-2 space-y-1 text-xs">
                  {(s.happinessBreakdown || []).map((b, idx) => (
                    <li key={idx} className="flex justify-between px-2">
                      <span>
                        {HAPPINESS_ICONS[b.label] || ''} {b.label}
                      </span>
                      <span>
                        {b.value >= 0 ? '+' : ''}
                        {b.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </Accordion>
            </Container>
            <Container className="shadow-none p-0">
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
            </Container>
          </CardContent>
        </Card>
      );
    })
  ) : (
    <div className="text-center text-muted-foreground">No survivors</div>
  );
}
