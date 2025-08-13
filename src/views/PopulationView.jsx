import React, { useState } from 'react';
import { useGame } from '../state/useGame.tsx';
import { computeRoleBonuses } from '../engine/settlers.js';
import { ROLE_LIST } from '../data/roles.js';
import { RESOURCES } from '../data/resources.js';
import { getSettlerCapacity } from '../state/selectors.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SettlerFilters from '../components/SettlerFilters.jsx';
import SettlerList from '../components/SettlerList.jsx';
import BanishSettlerModal from '../components/BanishSettlerModal.jsx';

const BONUS_LABELS = ROLE_LIST.reduce((acc, r) => {
  acc[r.id] = RESOURCES[r.resource].name;
  return acc;
}, {});

export default function PopulationView() {
  const { state, setSettlerRole, banishSettler } = useGame();
  const [onlyLiving, setOnlyLiving] = useState(true);
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [banishing, setBanishing] = useState(null);
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
      <SettlerFilters
        onlyLiving={onlyLiving}
        setOnlyLiving={setOnlyLiving}
        unassignedOnly={unassignedOnly}
        setUnassignedOnly={setUnassignedOnly}
      />
      <SettlerList
        settlers={filtered}
        availableRoles={availableRoles}
        setSettlerRole={setSettlerRole}
        onBanish={setBanishing}
      />
      <BanishSettlerModal
        settler={banishing}
        onCancel={() => setBanishing(null)}
        onConfirm={() => {
          if (banishing) {
            banishSettler(banishing.id);
            setBanishing(null);
          }
        }}
      />
    </div>
  );
}
