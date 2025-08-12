import React, { useState } from 'react';
import { useGame } from '../state/useGame.ts';
import Accordion from './Accordion.jsx';
import PowerPriorityModal from './PowerPriorityModal.jsx';
import ResourceRow from './ResourceRow.jsx';
import HappinessSection from './HappinessSection.jsx';
import { useResourceSections } from './useResourceSections.js';

export default function ResourceSidebar() {
  const { state } = useGame();
  const [showPowerModal, setShowPowerModal] = useState(false);
  const { sections, settlersInfo } = useResourceSections(state);

  return (
    <div className="border border-border rounded overflow-hidden bg-card">
      {sections.map((g) =>
        g.settlers ? (
          <HappinessSection
            key={g.title}
            title={g.title}
            info={settlersInfo}
            avgHappiness={g.avgHappiness}
          />
        ) : (
          <Accordion key={g.title} title={g.title} defaultOpen={g.defaultOpen}>
            {g.items.map((r) => (
              <ResourceRow key={r.id} {...r} />
            ))}
            {g.title === 'Energy' && (
              <div className="pt-2 text-right">
                <button
                  className="text-xs text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPowerModal(true);
                  }}
                >
                  Set priorities
                </button>
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
