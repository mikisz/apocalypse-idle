import React from 'react';
import { useGame } from '../state/useGame.tsx';
import EventLog from '../components/EventLog.jsx';
import ResourceSidebar from '../components/ResourceSidebar.jsx';
import Accordion from '../components/Accordion.jsx';
import CandidateBox from '../components/CandidateBox.tsx';
import ProductionSection from '../components/ProductionSection.jsx';
import { useBuildingGroups } from '../components/useBuildingGroups.tsx';

export default function BaseView() {
  const { state } = useGame();
  const { productionGroups, storageBuildings, completedResearch } =
    useBuildingGroups();

  return (
    <div className="h-full flex flex-col md:flex-row md:space-x-6 overflow-y-auto md:overflow-hidden p-4">
      <div className="pb-24 md:w-64 md:flex-shrink-0">
        <ResourceSidebar />
      </div>
      <div className="flex-1 space-y-6 pb-24 md:overflow-y-auto">
        <CandidateBox />
        <ProductionSection
          productionGroups={productionGroups}
          storageBuildings={storageBuildings}
          completedResearch={completedResearch}
        />
        <div className="border border-border rounded-xl overflow-hidden">
          <Accordion title="Change Log" contentClassName="p-0" noBottomBorder={true}>
            <EventLog log={state.log} />
          </Accordion>
        </div>
      </div>
    </div>
  );
}
