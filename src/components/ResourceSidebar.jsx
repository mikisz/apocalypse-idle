import React, { useState } from 'react';
import { useGame } from '../state/useGame.tsx';
import Accordion from './Accordion.jsx';
import PowerPriorityModal from './PowerPriorityModal.jsx';
import ResourceRow from './ResourceRow.jsx';
import SettlerSection from './SettlerSection.jsx';
import { useResourceSections } from './useResourceSections.js';
import { Button } from './Button';
import { Container } from './ui/container';

export default function ResourceSidebar() {
  const { state } = useGame();
  const [showPowerModal, setShowPowerModal] = useState(false);
  const { sections, settlersInfo, happinessInfo } = useResourceSections(state);

  return (
    <Container className="overflow-hidden p-0">
      {sections.map((g, i) =>
        g.settlers ? (
          <SettlerSection
            key={g.title}
            title={g.title}
            info={settlersInfo}
            noBottomBorder={i === sections.length - 1}
          />
        ) : g.happiness ? (
          <Accordion
            key={g.title}
            title={g.title}
            contentClassName="p-0"
            noBottomBorder={i === sections.length - 1}
          >
            <ul className="mt-2 px-0 space-y-3">
              <li className="flex justify-between px-0">
                <span>👥 Settlers</span>
                <span>
                  {happinessInfo.total} / {happinessInfo.capacity}
                </span>
              </li>
              <div className="border-t" />
              <li className="flex justify-between px-0">
                <span>😁 Avg. Happiness</span>
                <span>{happinessInfo.avg}%</span>
              </li>
              <li className="flex justify-between px-0">
                <span>👬 Overcrowding</span>
                <span>
                  {happinessInfo.overcrowding >= 0 ? '+' : ''}
                  {happinessInfo.overcrowding}
                </span>
              </li>
              <li className="flex justify-between px-0">
                <span>🥗 Food variety</span>
                <span>
                  {happinessInfo.foodVariety >= 0 ? '+' : ''}
                  {happinessInfo.foodVariety}
                </span>
              </li>
            </ul>
          </Accordion>
        ) : (
          <Accordion
            key={g.title}
            title={g.title}
            defaultOpen={g.defaultOpen}
            contentClassName="p-0"
            noBottomBorder={i === sections.length - 1}
          >
            <ul className="mt-2 space-y-3">
              {g.items.map((r) => (
                <li key={r.id}>
                  <ResourceRow {...r} />
                </li>
              ))}
            </ul>
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
    </Container>
  );
}
