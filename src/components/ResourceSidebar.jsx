import React, { useState } from 'react';
import { useGame } from '../state/useGame.ts';
import Accordion from './Accordion.jsx';
import PowerPriorityModal from './PowerPriorityModal.jsx';
import ResourceRow from './ResourceRow.jsx';
import SettlerSection from './SettlerSection.jsx';
import { useResourceSections } from './useResourceSections.js';
import { Button } from './Button';

export default function ResourceSidebar() {
  const { state } = useGame();
  const [showPowerModal, setShowPowerModal] = useState(false);
  const { sections, settlersInfo, happinessInfo } = useResourceSections(state);

  return (
    <div className="border border-border rounded overflow-hidden bg-card">
      {sections.map((g) =>
        g.settlers ? (
          <SettlerSection key={g.title} title={g.title} info={settlersInfo} />
        ) : g.happiness ? (
          <Accordion key={g.title} title={g.title}>
            <div className="space-y-1 text-sm">
              <div>Avg Happiness: {happinessInfo.avg}%</div>
              <div>
                Settlers {happinessInfo.total}/{happinessInfo.capacity}
              </div>
              {happinessInfo.breakdown.length > 0 && (
                <>
                  <div className="my-1 border-b" />
                  <ul className="space-y-0.5 text-xs">
                    {happinessInfo.breakdown.map((b, idx) => (
                      <li key={idx}>
                        {b.label} {b.value >= 0 ? '+' : ''}
                        {b.value}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Accordion>
        ) : (
          <Accordion key={g.title} title={g.title} defaultOpen={g.defaultOpen}>
            {g.items.map((r) => (
              <ResourceRow key={r.id} {...r} />
            ))}
            {g.title === 'Energy' && (
              <div className="pt-2 text-right">
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 h-auto text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPowerModal(true);
                  }}
                >
                  Set priorities
                </Button>
              </div>
            )}
          </Accordion>
        ),
      )}
      {showPowerModal && (
        <PowerPriorityModal onClose={() => setShowPowerModal(false)} />
      )}
    </div>
  );
}
