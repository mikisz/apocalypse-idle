import React from 'react';
import useBuilding from '../state/hooks/useBuilding.tsx';
import BuildingRow from './BuildingRow.jsx';

export default function BuildingRowContainer({ building, completedResearch }) {
  const props = useBuilding(building, completedResearch);
  return <BuildingRow building={building} {...props} />;
}
