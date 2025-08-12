import React from 'react';
import Accordion from './Accordion.jsx';
import BuildingRow from './BuildingRow.jsx';

export default function ProductionSection({
  productionGroups = [],
  storageBuildings = [],
  completedResearch = [],
}) {
  return (
    <div className="border border-border rounded">
      {productionGroups.map((group) => (
        <Accordion key={group.name} title={group.name} defaultOpen>
          {group.buildings.map((b) => (
            <BuildingRow
              key={b.id}
              building={b}
              completedResearch={completedResearch}
            />
          ))}
        </Accordion>
      ))}
      <Accordion title="Storage">
        {storageBuildings.map((b) => (
          <BuildingRow
            key={b.id}
            building={b}
            completedResearch={completedResearch}
          />
        ))}
      </Accordion>
    </div>
  );
}
