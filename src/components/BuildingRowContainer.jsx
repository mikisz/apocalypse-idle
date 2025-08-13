import React from 'react';
import useBuilding from '../state/hooks/useBuilding.tsx';
import BuildingRow from './BuildingRow.jsx';

export default function BuildingRowContainer({ building, completedResearch }) {
  const { isDesiredOn, resourceShortage, onToggle, ...rest } = useBuilding(
    building,
    completedResearch,
  );
  return (
    <BuildingRow
      building={building}
      isDesiredOn={isDesiredOn}
      resourceShortage={resourceShortage}
      onToggle={onToggle}
      {...rest}
    />
  );
}
