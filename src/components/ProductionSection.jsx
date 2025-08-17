import React from 'react';
import Accordion from './Accordion.jsx';
import BuildingRow from './BuildingRowContainer.jsx';
import { Card, CardContent } from './ui/card';

export default function ProductionSection({
  productionGroups = [],
  storageBuildings = [],
  completedResearch = [],
}) {
  return (
    <div className="space-y-4">
      {productionGroups.map((group) => (
        <Card key={group.name} className="overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <Accordion
              title={group.name}
              defaultOpen
              contentClassName="p-0"
              noBottomBorder
            >
              <div className="space-y-4">
                {group.buildings.map((b) => (
                  <div className="space-y-2" key={b.id}>
                    <BuildingRow
                      building={b}
                      completedResearch={completedResearch}
                    />
                  </div>
                ))}
              </div>
            </Accordion>
          </CardContent>
        </Card>
      ))}

      <Card className="overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <Accordion title="Storage" noBottomBorder contentClassName="p-0">
            <div className="space-y-4">
              {storageBuildings.map((b) => (
                <div className="space-y-2" key={b.id}>
                  <BuildingRow
                    building={b}
                    completedResearch={completedResearch}
                  />
                </div>
              ))}
            </div>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
