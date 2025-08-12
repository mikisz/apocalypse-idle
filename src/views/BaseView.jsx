import React from 'react';
import { useGame } from '../state/useGame.ts';
import EventLog from '../components/EventLog.jsx';
import ResourceSidebar from '../components/ResourceSidebar.jsx';
import Accordion from '../components/Accordion.jsx';
import CandidateBox from '../components/CandidateBox.tsx';
import ProductionSection from '../components/ProductionSection.jsx';
import { useBuildingGroups } from '../components/useBuildingGroups.ts';

export default function BaseView() {
  const { state } = useGame();
  const { productionGroups, storageBuildings, completedResearch } =
    useBuildingGroups();

  return (
    <div className="h-full flex flex-col md:flex-row md:space-x-6 overflow-y-auto md:overflow-hidden">
      <div className="p-4 pb-20 md:w-64 md:flex-shrink-0 md:overflow-y-auto">
        <ResourceSidebar />
      </div>
      <div className="flex-1 p-4 space-y-6 pb-20 md:overflow-y-auto">
        <CandidateBox />
        <ProductionSection
          productionGroups={productionGroups}
          storageBuildings={storageBuildings}
          completedResearch={completedResearch}
        />
        <div className="border border-border rounded">
          <Accordion title="Change Log">
            <EventLog log={state.log} />
          </Accordion>
        </div>
      </div>
    </div>
  );
}
