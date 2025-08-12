import React, { useState } from 'react';
import { useGame } from '../state/useGame.ts';
import Accordion from './Accordion.jsx';
import PowerPriorityModal from './PowerPriorityModal.jsx';
import ResourceRow from './ResourceRow.jsx';
import SettlerSection from './SettlerSection.jsx';
import { useResourceSections } from './useResourceSections.js';

export default function ResourceSidebar() {
  const { state } = useGame();
  const [showPowerModal, setShowPowerModal] = useState(false);
  const { sections, settlersInfo } = useResourceSections(state);

  return (
    <div className="border border-stroke rounded overflow-hidden bg-bg2">
      {sections.map((g) =>
        g.settlers ? (
          <SettlerSection key={g.title} title={g.title} info={settlersInfo} />
        ) : (
          <Accordion
            key={g.title}
            title={g.title}
            defaultOpen={g.defaultOpen}
            action={
              g.title === 'Energy' && (
                <button
                  className="text-xs text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPowerModal(true);
                  }}
                >
                  Set priorities
                </button>
              )
            }
          >
            {g.items.map((r) => (
              <ResourceRow key={r.id} {...r} />
            ))}
          </Accordion>
        ),
      )}
      {showPowerModal && (
        <PowerPriorityModal onClose={() => setShowPowerModal(false)} />
      )}
    </div>
  );
}
