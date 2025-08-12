import React from 'react';
import Accordion from './Accordion.jsx';
import BuildingRow from './BuildingRow.jsx';
import { Card, CardContent } from './ui/card';

export default function ProductionSection({
  productionGroups = [],
  storageBuildings = [],
  completedResearch = [],
}) {
  return (
    <div className="space-y-4">
      {productionGroups.map((group) => (
        <Card key={group.name}>
          <CardContent className="p-0">
            <Accordion title={group.name} defaultOpen>
              {group.buildings.map((b) => (
                <BuildingRow
                  key={b.id}
                  building={b}
                  completedResearch={completedResearch}
                />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-0">
          <Accordion title="Storage">
            {storageBuildings.map((b) => (
              <BuildingRow
                key={b.id}
                building={b}
                completedResearch={completedResearch}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}